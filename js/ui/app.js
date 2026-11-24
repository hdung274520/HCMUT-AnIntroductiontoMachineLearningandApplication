/**
 * UI Controller chính của ML Interactive Lab (js/ui/app.js)
 * Bố cục 3 vùng tối giản: Rail điều hướng + Sidebar tìm kiếm bài học đánh số + Workspace đa chế độ
 * ('theory' | 'playground' | 'split').
 */
window.MLStudioApp = (function () {
  const MODULE_GROUPS = [
    { heading: 'NỀN TẢNG & MÔ HÌNH CỔ ĐIỂN', indices: [0, 1, 2] },
    { heading: 'HỌC SÂU & CHỦ ĐỀ NÂNG CAO', indices: [3, 4, 5] }
  ];

  let currentModuleIndex = 0;
  let currentSubtab = 'theory';   // 'theory' | 'exercises' | 'quiz'
  let currentViewMode = 'theory'; // 'theory' | 'playground' | 'split'
  let currentLabIndex = 0;
  let searchQuery = '';
  let quizUserAnswers = {};
  let isRunningCode = false;
  let isOutputExpanded = false;
  let toastTimer = null;

  function getModules() {
    return window.COURSE_MODULES || [];
  }

  function renderMath(container) {
    if (typeof renderMathInElement === 'function' && container) {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function updatePyodideBadge(state, message) {
    const badge = document.getElementById('pyodideStatusBadge');
    const dot = document.getElementById('pyodideStatusDot');
    const text = document.getElementById('pyodideStatusText');
    if (!badge || !dot || !text) return;

    text.textContent = message;
    badge.className = 'flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono border mb-2 transition-colors ';

    if (state === 'loading') {
      badge.className += 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
      dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0';
    } else if (state === 'ready') {
      badge.className += 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
    } else {
      badge.className += 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 cursor-pointer';
      dot.className = 'w-2 h-2 rounded-full bg-rose-400 shrink-0';
    }
  }

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-2');
    }, 2200);
  }

  /**
   * Render danh sách Module đánh số (01..06) bên Sidebar kèm lọc tìm kiếm thời gian thực
   */
  function renderModuleSidebar() {
    const modules = getModules();
    const container = document.getElementById('moduleListContainer');
    if (!container) return;

    const q = searchQuery.trim().toLowerCase();
    let html = '';
    let matchCount = 0;

    MODULE_GROUPS.forEach((group) => {
      const itemsHtml = group.indices
        .map((idx) => {
          const mod = modules[idx];
          if (!mod) return '';
          const haystack = `${mod.title} ${mod.subtitle} ${mod.tags.join(' ')} ${mod.labs.map(l => l.title).join(' ')}`.toLowerCase();
          if (q && !haystack.includes(q)) return '';

          matchCount++;
          const numStr = String(idx + 1).padStart(2, '0');
          const isActive = idx === currentModuleIndex;

          return `
            <button type="button" data-sidebar-module="${idx}"
                    class="w-full text-left px-3 py-2.5 rounded-lg border transition cursor-pointer flex items-start gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isActive
                        ? 'bg-white dark:bg-surface-800 border-slate-300 dark:border-slate-700/90 text-slate-900 dark:text-white shadow-xs'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-surface-850 hover:text-slate-900 dark:hover:text-slate-200'
                    }">
              <span class="font-mono text-[11px] font-semibold mt-0.5 shrink-0 ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              }">${numStr}</span>
              <span class="text-[13px] leading-snug ${isActive ? 'font-semibold' : 'font-normal'}">${mod.title}</span>
            </button>
          `;
        })
        .filter(Boolean)
        .join('');

      if (itemsHtml) {
        html += `
          <div>
            <div class="px-2.5 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ${group.heading}
            </div>
            <div class="space-y-1">${itemsHtml}</div>
          </div>
        `;
      }
    });

    if (matchCount === 0) {
      html = `
        <div class="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Không tìm thấy bài học phù hợp với từ khóa "<strong>${searchQuery}</strong>".
        </div>
      `;
    }

    container.innerHTML = html;

    const prevBtn = document.getElementById('prevModuleBtn');
    const nextBtn = document.getElementById('nextModuleBtn');
    if (prevBtn) prevBtn.disabled = (currentModuleIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentModuleIndex === modules.length - 1);
  }

  /**
   * Cập nhật chế độ hiển thị: 'theory' (chỉ đọc), 'playground' (chỉ code), hoặc 'split' (song song 2 cột)
   */
  function setViewMode(mode) {
    currentViewMode = mode;
    const workspace = document.getElementById('workspaceContainer');
    const theoryPane = document.getElementById('theoryPane');
    const playgroundPane = document.getElementById('playgroundPane');
    const resizer = document.getElementById('paneResizer');
    const sidebar = document.getElementById('lessonSidebar');
    const readingWrapper = document.getElementById('readingMaxWrapper');
    const quickSplitLabel = document.getElementById('quickSplitLabel');

    // Cập nhật trạng thái nút trên App Rail & Mobile Header
    document.querySelectorAll('.rail-nav-btn').forEach((btn) => {
      const active = btn.dataset.modeSwitch === mode;
      btn.className = 'rail-nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ' + (
        active
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-surface-850 border border-transparent'
      );
    });

    document.querySelectorAll('.mobile-mode-btn').forEach((btn) => {
      const active = btn.dataset.modeSwitch === mode || (mode === 'split' && btn.dataset.modeSwitch === 'playground');
      btn.className = 'mobile-mode-btn px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition ' + (
        active
          ? 'bg-white dark:bg-surface-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
          : 'text-slate-600 dark:text-slate-400'
      );
    });

    workspace.classList.remove('split-active');

    if (mode === 'theory') {
      theoryPane.classList.remove('hidden');
      theoryPane.classList.add('flex');
      playgroundPane.classList.add('hidden');
      playgroundPane.classList.remove('flex');
      resizer.classList.add('hidden');
      resizer.classList.remove('lg:flex');
      sidebar.classList.add('lg:flex');
      readingWrapper.classList.add('max-w-4xl');
      if (quickSplitLabel) quickSplitLabel.textContent = 'Mở Code song song';
    } else if (mode === 'playground') {
      theoryPane.classList.add('hidden');
      theoryPane.classList.remove('flex');
      playgroundPane.classList.remove('hidden');
      playgroundPane.classList.add('flex');
      resizer.classList.add('hidden');
      resizer.classList.remove('lg:flex');
      sidebar.classList.add('lg:flex');
      setTimeout(() => EditorManager.refresh(), 30);
    } else {
      // Chế độ Song song (Dual-Pane)
      workspace.classList.add('split-active');
      theoryPane.classList.remove('hidden');
      theoryPane.classList.add('flex');
      playgroundPane.classList.remove('hidden');
      playgroundPane.classList.add('flex');
      resizer.classList.remove('hidden');
      resizer.classList.add('lg:flex');
      // Ở chế độ 2 cột, ẩn bớt sidebar mục lục trên desktop để tối ưu không gian code + lý thuyết
      sidebar.classList.remove('lg:flex');
      readingWrapper.classList.remove('max-w-4xl');
      if (quickSplitLabel) quickSplitLabel.textContent = 'Thu về chế độ đọc';
      setTimeout(() => EditorManager.refresh(), 30);
    }
  }

  /**
   * Render phần nội dung Lý thuyết / Bài tập / Trắc nghiệm của Module đang chọn
   */
  function renderLeftPane() {
    const mod = getModules()[currentModuleIndex];
    if (!mod) return;

    const hero = document.getElementById('moduleHeroCard');
    const body = document.getElementById('leftDynamicBody');

    hero.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <span class="font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          EE3169 • ${mod.badge}
        </span>
        <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          ${mod.labs.length} Labs Python • ${mod.exercises.length} Bài tập mẫu
        </span>
      </div>
      <h2 class="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
        ${mod.title}
      </h2>
      <p class="mt-2 text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
        ${mod.subtitle}
      </p>
      <div class="mt-4 flex flex-wrap gap-1.5">
        ${mod.tags.map((t) => `
          <span class="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-medium bg-slate-100 dark:bg-surface-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
            ${t}
          </span>
        `).join('')}
      </div>
    `;

    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      const isSelected = btn.dataset.subtab === currentSubtab;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.className = 'subtab-btn px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ' + (
        isSelected
          ? 'bg-white dark:bg-surface-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      );
    });

    if (currentSubtab === 'theory') {
      body.innerHTML = `
        ${mod.theoryHtml}
        <div class="mt-8 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Thực hành &amp; Kiểm chứng thuật toán</p>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-0">Giải các bài tập toán chi tiết hoặc mở Playground để chạy trực tiếp code Python.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button type="button" data-goto-subtab="exercises"
                    class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-200/80 hover:bg-slate-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-slate-800 dark:text-slate-200 transition cursor-pointer">
              Xem bài tập mẫu
            </button>
            <button type="button" data-open-playground="true"
                    class="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer">
              Thực hành Playground →
            </button>
          </div>
        </div>
      `;
    } else if (currentSubtab === 'exercises') {
      body.innerHTML = `
        <div class="space-y-5">
          ${mod.exercises.map((ex, exIdx) => `
            <article class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-900/70 p-4 sm:p-5">
              <div class="flex items-start justify-between gap-2 mb-2.5">
                <h3 class="!mt-0 !mb-0 !pb-0 !border-b-0 text-base font-bold text-slate-900 dark:text-white">
                  ${ex.title}
                </h3>
                <span class="px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 whitespace-nowrap">
                  Bài tập mẫu
                </span>
              </div>
              <div class="text-sm text-slate-700 dark:text-slate-300">
                ${ex.problemHtml}
              </div>
              <div class="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <button type="button" data-toggle-sol="${exIdx}"
                        class="toggle-sol-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-surface-850 hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer">
                  Xem lời giải từng bước
                </button>
                <button type="button" data-verify-ex="${exIdx}"
                        class="verify-ex-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition cursor-pointer">
                  Chạy code kiểm chứng →
                </button>
              </div>
              <div id="ex-sol-${exIdx}" class="hidden mt-4 p-4 rounded-xl bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-2">
                ${ex.solutionHtml}
              </div>
            </article>
          `).join('')}
        </div>
      `;
    } else {
      body.innerHTML = `
        <div class="space-y-4">
          ${mod.quiz.map((item, qIdx) => {
            const key = `${currentModuleIndex}-${qIdx}`;
            const chosen = quizUserAnswers[key];
            const hasAnswered = chosen !== undefined;

            return `
              <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-900/70 p-4 sm:p-5">
                <p class="font-semibold text-slate-900 dark:text-white mb-3">
                  Câu ${qIdx + 1}: ${item.q}
                </p>
                <div class="space-y-2">
                  ${item.options.map((opt, optIdx) => {
                    let styleCls = 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 bg-white dark:bg-surface-850';
                    if (hasAnswered) {
                      if (optIdx === item.answer) {
                        styleCls = 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (optIdx === chosen && chosen !== item.answer) {
                        styleCls = 'border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-200';
                      } else {
                        styleCls = 'border-slate-200 dark:border-slate-800 opacity-60';
                      }
                    }
                    return `
                      <button type="button" data-quiz-q="${qIdx}" data-quiz-opt="${optIdx}"
                              class="quiz-opt-btn w-full text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm transition cursor-pointer flex items-start gap-2.5 ${styleCls}">
                        <span class="font-mono font-bold shrink-0">${String.fromCharCode(65 + optIdx)}.</span>
                        <span>${opt}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
                ${hasAnswered ? `
                  <div class="mt-3 p-3 rounded-lg text-xs leading-relaxed ${
                    chosen === item.answer
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                  }">
                    <strong>${chosen === item.answer ? '✓ Chính xác!' : '✗ Chưa đúng.'}</strong> ${item.explain}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    renderMath(body);
  }

  function renderLabSelectorAndLoadDefault() {
    const mod = getModules()[currentModuleIndex];
    if (!mod) return;

    const labSelect = document.getElementById('labTemplateSelect');
    labSelect.innerHTML = mod.labs.map((lab, idx) =>
      `<option value="${idx}">${lab.title}</option>`
    ).join('');
    currentLabIndex = 0;
    labSelect.value = '0';
    EditorManager.setCode(mod.labs[0].code);
  }

  function closeMobileDrawer() {
    const sidebar = document.getElementById('lessonSidebar');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }

  function openMobileDrawer() {
    const sidebar = document.getElementById('lessonSidebar');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
  }

  function selectModule(index) {
    const modules = getModules();
    if (!modules.length) return;
    currentModuleIndex = Math.max(0, Math.min(modules.length - 1, index));
    renderModuleSidebar();
    renderLeftPane();
    renderLabSelectorAndLoadDefault();
    document.getElementById('leftContentScroll').scrollTop = 0;
    closeMobileDrawer();
  }

  function setSubtab(subtab) {
    currentSubtab = subtab;
    renderLeftPane();
  }

  async function runCurrentCode() {
    if (isRunningCode) return;
    const userCode = EditorManager.getCode();
    if (!userCode.trim()) {
      showToast('Trình biên tập đang trống — hãy nhập hoặc nạp code mẫu!');
      return;
    }

    isRunningCode = true;
    const runBtn = document.getElementById('runCodeBtn');
    const iconPlay = document.getElementById('runIconPlay');
    const iconSpin = document.getElementById('runIconSpinner');
    const btnLabel = document.getElementById('runBtnLabel');

    runBtn.disabled = true;
    iconPlay.classList.add('hidden');
    iconSpin.classList.remove('hidden');
    btnLabel.textContent = 'Đang chạy...';

    const placeholder = document.getElementById('outputPlaceholder');
    const stdoutEl = document.getElementById('consoleStdout');
    const stderrEl = document.getElementById('consoleStderr');
    const galleryEl = document.getElementById('matplotlibGallery');
    const timeBadge = document.getElementById('execTimeBadge');
    const plotBadge = document.getElementById('plotCountBadge');

    placeholder.classList.add('hidden');
    stdoutEl.classList.remove('hidden');
    stdoutEl.textContent = '⏳ Đang thực thi mã Python trên WebAssembly...';
    stderrEl.classList.add('hidden');
    galleryEl.classList.add('hidden');
    galleryEl.innerHTML = '';
    timeBadge.classList.add('hidden');
    plotBadge.classList.add('hidden');

    try {
      const res = await PyodideRunner.execute(userCode);

      timeBadge.textContent = `${res.elapsedMs} ms`;
      timeBadge.classList.remove('hidden');

      if (res.stdout) {
        stdoutEl.textContent = res.stdout;
        stdoutEl.classList.remove('hidden');
      } else if (res.ok && res.plotsBase64.length === 0) {
        stdoutEl.textContent = '✓ Thực thi thành công (Không có dữ liệu in ra Console).';
        stdoutEl.classList.remove('hidden');
      } else {
        stdoutEl.classList.add('hidden');
      }

      if (res.stderr) {
        stderrEl.textContent = res.stderr;
        stderrEl.classList.remove('hidden');
      }

      if (res.plotsBase64.length > 0) {
        plotBadge.textContent = `${res.plotsBase64.length} biểu đồ`;
        plotBadge.classList.remove('hidden');
        galleryEl.classList.remove('hidden');

        res.plotsBase64.forEach((b64, idx) => {
          const dataUrl = `data:image/png;base64,${b64}`;
          const card = document.createElement('div');
          card.className = 'rounded-xl overflow-hidden border border-slate-800 bg-white shadow-md';
          card.innerHTML = `
            <div class="px-3 py-1.5 bg-surface-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span class="font-mono font-medium">Figure ${idx + 1} — Matplotlib</span>
              <div class="flex items-center gap-2">
                <button type="button" data-zoom-src="${dataUrl}"
                        class="zoom-plot-btn px-2 py-0.5 rounded bg-surface-850 hover:bg-emerald-600 text-slate-200 hover:text-white transition cursor-pointer">
                  Phóng to
                </button>
                <a href="${dataUrl}" download="ml-plot-module-${currentModuleIndex + 1}-fig-${idx + 1}.png"
                   class="px-2 py-0.5 rounded bg-surface-850 hover:bg-emerald-600 text-slate-200 hover:text-white transition">
                  Tải PNG
                </a>
              </div>
            </div>
            <div class="p-2 flex justify-center bg-white">
              <img src="${dataUrl}" alt="Biểu đồ Matplotlib ${idx + 1}" class="max-w-full h-auto rounded cursor-zoom-in zoom-plot-img" />
            </div>
          `;
          galleryEl.appendChild(card);
        });
      }
    } finally {
      isRunningCode = false;
      runBtn.disabled = false;
      iconSpin.classList.add('hidden');
      iconPlay.classList.remove('hidden');
      btnLabel.textContent = 'Chạy Code';
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('ml_studio_theme', isDark ? 'dark' : 'light');
  }

  function bindEvents() {
    // Chuyển chế độ Lý thuyết / Playground / Song song
    document.querySelectorAll('[data-mode-switch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setViewMode(btn.dataset.modeSwitch);
        closeMobileDrawer();
      });
    });

    document.getElementById('quickSplitBtn').addEventListener('click', () => {
      setViewMode(currentViewMode === 'split' ? 'theory' : 'split');
    });

    // Tìm kiếm & chọn bài học trong Sidebar
    document.getElementById('moduleSearchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderModuleSidebar();
    });

    document.getElementById('moduleListContainer').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-sidebar-module]');
      if (btn) selectModule(Number(btn.dataset.sidebarModule));
    });

    document.getElementById('prevModuleBtn').addEventListener('click', () => selectModule(currentModuleIndex - 1));
    document.getElementById('nextModuleBtn').addEventListener('click', () => selectModule(currentModuleIndex + 1));

    // Mobile drawer controls
    document.getElementById('mobileMenuBtn').addEventListener('click', openMobileDrawer);
    document.getElementById('closeSidebarBtn').addEventListener('click', closeMobileDrawer);
    document.getElementById('mobileDrawerBackdrop').addEventListener('click', closeMobileDrawer);

    // Sub-tabs Lý thuyết / Bài tập / Trắc nghiệm
    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => setSubtab(btn.dataset.subtab));
    });

    // Tương tác bên trong vùng nội dung
    document.getElementById('leftDynamicBody').addEventListener('click', (e) => {
      const gotoBtn = e.target.closest('[data-goto-subtab]');
      if (gotoBtn) {
        setSubtab(gotoBtn.dataset.gotoSubtab);
        return;
      }

      const openPlayBtn = e.target.closest('[data-open-playground]');
      if (openPlayBtn) {
        setViewMode(window.innerWidth >= 1024 ? 'split' : 'playground');
        return;
      }

      const solBtn = e.target.closest('[data-toggle-sol]');
      if (solBtn) {
        const idx = solBtn.dataset.toggleSol;
        const solBox = document.getElementById(`ex-sol-${idx}`);
        const willShow = solBox.classList.contains('hidden');
        solBox.classList.toggle('hidden');
        solBtn.textContent = willShow ? 'Ẩn lời giải chi tiết' : 'Xem lời giải từng bước';
        if (willShow) renderMath(solBox);
        return;
      }

      const verifyBtn = e.target.closest('[data-verify-ex]');
      if (verifyBtn) {
        const exIdx = Number(verifyBtn.dataset.verifyEx);
        const ex = getModules()[currentModuleIndex].exercises[exIdx];
        EditorManager.setCode(ex.verifyCode);
        setViewMode(window.innerWidth >= 1024 ? 'split' : 'playground');
        showToast(`Đã nạp code kiểm chứng "${ex.title.split(':')[0]}"!`);
        return;
      }

      const quizBtn = e.target.closest('.quiz-opt-btn');
      if (quizBtn) {
        const qIdx = Number(quizBtn.dataset.quizQ);
        const optIdx = Number(quizBtn.dataset.quizOpt);
        quizUserAnswers[`${currentModuleIndex}-${qIdx}`] = optIdx;
        renderLeftPane();
      }
    });

    // Playground toolbar
    document.getElementById('labTemplateSelect').addEventListener('change', (e) => {
      currentLabIndex = Number(e.target.value);
      const lab = getModules()[currentModuleIndex].labs[currentLabIndex];
      EditorManager.setCode(lab.code);
      showToast(`Đã chọn ${lab.title.split(':')[0]}`);
    });

    document.getElementById('loadSampleBtn').addEventListener('click', () => {
      const lab = getModules()[currentModuleIndex].labs[currentLabIndex];
      EditorManager.setCode(lab.code);
      showToast('Đã nạp lại code mẫu chuẩn!');
    });

    document.getElementById('runCodeBtn').addEventListener('click', () => runCurrentCode());

    document.getElementById('pyodideStatusBadge').addEventListener('click', () => {
      if (!PyodideRunner.isReadyOrLoading()) {
        PyodideRunner.ensureReady().catch((err) => console.error(err));
      }
    });

    document.getElementById('clearOutputBtn').addEventListener('click', () => {
      document.getElementById('consoleStdout').classList.add('hidden');
      document.getElementById('consoleStderr').classList.add('hidden');
      document.getElementById('matplotlibGallery').classList.add('hidden');
      document.getElementById('matplotlibGallery').innerHTML = '';
      document.getElementById('execTimeBadge').classList.add('hidden');
      document.getElementById('plotCountBadge').classList.add('hidden');
      document.getElementById('outputPlaceholder').classList.remove('hidden');
    });

    document.getElementById('toggleOutputExpandBtn').addEventListener('click', (e) => {
      isOutputExpanded = !isOutputExpanded;
      document.documentElement.style.setProperty('--editor-height', isOutputExpanded ? '24%' : '55%');
      e.currentTarget.textContent = isOutputExpanded ? 'Thu gọn Output' : 'Phóng to Output';
      EditorManager.refresh();
    });

    document.getElementById('matplotlibGallery').addEventListener('click', (e) => {
      const btn = e.target.closest('.zoom-plot-btn');
      const img = e.target.closest('.zoom-plot-img');
      const src = btn ? btn.dataset.zoomSrc : (img ? img.src : null);
      if (src) {
        document.getElementById('modalImage').src = src;
        document.getElementById('imageModal').classList.remove('hidden');
      }
    });

    const closeModal = () => document.getElementById('imageModal').classList.add('hidden');
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('imageModal').addEventListener('click', (e) => {
      if (e.target.id === 'imageModal') closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeMobileDrawer();
      }
    });

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('mobileThemeBtn').addEventListener('click', toggleTheme);

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMobileDrawer();
      } else if (currentViewMode === 'split') {
        setViewMode('playground');
      }
    });
  }

  function init() {
    const savedTheme = localStorage.getItem('ml_studio_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    EditorManager.init('codeEditorTextarea', runCurrentCode);
    SplitResizer.init(() => EditorManager.refresh());
    PyodideRunner.onStatusChange(updatePyodideBadge);

    bindEvents();
    selectModule(0);
    setViewMode('theory');

    PyodideRunner.ensureReady().catch((err) => console.error('Pyodide init warning:', err));
  }

  return { init, selectModule, setSubtab, setViewMode, runCurrentCode };
})();

window.addEventListener('DOMContentLoaded', () => {
  window.MLStudioApp.init();
});
