/**
 * UI Controller chính của ứng dụng ML Interactive Studio (js/ui/app.js)
 * Điều phối danh sách bài học (COURSE_MODULES), hiển thị công thức toán KaTeX,
 * tương tác Bài tập mẫu / Trắc nghiệm và kết nối EditorManager + PyodideRunner.
 */
window.MLStudioApp = (function () {
  let currentModuleIndex = 0;
  let currentSubtab = 'theory';   // 'theory' | 'exercises' | 'quiz'
  let currentLabIndex = 0;
  let quizUserAnswers = {};       // Khóa `${moduleIdx}-${qIdx}` -> chỉ số đáp án
  let isRunningCode = false;
  let isOutputExpanded = false;
  let toastTimer = null;

  function getModules() {
    return window.COURSE_MODULES || [];
  }

  /**
   * Render công thức toán học LaTeX ($...$ và $$...$$) bằng KaTeX Auto-render
   */
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

  /**
   * Cập nhật huy hiệu trạng thái khởi tạo Pyodide trên thanh Header
   */
  function updatePyodideBadge(state, message) {
    const badge = document.getElementById('pyodideStatusBadge');
    const dot = document.getElementById('pyodideStatusDot');
    const text = document.getElementById('pyodideStatusText');
    if (!badge || !dot || !text) return;

    text.textContent = message;
    badge.className = 'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ';

    if (state === 'loading') {
      badge.className += 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70';
      dot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
    } else if (state === 'ready') {
      badge.className += 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70';
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
    } else {
      badge.className += 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/70 cursor-pointer';
      dot.className = 'w-2 h-2 rounded-full bg-rose-500';
    }
  }

  /**
   * Hiển thị thông báo ngắn góc dưới bên phải
   */
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
   * Đồng bộ thanh chọn Module trên Header & Dropdown cột trái
   */
  function renderNavigationControls() {
    const modules = getModules();
    const selectEl = document.getElementById('moduleSelect');
    const desktopNav = document.getElementById('desktopModuleNav');

    selectEl.innerHTML = modules.map((m, idx) =>
      `<option value="${idx}">Module ${idx + 1}: ${m.title}</option>`
    ).join('');
    selectEl.value = String(currentModuleIndex);

    desktopNav.innerHTML = modules.map((m, idx) => {
      const active = idx === currentModuleIndex;
      return `
        <button type="button" data-nav-module="${idx}"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }">
          ${m.shortLabel}
        </button>
      `;
    }).join('');

    document.getElementById('prevModuleBtn').disabled = (currentModuleIndex === 0);
    document.getElementById('nextModuleBtn').disabled = (currentModuleIndex === modules.length - 1);
  }

  /**
   * Render nội dung cột trái theo Subtab hiện hành (theory / exercises / quiz)
   */
  function renderLeftPane() {
    const mod = getModules()[currentModuleIndex];
    if (!mod) return;

    const hero = document.getElementById('moduleHeroCard');
    const body = document.getElementById('leftDynamicBody');

    hero.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider bg-indigo-600 text-white">
          ${mod.badge}
        </span>
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
          ${mod.labs.length} bài thực hành Python • ${mod.exercises.length} bài tập mẫu
        </span>
      </div>
      <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        ${mod.title}
      </h2>
      <p class="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        ${mod.subtitle}
      </p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        ${mod.tags.map((t) => `
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/90 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-slate-700 whitespace-nowrap">
            ${t}
          </span>
        `).join('')}
      </div>
    `;

    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      const isSelected = btn.dataset.subtab === currentSubtab;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.className = 'subtab-btn py-1.5 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ' + (
        isSelected
          ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      );
    });

    if (currentSubtab === 'theory') {
      body.innerHTML = `
        ${mod.theoryHtml}
        <div class="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Sẵn sàng áp dụng lý thuyết vào thực nghiệm?</p>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-0">Chuyển sang tab Bài tập mẫu hoặc chạy trực tiếp các Lab Python ở cột bên phải.</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" data-goto-subtab="exercises"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer">
              Giải bài tập mẫu →
            </button>
          </div>
        </div>
      `;
    } else if (currentSubtab === 'exercises') {
      body.innerHTML = `
        <div class="space-y-4">
          ${mod.exercises.map((ex, exIdx) => `
            <article class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="!mt-0 !mb-0 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  ${ex.title}
                </h3>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap">
                  Tự luận & Tính toán
                </span>
              </div>
              <div class="text-sm text-slate-700 dark:text-slate-300">
                ${ex.problemHtml}
              </div>
              <div class="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <button type="button" data-toggle-sol="${exIdx}"
                        class="toggle-sol-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 dark:text-indigo-300 transition cursor-pointer">
                  Xem lời giải từng bước
                </button>
                <button type="button" data-verify-ex="${exIdx}"
                        class="verify-ex-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer">
                  Nạp code kiểm chứng sang cột phải →
                </button>
              </div>
              <div id="ex-sol-${exIdx}" class="hidden mt-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-2">
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
              <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
                <p class="font-bold text-slate-900 dark:text-white mb-3">
                  Câu ${qIdx + 1}: ${item.q}
                </p>
                <div class="space-y-2">
                  ${item.options.map((opt, optIdx) => {
                    let styleCls = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/70 dark:bg-slate-800/50';
                    if (hasAnswered) {
                      if (optIdx === item.answer) {
                        styleCls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (optIdx === chosen && chosen !== item.answer) {
                        styleCls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                      } else {
                        styleCls = 'border-slate-200 dark:border-slate-800 opacity-65';
                      }
                    }
                    return `
                      <button type="button" data-quiz-q="${qIdx}" data-quiz-opt="${optIdx}"
                              class="quiz-opt-btn w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition cursor-pointer flex items-start gap-2.5 ${styleCls}">
                        <span class="font-mono font-bold shrink-0">${String.fromCharCode(65 + optIdx)}.</span>
                        <span>${opt}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
                ${hasAnswered ? `
                  <div class="mt-3 p-3 rounded-xl text-xs leading-relaxed ${
                    chosen === item.answer
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
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

  /**
   * Nạp danh sách Lab mẫu của Module hiện tại vào cột phải
   */
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

  function selectModule(index) {
    const modules = getModules();
    if (!modules.length) return;
    currentModuleIndex = Math.max(0, Math.min(modules.length - 1, index));
    renderNavigationControls();
    renderLeftPane();
    renderLabSelectorAndLoadDefault();
    document.getElementById('leftContentScroll').scrollTop = 0;
  }

  function setSubtab(subtab) {
    currentSubtab = subtab;
    renderLeftPane();
  }

  /**
   * Thực thi mã Python từ trình soạn thảo và cập nhật vùng Console + Matplotlib Gallery
   */
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
            <div class="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span class="font-medium">Hình ${idx + 1} — Matplotlib Output</span>
              <div class="flex items-center gap-2">
                <button type="button" data-zoom-src="${dataUrl}"
                        class="zoom-plot-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition cursor-pointer">
                  Phóng to
                </button>
                <a href="${dataUrl}" download="ml-plot-module-${currentModuleIndex + 1}-fig-${idx + 1}.png"
                   class="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition">
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

  /**
   * Chuyển đổi chế độ xem trên màn hình nhỏ (< 1024px)
   */
  function switchMobileView(pane) {
    const left = document.getElementById('leftPane');
    const right = document.getElementById('rightPane');
    const btnTheory = document.getElementById('mobileTabTheory');
    const btnCode = document.getElementById('mobileTabCode');

    if (window.innerWidth >= 1024) {
      left.classList.remove('hidden');
      right.classList.remove('hidden');
      right.classList.add('flex');
      EditorManager.refresh();
      return;
    }

    if (pane === 'code') {
      left.classList.add('hidden');
      right.classList.remove('hidden');
      right.classList.add('flex');
      btnCode.className = 'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm cursor-pointer';
      btnTheory.className = 'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer';
      setTimeout(() => EditorManager.refresh(), 30);
    } else {
      right.classList.add('hidden');
      right.classList.remove('flex');
      left.classList.remove('hidden');
      btnTheory.className = 'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm cursor-pointer';
      btnCode.className = 'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer';
    }
  }

  function bindEvents() {
    document.getElementById('moduleSelect').addEventListener('change', (e) => {
      selectModule(Number(e.target.value));
    });

    document.getElementById('desktopModuleNav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-nav-module]');
      if (btn) selectModule(Number(btn.dataset.navModule));
    });

    document.getElementById('prevModuleBtn').addEventListener('click', () => selectModule(currentModuleIndex - 1));
    document.getElementById('nextModuleBtn').addEventListener('click', () => selectModule(currentModuleIndex + 1));

    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => setSubtab(btn.dataset.subtab));
    });

    document.getElementById('leftDynamicBody').addEventListener('click', (e) => {
      const gotoBtn = e.target.closest('[data-goto-subtab]');
      if (gotoBtn) {
        setSubtab(gotoBtn.dataset.gotoSubtab);
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
        switchMobileView('code');
        showToast(`Đã nạp code kiểm chứng "${ex.title.split(':')[0]}" vào Editor!`);
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

    document.getElementById('labTemplateSelect').addEventListener('change', (e) => {
      currentLabIndex = Number(e.target.value);
      const lab = getModules()[currentModuleIndex].labs[currentLabIndex];
      EditorManager.setCode(lab.code);
      showToast(`Đã chuyển sang ${lab.title.split(':')[0]}`);
    });

    document.getElementById('loadSampleBtn').addEventListener('click', () => {
      const lab = getModules()[currentModuleIndex].labs[currentLabIndex];
      EditorManager.setCode(lab.code);
      showToast('Đã nạp lại code mẫu chuẩn vào trình biên tập!');
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
      document.documentElement.style.setProperty('--editor-height', isOutputExpanded ? '24%' : '54%');
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
      if (e.key === 'Escape') closeModal();
    });

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('ml_studio_theme', isDark ? 'dark' : 'light');
    });

    document.getElementById('mobileTabTheory').addEventListener('click', () => switchMobileView('theory'));
    document.getElementById('mobileTabCode').addEventListener('click', () => switchMobileView('code'));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) switchMobileView('desktop');
    });
  }

  function init() {
    if (localStorage.getItem('ml_studio_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }

    EditorManager.init('codeEditorTextarea', runCurrentCode);
    SplitResizer.init(() => EditorManager.refresh());
    PyodideRunner.onStatusChange(updatePyodideBadge);

    bindEvents();
    selectModule(0);

    PyodideRunner.ensureReady().catch((err) => console.error('Pyodide init warning:', err));
  }

  return { init, selectModule, setSubtab, runCurrentCode };
})();

window.addEventListener('DOMContentLoaded', () => {
  window.MLStudioApp.init();
});
