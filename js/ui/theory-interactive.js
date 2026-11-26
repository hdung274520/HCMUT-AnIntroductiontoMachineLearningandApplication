/**
 * Mô-đun Tương tác cho Phần Lý thuyết — ML Interactive Lab (js/ui/theory-interactive.js)
 * Bao gồm:
 *  1. Mục lục nhảy nhanh theo đề mục (Quick ToC) trong bài đọc Lý thuyết
 *  2. Thẻ Kiểm tra nhanh hiểu bài (Inline Quick-Check) ngay sau các phần trọng tâm
 *  3. 6 trình mô phỏng trực quan tương tác HTML5 Canvas cho từng Module 1..6
 */
window.TheoryInteractive = (function () {
  let activeCleanups = [];
  let activeRedraws = [];

  function registerCleanup(fn) {
    if (typeof fn === 'function') activeCleanups.push(fn);
  }

  function registerRedraw(fn) {
    if (typeof fn === 'function') activeRedraws.push(fn);
  }

  function destroy() {
    while (activeCleanups.length) {
      const fn = activeCleanups.pop();
      try { fn(); } catch (_) {}
    }
    activeRedraws = [];
  }

  function redrawActive() {
    activeRedraws.forEach((fn) => {
      try { fn(); } catch (_) {}
    });
  }

  function getTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      isDark,
      bg: isDark ? '#0b1016' : '#ffffff',
      bgSubtle: isDark ? '#0e141b' : '#f8fafc',
      grid: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(100, 116, 139, 0.18)',
      axis: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(71, 85, 105, 0.5)',
      text: isDark ? '#cbd5e1' : '#334155',
      muted: isDark ? '#94a3b8' : '#64748b',
      emerald: '#10b981',
      indigo: '#6366f1',
      amber: '#f59e0b',
      rose: '#ef4444',
      sky: '#0ea5e9',
      pointBorder: isDark ? '#0b1016' : '#ffffff'
    };
  }

  function setupCanvas(canvas, desiredHeight) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
    const width = Math.max(280, Math.floor(parentW || canvas.clientWidth || 560));
    const height = desiredHeight;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function getCanvasPos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function makeMapper(xMin, xMax, yMin, yMax, width, height, pad) {
    const p = pad || { l: 42, r: 16, t: 16, b: 30 };
    const plotW = Math.max(40, width - p.l - p.r);
    const plotH = Math.max(40, height - p.t - p.b);
    return {
      pad: p,
      plotW,
      plotH,
      toPx(x, y) {
        return {
          x: p.l + ((x - xMin) / (xMax - xMin)) * plotW,
          y: p.t + ((yMax - y) / (yMax - yMin)) * plotH
        };
      },
      toData(px, py) {
        return {
          x: xMin + ((px - p.l) / plotW) * (xMax - xMin),
          y: yMax - ((py - p.t) / plotH) * (yMax - yMin)
        };
      }
    };
  }

  function drawGridAndAxes(ctx, pal, mapper, xMin, xMax, yMin, yMax, xStep, yStep, xLabel, yLabel) {
    const { pad, plotW, plotH } = mapper;
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, pad.l + plotW + pad.r, pad.t + plotH + pad.b);

    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.font = '10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = pal.muted;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let xv = Math.ceil(xMin / xStep) * xStep; xv <= xMax + 1e-9; xv += xStep) {
      const val = Math.abs(xv) < 1e-9 ? 0 : Number(xv.toFixed(2));
      const { x } = mapper.toPx(val, yMin);
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, pad.t + plotH);
      ctx.stroke();
      ctx.fillText(String(val), x, pad.t + plotH + 5);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + 1e-9; yv += yStep) {
      const val = Math.abs(yv) < 1e-9 ? 0 : Number(yv.toFixed(2));
      const { y } = mapper.toPx(xMin, val);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + plotW, y);
      ctx.stroke();
      ctx.fillText(String(val), pad.l - 6, y);
    }

    // Origin axes if inside range
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.2;
    if (xMin <= 0 && xMax >= 0) {
      const ox = mapper.toPx(0, 0).x;
      ctx.beginPath();
      ctx.moveTo(ox, pad.t);
      ctx.lineTo(ox, pad.t + plotH);
      ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      const oy = mapper.toPx(0, 0).y;
      ctx.beginPath();
      ctx.moveTo(pad.l, oy);
      ctx.lineTo(pad.l + plotW, oy);
      ctx.stroke();
    }

    // Plot border
    ctx.strokeStyle = pal.grid;
    ctx.strokeRect(pad.l, pad.t, plotW, plotH);

    if (xLabel) {
      ctx.fillStyle = pal.muted;
      ctx.font = '10.5px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(xLabel, pad.l + plotW - 4, pad.t + plotH - 4);
    }
    if (yLabel) {
      ctx.fillStyle = pal.muted;
      ctx.font = '10.5px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(yLabel, pad.l + 5, pad.t + 4);
    }
  }

  function buildQuickToc(containerEl) {
    const headings = Array.from(containerEl.querySelectorAll('h3'));
    const labMount = containerEl.querySelector('[data-interactive-lab]');
    if (!headings.length && !labMount) return;

    const nav = document.createElement('div');
    nav.className = 'mb-6 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5';

    const label = document.createElement('span');
    label.className = 'text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1.5';
    label.textContent = 'Mục lục nhanh:';
    nav.appendChild(label);

    headings.forEach((h, idx) => {
      const secId = `theory-sec-${idx + 1}`;
      h.id = secId;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer';
      btn.textContent = h.textContent.trim();
      btn.addEventListener('click', () => {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nav.appendChild(btn);
    });

    if (labMount) {
      labMount.id = 'interactive-lab-anchor';
      const labBtn = document.createElement('button');
      labBtn.type = 'button';
      labBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer';
      labBtn.textContent = '⚡ Mô phỏng tương tác';
      labBtn.addEventListener('click', () => {
        labMount.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      nav.appendChild(labBtn);
    }

    containerEl.insertBefore(nav, containerEl.firstChild);
  }

  function bindQuickChecks(containerEl) {
    const cards = containerEl.querySelectorAll('.theory-quick-check');
    cards.forEach((card) => {
      const correctIdx = Number(card.dataset.answer);
      const explainEl = card.querySelector('.qc-explain');
      const feedbackEl = card.querySelector('.qc-feedback');
      const buttons = card.querySelectorAll('.qc-opt-btn');

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const chosen = Number(btn.dataset.qcOpt);
          const isOk = chosen === correctIdx;

          buttons.forEach((b) => {
            const idx = Number(b.dataset.qcOpt);
            b.className = 'qc-opt-btn px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ';
            if (idx === correctIdx) {
              b.className += 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold';
            } else if (idx === chosen && !isOk) {
              b.className += 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200';
            } else {
              b.className += 'border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-850 opacity-60';
            }
          });

          if (feedbackEl) {
            const explainHtml = explainEl ? explainEl.innerHTML : '';
            feedbackEl.className = `qc-feedback mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed border ${
              isOk
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30'
            }`;
            feedbackEl.innerHTML = `<strong>${isOk ? '✓ Chính xác!' : '✗ Chưa đúng.'}</strong> ${explainHtml}`;
            if (typeof renderMathInElement === 'function') {
              renderMathInElement(feedbackEl, {
                delimiters: [
                  { left: '$$', right: '$$', display: true },
                  { left: '$', right: '$', display: false }
                ],
                throwOnError: false
              });
            }
          }
        });
      });
    });
  }

  // ==========================================================================
  // MODULE 1: MÔ PHỎNG GRADIENT DESCENT 2D (CONTOUR & LEARNING RATE)
  // ==========================================================================
  function buildModule1(mountEl) {
    // f(w1, w2) = 2w1^2 + w2^2 + 2w1w2 - 6w1 - 4w2 + 5 = (w1-1)^2 + (w1+w2-2)^2
    const f = (w1, w2) => 2 * w1 * w1 + w2 * w2 + 2 * w1 * w2 - 6 * w1 - 4 * w2 + 5;
    const grad = (w1, w2) => [4 * w1 + 2 * w2 - 6, 2 * w1 + 2 * w2 - 4];
    const ETA_MAX = 2 / (3 + Math.sqrt(5)); // ~0.381966

    let lr = 0.20;
    let startPt = [0.0, 0.0];
    let trajectory = [[0.0, 0.0]];
    let timerId = null;

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 01</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Khảo sát Gradient Descent trên Đường đồng mức 2D</h4>
          </div>
          <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Click biểu đồ để đổi điểm xuất phát w⁽⁰⁾</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m1-canvas class="block cursor-crosshair"></canvas>
          </div>

          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-semibold text-slate-700 dark:text-slate-200">Tốc độ học $\\eta$:</label>
                <span data-m1-lr-val class="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.20</span>
              </div>
              <input data-m1-lr type="range" min="0.02" max="0.48" step="0.01" value="0.20" class="interactive-range w-full" />
              <div class="flex flex-wrap gap-1.5 pt-1">
                <button type="button" data-m1-preset="0.10" class="px-2 py-1 rounded bg-slate-100 dark:bg-surface-850 hover:border-emerald-500 border border-slate-200 dark:border-slate-700 font-mono text-[11px] cursor-pointer">η=0.10 Mượt</button>
                <button type="button" data-m1-preset="0.20" class="px-2 py-1 rounded bg-slate-100 dark:bg-surface-850 hover:border-emerald-500 border border-slate-200 dark:border-slate-700 font-mono text-[11px] cursor-pointer">η=0.20 (BT 1.1)</button>
                <button type="button" data-m1-preset="0.36" class="px-2 py-1 rounded bg-slate-100 dark:bg-surface-850 hover:border-emerald-500 border border-slate-200 dark:border-slate-700 font-mono text-[11px] cursor-pointer">η=0.36 Dao động</button>
                <button type="button" data-m1-preset="0.42" class="px-2 py-1 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer">η=0.42 Phân kỳ</button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button type="button" data-m1-step class="flex-1 px-3 py-1.5 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer">Bước +1</button>
              <button type="button" data-m1-play class="flex-1 px-3 py-1.5 rounded-lg font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition cursor-pointer">Tự chạy</button>
              <button type="button" data-m1-reset class="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-800 transition cursor-pointer">Đặt lại</button>
            </div>

            <div data-m1-stats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>
      </div>
    `;

    const canvas = mountEl.querySelector('[data-m1-canvas]');
    const lrSlider = mountEl.querySelector('[data-m1-lr]');
    const lrLabel = mountEl.querySelector('[data-m1-lr-val]');
    const playBtn = mountEl.querySelector('[data-m1-play]');
    const statsEl = mountEl.querySelector('[data-m1-stats]');

    function stopAuto() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
        playBtn.textContent = 'Tự chạy';
      }
    }
    registerCleanup(stopAuto);

    function stepOnce() {
      const cur = trajectory[trajectory.length - 1];
      const [g1, g2] = grad(cur[0], cur[1]);
      if (Math.hypot(g1, g2) < 1e-4 || Math.hypot(cur[0], cur[1]) > 40 || trajectory.length > 80) {
        stopAuto();
        return;
      }
      trajectory.push([cur[0] - lr * g1, cur[1] - lr * g2]);
      draw();
    }

    function draw() {
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(canvas, 300);
      const map = makeMapper(-2.0, 3.5, -2.0, 3.5, width, height);
      drawGridAndAxes(ctx, pal, map, -2, 3.5, -2, 3.5, 1, 1, 'w₁', 'w₂');

      // Exact analytical contour ellipses for (w1-1)^2 + (w1+w2-2)^2 = c
      const levels = [0.08, 0.25, 0.6, 1.2, 2.5, 4.5, 8.0, 13.0, 20.0];
      levels.forEach((c, idx) => {
        const r = Math.sqrt(c);
        ctx.beginPath();
        for (let k = 0; k <= 72; k++) {
          const th = (k / 72) * Math.PI * 2;
          const w1 = 1 + r * Math.cos(th);
          const w2 = 1 + r * (Math.sin(th) - Math.cos(th));
          const pt = map.toPx(w1, w2);
          if (k === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = pal.isDark
          ? `rgba(99, 102, 241, ${0.42 - idx * 0.03})`
          : `rgba(79, 70, 229, ${0.38 - idx * 0.03})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Global minimum w* = (1, 1)
      const optPx = map.toPx(1, 1);
      ctx.fillStyle = pal.emerald;
      ctx.beginPath();
      ctx.arc(optPx.x, optPx.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pal.pointBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = pal.emerald;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('w* (1,1)', optPx.x + 8, optPx.y - 4);

      // Trajectory segments
      if (trajectory.length > 1) {
        ctx.strokeStyle = pal.rose;
        ctx.lineWidth = 2;
        ctx.beginPath();
        trajectory.forEach((pt, idx) => {
          const p = map.toPx(pt[0], pt[1]);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // Points & gradient direction arrow at current step
      trajectory.forEach((pt, idx) => {
        const p = map.toPx(pt[0], pt[1]);
        const isStart = idx === 0;
        const isLast = idx === trajectory.length - 1;
        ctx.fillStyle = isStart ? pal.amber : (isLast ? pal.rose : pal.sky);
        ctx.beginPath();
        ctx.arc(p.x, p.y, isLast || isStart ? 5 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.pointBorder;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      const cur = trajectory[trajectory.length - 1];
      const [g1, g2] = grad(cur[0], cur[1]);
      const pCur = map.toPx(cur[0], cur[1]);
      const pNext = map.toPx(cur[0] - lr * g1, cur[1] - lr * g2);
      if (Math.hypot(pNext.x - pCur.x, pNext.y - pCur.y) > 4) {
        ctx.save();
        ctx.strokeStyle = pal.amber;
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pCur.x, pCur.y);
        ctx.lineTo(pNext.x, pNext.y);
        ctx.stroke();
        ctx.restore();
      }

      // Stats update
      const loss = f(cur[0], cur[1]);
      const gNorm = Math.hypot(g1, g2);
      const t = trajectory.length - 1;
      let statusBadge = '';
      if (lr > ETA_MAX) {
        statusBadge = `<span class="inline-block px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">Phân kỳ! η &gt; ${ETA_MAX.toFixed(3)}</span>`;
      } else if (gNorm < 1e-3) {
        statusBadge = `<span class="inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">Đã hội tụ gần w*</span>`;
      } else if (lr > 0.28) {
        statusBadge = `<span class="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">Dao động mạnh quanh đáy</span>`;
      } else {
        statusBadge = `<span class="inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">Hội tụ ổn định</span>`;
      }

      statsEl.innerHTML = `
        <div class="flex justify-between"><span>Bước lặp t:</span><strong>${t}</strong></div>
        <div class="flex justify-between"><span>w⁽ᵗ⁾:</span><strong>[${cur[0].toFixed(3)}, ${cur[1].toFixed(3)}]</strong></div>
        <div class="flex justify-between"><span>∇f(w⁽ᵗ⁾):</span><span>[${g1.toFixed(3)}, ${g2.toFixed(3)}]</span></div>
        <div class="flex justify-between"><span>Loss f(w⁽ᵗ⁾):</span><strong class="text-indigo-600 dark:text-indigo-400">${loss.toFixed(4)}</strong></div>
        <div class="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <span>Trạng thái:</span>${statusBadge}
        </div>
      `;
    }

    lrSlider.addEventListener('input', () => {
      lr = Number(lrSlider.value);
      lrLabel.textContent = lr.toFixed(2);
      trajectory = [startPt.slice()];
      draw();
    });

    mountEl.querySelectorAll('[data-m1-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopAuto();
        lr = Number(btn.dataset.m1Preset);
        lrSlider.value = String(lr);
        lrLabel.textContent = lr.toFixed(2);
        trajectory = [startPt.slice()];
        draw();
      });
    });

    mountEl.querySelector('[data-m1-step]').addEventListener('click', () => {
      stopAuto();
      stepOnce();
    });

    playBtn.addEventListener('click', () => {
      if (timerId !== null) {
        stopAuto();
      } else {
        playBtn.textContent = 'Tạm dừng';
        timerId = setInterval(stepOnce, 220);
      }
    });

    mountEl.querySelector('[data-m1-reset]').addEventListener('click', () => {
      stopAuto();
      startPt = [0.0, 0.0];
      trajectory = [[0.0, 0.0]];
      draw();
    });

    canvas.addEventListener('click', (evt) => {
      stopAuto();
      const pos = getCanvasPos(canvas, evt);
      const map = makeMapper(-2.0, 3.5, -2.0, 3.5, canvas.clientWidth, 300);
      const data = map.toData(pos.x, pos.y);
      startPt = [
        Math.max(-1.9, Math.min(3.4, Number(data.x.toFixed(2)))),
        Math.max(-1.9, Math.min(3.4, Number(data.y.toFixed(2))))
      ];
      trajectory = [startPt.slice()];
      draw();
    });

    registerRedraw(draw);
    draw();
  }

  // ==========================================================================
  // MODULE 2: TUYẾN TÍNH (RIDGE L2 & LOGISTIC SIGMOID)
  // ==========================================================================
  function buildModule2(mountEl) {
    let activeTab = 'ridge';
    const basePoints = [
      { x: 1.5, y: 1.2 }, { x: 2.8, y: 1.9 }, { x: 4.0, y: 2.3 },
      { x: 5.2, y: 2.9 }, { x: 6.8, y: 3.5 }, { x: 8.2, y: 4.4 }
    ];
    let points = basePoints.map((p) => ({ ...p }));
    let lambdaVal = 0.0;

    // Logistic state (defaults match BT 2.2)
    let w1 = 0.8, w2 = 0.5, b = -5.2;
    let testPt = { x1: 4.0, x2: 7.0 };

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 02</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Thử nghiệm Hồi quy Tuyến tính (Ridge) &amp; Logistic Sigmoid</h4>
          </div>
          <div class="flex items-center gap-1 bg-slate-200/75 dark:bg-surface-850 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button type="button" data-m2-tab="ridge" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">1. Linear &amp; Ridge L₂</button>
            <button type="button" data-m2-tab="logistic" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">2. Logistic &amp; Sigmoid</button>
          </div>
        </div>

        <!-- TAB 1: RIDGE -->
        <div data-m2-panel="ridge" class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m2-ridge-canvas class="block cursor-crosshair"></canvas>
          </div>
          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex justify-between">
                <label class="font-semibold text-slate-700 dark:text-slate-200">Hệ số phạt Ridge $\\lambda$:</label>
                <span data-m2-lam-val class="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.0</span>
              </div>
              <input data-m2-lam type="range" min="0" max="15" step="0.2" value="0" class="interactive-range w-full" />
              <p class="text-[11px] text-slate-500 dark:text-slate-400 m-0">Click lên biểu đồ để thêm điểm dữ liệu mới và quan sát độ co trọng số $w_1$.</p>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" data-m2-bt21 class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer">Dữ liệu BT 2.1</button>
              <button type="button" data-m2-outlier class="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium cursor-pointer">+ Thêm ngoại lai</button>
              <button type="button" data-m2-reset class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer">Đặt lại</button>
            </div>
            <div data-m2-ridge-stats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>

        <!-- TAB 2: LOGISTIC -->
        <div data-m2-panel="logistic" class="hidden space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
              <canvas data-m2-log-2d class="block cursor-crosshair"></canvas>
            </div>
            <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
              <canvas data-m2-log-sig class="block"></canvas>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div class="md:col-span-7 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div class="flex justify-between mb-1"><span>w₁:</span><strong data-m2-w1v class="font-mono text-emerald-500">0.8</strong></div>
                <input data-m2-w1 type="range" min="-2" max="2" step="0.1" value="0.8" class="interactive-range w-full" />
              </div>
              <div>
                <div class="flex justify-between mb-1"><span>w₂:</span><strong data-m2-w2v class="font-mono text-emerald-500">0.5</strong></div>
                <input data-m2-w2 type="range" min="-2" max="2" step="0.1" value="0.5" class="interactive-range w-full" />
              </div>
              <div>
                <div class="flex justify-between mb-1"><span>bias b:</span><strong data-m2-bv class="font-mono text-emerald-500">-5.2</strong></div>
                <input data-m2-b type="range" min="-10" max="4" step="0.2" value="-5.2" class="interactive-range w-full" />
              </div>
            </div>
            <div data-m2-log-stats class="md:col-span-5 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>
      </div>
    `;

    const ridgeCanvas = mountEl.querySelector('[data-m2-ridge-canvas]');
    const lamSlider = mountEl.querySelector('[data-m2-lam]');
    const lamVal = mountEl.querySelector('[data-m2-lam-val]');
    const ridgeStats = mountEl.querySelector('[data-m2-ridge-stats]');

    const log2dCanvas = mountEl.querySelector('[data-m2-log-2d]');
    const logSigCanvas = mountEl.querySelector('[data-m2-log-sig]');
    const logStats = mountEl.querySelector('[data-m2-log-stats]');
    const w1In = mountEl.querySelector('[data-m2-w1]');
    const w2In = mountEl.querySelector('[data-m2-w2]');
    const bIn = mountEl.querySelector('[data-m2-b]');

    function fitLinear(pts, lam) {
      const n = pts.length;
      const xMean = pts.reduce((s, p) => s + p.x, 0) / n;
      const yMean = pts.reduce((s, p) => s + p.y, 0) / n;
      let sxx = 0, sxy = 0, syy = 0;
      pts.forEach((p) => {
        const dx = p.x - xMean;
        const dy = p.y - yMean;
        sxx += dx * dx;
        sxy += dx * dy;
        syy += dy * dy;
      });
      const w1Fit = sxx + n * lam > 1e-9 ? sxy / (sxx + n * lam) : 0;
      const w0Fit = yMean - w1Fit * xMean;
      let sse = 0;
      pts.forEach((p) => {
        const err = p.y - (w1Fit * p.x + w0Fit);
        sse += err * err;
      });
      const mse = sse / n;
      const r2 = syy > 1e-9 ? 1 - sse / syy : 1;
      return { w0: w0Fit, w1: w1Fit, mse, r2 };
    }

    function drawRidge() {
      if (activeTab !== 'ridge') return;
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(ridgeCanvas, 280);
      const map = makeMapper(0, 10, 0, 6, width, height);
      drawGridAndAxes(ctx, pal, map, 0, 10, 0, 6, 2, 1, 'x', 'y');

      const ols = fitLinear(points, 0);
      const ridge = fitLinear(points, lambdaVal);

      // OLS dashed line
      ctx.save();
      ctx.strokeStyle = pal.muted;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.6;
      const oA = map.toPx(0, ols.w0);
      const oB = map.toPx(10, ols.w1 * 10 + ols.w0);
      ctx.beginPath();
      ctx.moveTo(oA.x, oA.y);
      ctx.lineTo(oB.x, oB.y);
      ctx.stroke();
      ctx.restore();

      // Residual lines for active Ridge model
      ctx.strokeStyle = pal.isDark ? 'rgba(244,63,94,0.45)' : 'rgba(225,29,72,0.4)';
      ctx.lineWidth = 1.2;
      points.forEach((p) => {
        const py = ridge.w1 * p.x + ridge.w0;
        const a = map.toPx(p.x, p.y);
        const bPt = map.toPx(p.x, py);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bPt.x, bPt.y);
        ctx.stroke();
      });

      // Ridge solid line
      ctx.strokeStyle = pal.emerald;
      ctx.lineWidth = 2.4;
      const rA = map.toPx(0, ridge.w0);
      const rB = map.toPx(10, ridge.w1 * 10 + ridge.w0);
      ctx.beginPath();
      ctx.moveTo(rA.x, rA.y);
      ctx.lineTo(rB.x, rB.y);
      ctx.stroke();

      // Data points
      points.forEach((p) => {
        const px = map.toPx(p.x, p.y);
        ctx.fillStyle = pal.sky;
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.pointBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ridgeStats.innerHTML = `
        <div class="flex justify-between"><span>Số điểm mẫu N:</span><strong>${points.length}</strong></div>
        <div class="flex justify-between"><span>OLS (λ=0):</span><span>ŷ = ${ols.w1.toFixed(3)}x + ${ols.w0.toFixed(3)}</span></div>
        <div class="flex justify-between"><span>Ridge (λ=${lambdaVal.toFixed(1)}):</span><strong class="text-emerald-600 dark:text-emerald-400">ŷ = ${ridge.w1.toFixed(3)}x + ${ridge.w0.toFixed(3)}</strong></div>
        <div class="flex justify-between"><span>MSE hiện tại:</span><span>${ridge.mse.toFixed(4)} | R² = ${ridge.r2.toFixed(4)}</span></div>
      `;
    }

    function drawLogistic() {
      if (activeTab !== 'logistic') return;
      const pal = getTheme();
      const sig = (z) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));

      // Left canvas: 2D decision map
      const c2 = setupCanvas(log2dCanvas, 240);
      const map2 = makeMapper(0, 10, 0, 10, c2.width, c2.height);
      const ctx2 = c2.ctx;
      ctx2.fillStyle = pal.bg;
      ctx2.fillRect(0, 0, c2.width, c2.height);

      // Probability heatmap cells inside plot area
      const nx = 30, ny = 24;
      const cw = map2.plotW / nx, ch = map2.plotH / ny;
      for (let ix = 0; ix < nx; ix++) {
        for (let iy = 0; iy < ny; iy++) {
          const px = map2.pad.l + (ix + 0.5) * cw;
          const py = map2.pad.t + (iy + 0.5) * ch;
          const d = map2.toData(px, py);
          const p = sig(w1 * d.x + w2 * d.y + b);
          const alpha = Math.abs(p - 0.5) * 0.45;
          ctx2.fillStyle = p >= 0.5 ? `rgba(16, 185, 129, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
          ctx2.fillRect(map2.pad.l + ix * cw, map2.pad.t + iy * ch, cw + 0.6, ch + 0.6);
        }
      }

      // Draw grid overlay without erasing background
      ctx2.strokeStyle = pal.grid;
      ctx2.lineWidth = 1;
      ctx2.strokeRect(map2.pad.l, map2.pad.t, map2.plotW, map2.plotH);
      ctx2.font = '10px "JetBrains Mono", monospace';
      ctx2.fillStyle = pal.muted;
      ctx2.textAlign = 'center';
      ctx2.textBaseline = 'top';
      for (let t = 0; t <= 10; t += 2) {
        const p = map2.toPx(t, 0);
        ctx2.fillText(String(t), p.x, map2.pad.t + map2.plotH + 5);
      }
      ctx2.textAlign = 'right';
      ctx2.textBaseline = 'middle';
      for (let t = 0; t <= 10; t += 2) {
        const p = map2.toPx(0, t);
        ctx2.fillText(String(t), map2.pad.l - 5, p.y);
      }

      // Decision line w1*x1 + w2*x2 + b = 0 clipped to box
      ctx2.save();
      ctx2.beginPath();
      ctx2.rect(map2.pad.l, map2.pad.t, map2.plotW, map2.plotH);
      ctx2.clip();
      if (Math.abs(w2) > 1e-4 || Math.abs(w1) > 1e-4) {
        let pA, pB;
        if (Math.abs(w2) >= Math.abs(w1)) {
          pA = map2.toPx(-2, -(w1 * -2 + b) / w2);
          pB = map2.toPx(12, -(w1 * 12 + b) / w2);
        } else {
          pA = map2.toPx(-(w2 * -2 + b) / w1, -2);
          pB = map2.toPx(-(w2 * 12 + b) / w1, 12);
        }
        ctx2.strokeStyle = pal.isDark ? '#f8fafc' : '#0f172a';
        ctx2.lineWidth = 2.2;
        ctx2.beginPath();
        ctx2.moveTo(pA.x, pA.y);
        ctx2.lineTo(pB.x, pB.y);
        ctx2.stroke();
      }
      ctx2.restore();

      // Test point (click to move)
      const tpPx = map2.toPx(testPt.x1, testPt.x2);
      const zVal = w1 * testPt.x1 + w2 * testPt.x2 + b;
      const pVal = sig(zVal);
      ctx2.fillStyle = pVal >= 0.5 ? pal.emerald : pal.rose;
      ctx2.beginPath();
      ctx2.arc(tpPx.x, tpPx.y, 6.5, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.strokeStyle = pal.pointBorder;
      ctx2.lineWidth = 2;
      ctx2.stroke();
      ctx2.fillStyle = pal.text;
      ctx2.font = 'bold 10.5px "JetBrains Mono", monospace';
      ctx2.textAlign = 'left';
      ctx2.textBaseline = 'bottom';
      ctx2.fillText(`x=(${testPt.x1.toFixed(1)}, ${testPt.x2.toFixed(1)})`, Math.min(c2.width - 96, tpPx.x + 8), Math.max(24, tpPx.y - 6));

      // Right canvas: Sigmoid curve
      const cs = setupCanvas(logSigCanvas, 240);
      const mapS = makeMapper(-6, 6, 0, 1, cs.width, cs.height);
      const ctxS = cs.ctx;
      drawGridAndAxes(ctxS, pal, mapS, -6, 6, 0, 1, 2, 0.25, 'z = wᵀx + b', 'σ(z)');

      // Threshold 0.5 dashed
      ctxS.save();
      ctxS.strokeStyle = pal.muted;
      ctxS.setLineDash([4, 4]);
      const pMid = mapS.toPx(-6, 0.5);
      const pMidR = mapS.toPx(6, 0.5);
      ctxS.beginPath();
      ctxS.moveTo(pMid.x, pMid.y);
      ctxS.lineTo(pMidR.x, pMidR.y);
      ctxS.stroke();
      ctxS.restore();

      ctxS.strokeStyle = pal.indigo;
      ctxS.lineWidth = 2.4;
      ctxS.beginPath();
      for (let i = 0; i <= 120; i++) {
        const zv = -6 + (i / 120) * 12;
        const px = mapS.toPx(zv, sig(zv));
        if (i === 0) ctxS.moveTo(px.x, px.y);
        else ctxS.lineTo(px.x, px.y);
      }
      ctxS.stroke();

      const zClamped = Math.max(-5.8, Math.min(5.8, zVal));
      const dotPx = mapS.toPx(zClamped, pVal);
      ctxS.fillStyle = pVal >= 0.5 ? pal.emerald : pal.rose;
      ctxS.beginPath();
      ctxS.arc(dotPx.x, dotPx.y, 6, 0, Math.PI * 2);
      ctxS.fill();
      ctxS.strokeStyle = pal.pointBorder;
      ctxS.lineWidth = 2;
      ctxS.stroke();

      const bce1 = -Math.log(Math.max(1e-9, pVal));
      const bce0 = -Math.log(Math.max(1e-9, 1 - pVal));
      logStats.innerHTML = `
        <div class="flex justify-between"><span>z = wᵀx + b:</span><strong>${zVal.toFixed(3)}</strong></div>
        <div class="flex justify-between"><span>P(y=1|x) = σ(z):</span><strong class="${pVal >= 0.5 ? 'text-emerald-500' : 'text-rose-500'}">${(pVal * 100).toFixed(2)}%</strong></div>
        <div class="flex justify-between"><span>BCE nếu y=1:</span><span>${bce1.toFixed(4)}</span></div>
        <div class="flex justify-between"><span>BCE nếu y=0:</span><span>${bce0.toFixed(4)}</span></div>
      `;
    }

    function setTab(tab) {
      activeTab = tab;
      mountEl.querySelectorAll('[data-m2-tab]').forEach((btn) => {
        const on = btn.dataset.m2Tab === tab;
        btn.className = 'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ' + (
          on
            ? 'bg-white dark:bg-surface-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        );
      });
      mountEl.querySelectorAll('[data-m2-panel]').forEach((p) => {
        p.classList.toggle('hidden', p.dataset.m2Panel !== tab);
      });
      redrawAll();
    }

    function redrawAll() {
      if (activeTab === 'ridge') drawRidge();
      else drawLogistic();
    }

    mountEl.querySelectorAll('[data-m2-tab]').forEach((btn) => {
      btn.addEventListener('click', () => setTab(btn.dataset.m2Tab));
    });

    lamSlider.addEventListener('input', () => {
      lambdaVal = Number(lamSlider.value);
      lamVal.textContent = lambdaVal.toFixed(1);
      drawRidge();
    });

    ridgeCanvas.addEventListener('click', (evt) => {
      const pos = getCanvasPos(ridgeCanvas, evt);
      const map = makeMapper(0, 10, 0, 6, ridgeCanvas.clientWidth, 280);
      const d = map.toData(pos.x, pos.y);
      if (d.x >= 0 && d.x <= 10 && d.y >= 0 && d.y <= 6) {
        points.push({ x: d.x, y: d.y });
        drawRidge();
      }
    });

    mountEl.querySelector('[data-m2-bt21]').addEventListener('click', () => {
      points = [{ x: 3, y: 1.5 }, { x: 5, y: 2.6 }, { x: 7, y: 3.4 }];
      drawRidge();
    });
    mountEl.querySelector('[data-m2-outlier]').addEventListener('click', () => {
      points.push({ x: 8.8, y: 1.1 });
      drawRidge();
    });
    mountEl.querySelector('[data-m2-reset]').addEventListener('click', () => {
      points = basePoints.map((p) => ({ ...p }));
      lambdaVal = 0;
      lamSlider.value = '0';
      lamVal.textContent = '0.0';
      drawRidge();
    });

    [w1In, w2In, bIn].forEach((inp) => {
      inp.addEventListener('input', () => {
        w1 = Number(w1In.value);
        w2 = Number(w2In.value);
        b = Number(bIn.value);
        mountEl.querySelector('[data-m2-w1v]').textContent = w1.toFixed(1);
        mountEl.querySelector('[data-m2-w2v]').textContent = w2.toFixed(1);
        mountEl.querySelector('[data-m2-bv]').textContent = b.toFixed(1);
        drawLogistic();
      });
    });

    log2dCanvas.addEventListener('click', (evt) => {
      const pos = getCanvasPos(log2dCanvas, evt);
      const map = makeMapper(0, 10, 0, 10, log2dCanvas.clientWidth, 240);
      const d = map.toData(pos.x, pos.y);
      testPt = {
        x1: Math.max(0.1, Math.min(9.9, d.x)),
        x2: Math.max(0.1, Math.min(9.9, d.y))
      };
      drawLogistic();
    });

    registerRedraw(redrawAll);
    setTab('ridge');
  }

  // ==========================================================================
  // MODULE 3: SVM SOFT-MARGIN & KERNEL TRICK (SIMPLIFIED SMO)
  // ==========================================================================
  function buildModule3(mountEl) {
    const DATASETS = {
      linear: [
        [-1.6, -1.2, -1], [-1.3, -0.5, -1], [-1.8, 0.2, -1], [-0.9, -1.5, -1], [-0.6, -0.8, -1],
        [-1.1, 0.7, -1], [-0.4, -1.3, -1], [-1.5, -1.7, -1], [-0.8, -0.2, -1],
        [1.4, 1.3, 1], [1.1, 0.6, 1], [1.7, -0.1, 1], [0.7, 1.5, 1], [0.5, 0.9, 1],
        [1.2, -0.6, 1], [0.3, 1.2, 1], [1.6, 1.7, 1], [0.9, 0.2, 1]
      ],
      noisy: [
        [-1.5, -1.0, -1], [-1.2, -0.3, -1], [-1.7, 0.4, -1], [-0.8, -1.4, -1], [-0.5, -0.6, -1],
        [-1.0, 0.8, -1], [-0.3, -1.1, -1], [0.35, 0.45, -1],
        [1.5, 1.2, 1], [1.1, 0.5, 1], [1.6, -0.2, 1], [0.8, 1.4, 1], [0.4, 0.8, 1],
        [1.2, -0.7, 1], [0.3, 1.3, 1], [-0.35, -0.35, 1]
      ],
      rings: (() => {
        const pts = [];
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          pts.push([0.65 * Math.cos(a), 0.65 * Math.sin(a), 1]);
        }
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2 + 0.15;
          pts.push([1.65 * Math.cos(a), 1.65 * Math.sin(a), -1]);
        }
        return pts;
      })()
    };

    let dataKey = 'noisy';
    let points = DATASETS.noisy.map((p) => ({ x1: p[0], x2: p[1], y: p[2] }));
    let kernelType = 'linear';
    let C = 1.0;
    let gamma = 1.2;
    let clickClass = 1;

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 03</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">SVM Soft-Margin ($C$) &amp; Kernel Trick (RBF $\\gamma$)</h4>
          </div>
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <button type="button" data-m3-ds="linear" class="px-2.5 py-1 rounded-md border font-medium cursor-pointer">Tách tuyến tính</button>
            <button type="button" data-m3-ds="noisy" class="px-2.5 py-1 rounded-md border font-medium cursor-pointer">Có nhiễu</button>
            <button type="button" data-m3-ds="rings" class="px-2.5 py-1 rounded-md border font-medium cursor-pointer">Đồng tâm (Phi tuyến)</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m3-canvas class="block cursor-crosshair"></canvas>
          </div>

          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold">Hàm nhân (Kernel):</span>
                <div class="flex gap-1 bg-slate-100 dark:bg-surface-850 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button type="button" data-m3-kern="linear" class="px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer">Linear</button>
                  <button type="button" data-m3-kern="rbf" class="px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer">RBF</button>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <label class="font-semibold">Tham số phạt $C$:</label>
                  <strong data-m3-cval class="font-mono text-emerald-600 dark:text-emerald-400">1.00</strong>
                </div>
                <input data-m3-c type="range" min="0" max="100" step="1" value="39" class="interactive-range w-full" />
              </div>

              <div data-m3-gamma-wrap class="opacity-50 pointer-events-none">
                <div class="flex justify-between mb-1">
                  <label class="font-semibold">Độ rộng RBF $\\gamma$:</label>
                  <strong data-m3-gval class="font-mono text-indigo-500">1.2</strong>
                </div>
                <input data-m3-g type="range" min="0.2" max="4.5" step="0.1" value="1.2" class="interactive-range w-full" />
              </div>
            </div>

            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span>Click thêm điểm:</span>
                <button type="button" data-m3-cls="1" class="px-2 py-1 rounded text-[11px] font-bold cursor-pointer">+1 (Xanh)</button>
                <button type="button" data-m3-cls="-1" class="px-2 py-1 rounded text-[11px] font-bold cursor-pointer">-1 (Đỏ)</button>
              </div>
              <button type="button" data-m3-reset class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer">Đặt lại</button>
            </div>

            <div data-m3-stats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>
      </div>
    `;

    const canvas = mountEl.querySelector('[data-m3-canvas]');
    const cSlider = mountEl.querySelector('[data-m3-c]');
    const cVal = mountEl.querySelector('[data-m3-cval]');
    const gSlider = mountEl.querySelector('[data-m3-g]');
    const gVal = mountEl.querySelector('[data-m3-gval]');
    const gWrap = mountEl.querySelector('[data-m3-gamma-wrap]');
    const statsEl = mountEl.querySelector('[data-m3-stats]');

    function sliderToC(v) {
      return 0.05 * Math.pow(2000, v / 100);
    }

    function kernelFn(a, bPt) {
      if (kernelType === 'linear') {
        return a.x1 * bPt.x1 + a.x2 * bPt.x2;
      }
      const dx = a.x1 - bPt.x1;
      const dy = a.x2 - bPt.x2;
      return Math.exp(-gamma * (dx * dx + dy * dy));
    }

    function trainSMO() {
      const n = points.length;
      const alphas = new Float64Array(n);
      let bBias = 0;
      if (n < 2) return { alphas, b: 0, predict: () => 0 };

      const K = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => kernelFn(points[i], points[j]))
      );

      let seed = 1337;
      const nextRand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      const tol = 1e-3;
      const maxPasses = 28;
      let passes = 0;
      let iter = 0;

      const evalIdx = (idx) => {
        let sum = bBias;
        for (let k = 0; k < n; k++) {
          if (alphas[k] > 0) sum += alphas[k] * points[k].y * K[k][idx];
        }
        return sum;
      };

      while (passes < maxPasses && iter < 420) {
        let numChanged = 0;
        iter++;
        for (let i = 0; i < n; i++) {
          const yi = points[i].y;
          const Ei = evalIdx(i) - yi;
          if ((yi * Ei < -tol && alphas[i] < C) || (yi * Ei > tol && alphas[i] > 0)) {
            let j = Math.floor(nextRand() * (n - 1));
            if (j >= i) j++;
            const yj = points[j].y;
            const Ej = evalIdx(j) - yj;

            const aiOld = alphas[i];
            const ajOld = alphas[j];
            let L, H;
            if (yi !== yj) {
              L = Math.max(0, ajOld - aiOld);
              H = Math.min(C, C + ajOld - aiOld);
            } else {
              L = Math.max(0, aiOld + ajOld - C);
              H = Math.min(C, aiOld + ajOld);
            }
            if (Math.abs(L - H) < 1e-8) continue;

            const eta = 2 * K[i][j] - K[i][i] - K[j][j];
            if (eta >= -1e-10) continue;

            let ajNew = ajOld - (yj * (Ei - Ej)) / eta;
            if (ajNew > H) ajNew = H;
            else if (ajNew < L) ajNew = L;
            if (Math.abs(ajNew - ajOld) < 1e-5) continue;

            const aiNew = aiOld + yi * yj * (ajOld - ajNew);
            const b1 = bBias - Ei - yi * (aiNew - aiOld) * K[i][i] - yj * (ajNew - ajOld) * K[i][j];
            const b2 = bBias - Ej - yi * (aiNew - aiOld) * K[i][j] - yj * (ajNew - ajOld) * K[j][j];
            if (aiNew > 0 && aiNew < C) bBias = b1;
            else if (ajNew > 0 && ajNew < C) bBias = b2;
            else bBias = 0.5 * (b1 + b2);

            alphas[i] = aiNew;
            alphas[j] = ajNew;
            numChanged++;
          }
        }
        passes = numChanged === 0 ? passes + 1 : 0;
      }

      const svIndices = [];
      for (let i = 0; i < n; i++) {
        if (alphas[i] > 1e-4) svIndices.push(i);
      }

      const predictVal = (x1, x2) => {
        const probe = { x1, x2 };
        let sum = bBias;
        for (let k = 0; k < svIndices.length; k++) {
          const idx = svIndices[k];
          sum += alphas[idx] * points[idx].y * kernelFn(points[idx], probe);
        }
        return sum;
      };

      let w1Lin = 0, w2Lin = 0;
      if (kernelType === 'linear') {
        svIndices.forEach((idx) => {
          w1Lin += alphas[idx] * points[idx].y * points[idx].x1;
          w2Lin += alphas[idx] * points[idx].y * points[idx].x2;
        });
      }

      return { alphas, b: bBias, svIndices, predictVal, w1Lin, w2Lin };
    }

    function drawIsoline(ctx, map, grid, gx, gy, level, color, lineWidth, dashed) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();

      const xMin = -2.5, xMax = 2.5, yMin = -2.5, yMax = 2.5;
      const dx = (xMax - xMin) / (gx - 1);
      const dy = (yMax - yMin) / (gy - 1);

      for (let ix = 0; ix < gx - 1; ix++) {
        for (let iy = 0; iy < gy - 1; iy++) {
          const x0 = xMin + ix * dx, x1 = x0 + dx;
          const y0 = yMin + iy * dy, y1 = y0 + dy;
          const v00 = grid[ix * gy + iy] - level;
          const v10 = grid[(ix + 1) * gy + iy] - level;
          const v11 = grid[(ix + 1) * gy + (iy + 1)] - level;
          const v01 = grid[ix * gy + (iy + 1)] - level;

          const pts = [];
          const interp = (ax, ay, av, bx, by, bv) => {
            if ((av < 0 && bv >= 0) || (av >= 0 && bv < 0)) {
              const t = Math.abs(av) / (Math.abs(av) + Math.abs(bv) + 1e-12);
              pts.push(map.toPx(ax + t * (bx - ax), ay + t * (by - ay)));
            }
          };
          interp(x0, y0, v00, x1, y0, v10);
          interp(x1, y0, v10, x1, y1, v11);
          interp(x1, y1, v11, x0, y1, v01);
          interp(x0, y1, v01, x0, y0, v00);
          if (pts.length >= 2) {
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(canvas, 300);
      const map = makeMapper(-2.5, 2.5, -2.5, 2.5, width, height);
      drawGridAndAxes(ctx, pal, map, -2.5, 2.5, -2.5, 2.5, 1, 1, 'x₁', 'x₂');

      const model = trainSMO();
      const gx = 38, gy = 38;
      const grid = new Float32Array(gx * gy);
      const cw = map.plotW / (gx - 1);
      const ch = map.plotH / (gy - 1);

      for (let ix = 0; ix < gx; ix++) {
        const xv = -2.5 + (ix / (gx - 1)) * 5.0;
        for (let iy = 0; iy < gy; iy++) {
          const yv = -2.5 + (iy / (gy - 1)) * 5.0;
          const val = model.predictVal(xv, yv);
          grid[ix * gy + iy] = val;
          if (ix < gx - 1 && iy < gy - 1) {
            const p = map.toPx(xv, yv);
            const mag = Math.min(1, Math.abs(val) / 1.5);
            const alpha = 0.08 + mag * 0.18;
            ctx.fillStyle = val >= 0 ? `rgba(16, 185, 129, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
            ctx.fillRect(p.x, p.y - ch, cw + 0.6, ch + 0.6);
          }
        }
      }

      // Contours f(x) = -1, 0, +1
      drawIsoline(ctx, map, grid, gx, gy, -1, pal.muted, 1.3, true);
      drawIsoline(ctx, map, grid, gx, gy, 1, pal.muted, 1.3, true);
      drawIsoline(ctx, map, grid, gx, gy, 0, pal.isDark ? '#f8fafc' : '#0f172a', 2.2, false);

      // Points & Support Vector rings
      let correct = 0;
      points.forEach((p, idx) => {
        const pred = model.predictVal(p.x1, p.x2) >= 0 ? 1 : -1;
        if (pred === p.y) correct++;
        const px = map.toPx(p.x1, p.x2);

        if (model.alphas[idx] > 1e-4) {
          ctx.strokeStyle = pal.amber;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(px.x, px.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = p.y === 1 ? pal.emerald : pal.rose;
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.pointBorder;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      const acc = points.length ? (correct / points.length) * 100 : 0;
      const marginTxt = kernelType === 'linear'
        ? (Math.hypot(model.w1Lin, model.w2Lin) > 1e-5
          ? (2 / Math.hypot(model.w1Lin, model.w2Lin)).toFixed(3)
          : '∞')
        : 'Phi tuyến (không gian Kernel)';

      statsEl.innerHTML = `
        <div class="flex justify-between"><span>Độ chính xác Train:</span><strong class="text-emerald-600 dark:text-emerald-400">${acc.toFixed(1)}% (${correct}/${points.length})</strong></div>
        <div class="flex justify-between"><span>Số Support Vectors (vòng vàng):</span><strong class="text-amber-500">${model.svIndices.length} / ${points.length}</strong></div>
        <div class="flex justify-between"><span>Độ rộng Margin 2/‖w‖:</span><span>${marginTxt}</span></div>
      `;
    }

    function syncButtons() {
      mountEl.querySelectorAll('[data-m3-ds]').forEach((b) => {
        const on = b.dataset.m3Ds === dataKey;
        b.className = 'px-2.5 py-1 rounded-md border font-medium cursor-pointer transition ' + (
          on
            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-slate-600 dark:text-slate-300'
        );
      });
      mountEl.querySelectorAll('[data-m3-kern]').forEach((b) => {
        const on = b.dataset.m3Kern === kernelType;
        b.className = 'px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition ' + (
          on ? 'bg-emerald-500 text-slate-950' : 'text-slate-600 dark:text-slate-400'
        );
      });
      gWrap.classList.toggle('opacity-50', kernelType === 'linear');
      gWrap.classList.toggle('pointer-events-none', kernelType === 'linear');

      mountEl.querySelectorAll('[data-m3-cls]').forEach((b) => {
        const cls = Number(b.dataset.m3Cls);
        const on = cls === clickClass;
        b.className = 'px-2 py-1 rounded text-[11px] font-bold cursor-pointer border transition ' + (
          on
            ? (cls === 1 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300')
            : 'border-slate-200 dark:border-slate-700 text-slate-500'
        );
      });
    }

    mountEl.querySelectorAll('[data-m3-ds]').forEach((b) => {
      b.addEventListener('click', () => {
        dataKey = b.dataset.m3Ds;
        points = DATASETS[dataKey].map((p) => ({ x1: p[0], x2: p[1], y: p[2] }));
        if (dataKey === 'rings' && kernelType === 'linear') {
          kernelType = 'rbf';
        }
        syncButtons();
        draw();
      });
    });

    mountEl.querySelectorAll('[data-m3-kern]').forEach((b) => {
      b.addEventListener('click', () => {
        kernelType = b.dataset.m3Kern;
        syncButtons();
        draw();
      });
    });

    mountEl.querySelectorAll('[data-m3-cls]').forEach((b) => {
      b.addEventListener('click', () => {
        clickClass = Number(b.dataset.m3Cls);
        syncButtons();
      });
    });

    cSlider.addEventListener('input', () => {
      C = sliderToC(Number(cSlider.value));
      cVal.textContent = C >= 10 ? C.toFixed(1) : C.toFixed(2);
      draw();
    });

    gSlider.addEventListener('input', () => {
      gamma = Number(gSlider.value);
      gVal.textContent = gamma.toFixed(1);
      draw();
    });

    mountEl.querySelector('[data-m3-reset]').addEventListener('click', () => {
      points = DATASETS[dataKey].map((p) => ({ x1: p[0], x2: p[1], y: p[2] }));
      draw();
    });

    canvas.addEventListener('click', (evt) => {
      if (points.length >= 60) return;
      const pos = getCanvasPos(canvas, evt);
      const map = makeMapper(-2.5, 2.5, -2.5, 2.5, canvas.clientWidth, 300);
      const d = map.toData(pos.x, pos.y);
      if (d.x >= -2.5 && d.x <= 2.5 && d.y >= -2.5 && d.y <= 2.5) {
        points.push({ x1: d.x, x2: d.y, y: clickClass });
        draw();
      }
    });

    C = sliderToC(Number(cSlider.value));
    cVal.textContent = C.toFixed(2);
    syncButtons();
    registerRedraw(draw);
    draw();
  }

  // ==========================================================================
  // MODULE 4: ACTIVATION / VANISHING GRADIENT & CONV2D 6x6
  // ==========================================================================
  function buildModule4(mountEl) {
    let activeTab = 'act';
    let zProbe = 2.0;
    let numLayers = 6;
    const enabled = { sigmoid: true, tanh: true, relu: true, leaky: false };

    const ACT_FNS = {
      sigmoid: {
        name: 'Sigmoid',
        color: '#ef4444',
        fn: (z) => 1 / (1 + Math.exp(-z)),
        df: (z) => { const s = 1 / (1 + Math.exp(-z)); return s * (1 - s); }
      },
      tanh: {
        name: 'Tanh',
        color: '#f59e0b',
        fn: (z) => Math.tanh(z),
        df: (z) => 1 - Math.tanh(z) ** 2
      },
      relu: {
        name: 'ReLU',
        color: '#10b981',
        fn: (z) => Math.max(0, z),
        df: (z) => (z > 0 ? 1 : 0)
      },
      leaky: {
        name: 'Leaky ReLU',
        color: '#0ea5e9',
        fn: (z) => (z >= 0 ? z : 0.1 * z),
        df: (z) => (z >= 0 ? 1 : 0.1)
      }
    };

    const IMG_PRESETS = {
      edgeV: [
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0]
      ],
      edgeH: [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ],
      plus: [
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0]
      ],
      cross: [
        [1, 0, 0, 0, 0, 1],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 1]
      ]
    };

    const KERNELS = {
      sobelX: { label: 'Sobel-X (Cạnh đứng)', m: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] },
      sobelY: { label: 'Sobel-Y (Cạnh ngang)', m: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]] },
      laplace: { label: 'Laplacian (Đường nét)', m: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]] },
      sharpen: { label: 'Sharpen (Làm sắc nét)', m: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] }
    };

    let grid6 = IMG_PRESETS.edgeV.map((r) => r.slice());
    let kernelKey = 'sobelX';
    let padP = 0;
    let strideS = 1;
    let useRelu = true;
    let selectedOut = { r: 0, c: 1 };

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 04</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Hàm Kích hoạt (Vanishing Gradient) &amp; Phép Tích chập Conv2D</h4>
          </div>
          <div class="flex items-center gap-1 bg-slate-200/75 dark:bg-surface-850 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button type="button" data-m4-tab="act" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">1. Activation &amp; Gradient</button>
            <button type="button" data-m4-tab="conv" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">2. Mô phỏng Conv2D</button>
          </div>
        </div>

        <!-- TAB 1: ACTIVATION -->
        <div data-m4-panel="act" class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div class="flex flex-wrap items-center gap-3">
              <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-m4-fn="sigmoid" checked class="accent-rose-500" /><span class="font-medium text-rose-500">Sigmoid</span></label>
              <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-m4-fn="tanh" checked class="accent-amber-500" /><span class="font-medium text-amber-500">Tanh</span></label>
              <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-m4-fn="relu" checked class="accent-emerald-500" /><span class="font-medium text-emerald-500">ReLU</span></label>
              <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-m4-fn="leaky" class="accent-sky-500" /><span class="font-medium text-sky-500">Leaky ReLU</span></label>
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <span>z = <strong data-m4-zv class="font-mono text-emerald-500">2.0</strong></span>
                <input data-m4-z type="range" min="-5" max="5" step="0.1" value="2.0" class="interactive-range w-28" />
              </div>
              <div class="flex items-center gap-2">
                <span>Số tầng L = <strong data-m4-lv class="font-mono text-indigo-500">6</strong></span>
                <input data-m4-l type="range" min="1" max="10" step="1" value="6" class="interactive-range w-24" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
              <canvas data-m4-c1 class="block"></canvas>
            </div>
            <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
              <canvas data-m4-c2 class="block"></canvas>
            </div>
          </div>

          <div data-m4-bars class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"></div>
        </div>

        <!-- TAB 2: CONV2D -->
        <div data-m4-panel="conv" class="hidden space-y-3 text-xs">
          <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-semibold mr-1">Ảnh 6×6:</span>
              <button type="button" data-m4-img="edgeV" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">Cạnh đứng</button>
              <button type="button" data-m4-img="edgeH" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">Cạnh ngang</button>
              <button type="button" data-m4-img="plus" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">Chữ thập +</button>
              <button type="button" data-m4-img="cross" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">Chữ X</button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select data-m4-kselect class="rounded-md bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 px-2 py-1 font-medium cursor-pointer">
                <option value="sobelX">Sobel-X (Cạnh đứng)</option>
                <option value="sobelY">Sobel-Y (Cạnh ngang)</option>
                <option value="laplace">Laplacian (Đường nét)</option>
                <option value="sharpen">Sharpen (Làm nét)</option>
              </select>
              <button type="button" data-m4-pad class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono cursor-pointer">Padding P=0</button>
              <button type="button" data-m4-stride class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono cursor-pointer">Stride S=1</button>
              <button type="button" data-m4-relu class="px-2 py-1 rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono cursor-pointer">ReLU: Bật</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            <div class="md:col-span-5 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800">
              <div class="font-semibold mb-2 text-center">Ảnh đầu vào 6×6 (Click ô để bật/tắt)</div>
              <div data-m4-ingrid class="grid grid-cols-6 gap-1 max-w-[216px] mx-auto"></div>
            </div>
            <div class="md:col-span-2 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 text-center">
              <div class="font-semibold mb-2">Kernel 3×3</div>
              <div data-m4-kgrid class="grid grid-cols-3 gap-1 max-w-[114px] mx-auto font-mono text-[11px]"></div>
            </div>
            <div class="md:col-span-5 p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800">
              <div data-m4-outtitle class="font-semibold mb-2 text-center"></div>
              <div data-m4-outgrid class="gap-1 mx-auto"></div>
            </div>
          </div>

          <div data-m4-convinfo class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"></div>
        </div>
      </div>
    `;

    const c1 = mountEl.querySelector('[data-m4-c1]');
    const c2 = mountEl.querySelector('[data-m4-c2]');
    const barsEl = mountEl.querySelector('[data-m4-bars]');

    function drawActivations() {
      if (activeTab !== 'act') return;
      const pal = getTheme();

      const drawPlot = (canvas, isDeriv, yMin, yMax, yStep, labelY) => {
        const { ctx, width, height } = setupCanvas(canvas, 220);
        const map = makeMapper(-5, 5, yMin, yMax, width, height);
        drawGridAndAxes(ctx, pal, map, -5, 5, yMin, yMax, 2.5, yStep, 'z', labelY);

        // Probe line
        const xp = map.toPx(zProbe, 0).x;
        ctx.save();
        ctx.strokeStyle = pal.muted;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xp, map.pad.t);
        ctx.lineTo(xp, map.pad.t + map.plotH);
        ctx.stroke();
        ctx.restore();

        Object.keys(ACT_FNS).forEach((k) => {
          if (!enabled[k]) return;
          const item = ACT_FNS[k];
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          for (let i = 0; i <= 140; i++) {
            const zv = -5 + (i / 140) * 10;
            const yv = Math.max(yMin, Math.min(yMax, isDeriv ? item.df(zv) : item.fn(zv)));
            const p = map.toPx(zv, yv);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();

          const dotY = Math.max(yMin, Math.min(yMax, isDeriv ? item.df(zProbe) : item.fn(zProbe)));
          const dp = map.toPx(zProbe, dotY);
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      drawPlot(c1, false, -1.2, 4.5, 1, 'g(z)');
      drawPlot(c2, true, -0.2, 1.2, 0.25, "g'(z)");

      // Quantitative vanishing gradient bars
      const rows = Object.keys(ACT_FNS)
        .filter((k) => enabled[k])
        .map((k) => {
          const item = ACT_FNS[k];
          const dVal = item.df(zProbe);
          const chain = Math.pow(Math.abs(dVal), numLayers);
          const pct = Math.min(100, Math.max(1.5, chain * 100));
          return `
            <div class="flex items-center gap-3">
              <span class="w-24 font-semibold shrink-0" style="color:${item.color}">${item.name}</span>
              <span class="w-28 font-mono text-[11px] shrink-0">g'(z) = ${dVal.toFixed(3)}</span>
              <div class="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-surface-850 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-150" style="width:${chain < 1e-4 ? 0 : pct}%; background:${item.color}"></div>
              </div>
              <span class="w-32 text-right font-mono text-[11px] shrink-0">|g'|<sup>${numLayers}</sup> = ${chain.toExponential(2)}</span>
            </div>
          `;
        })
        .join('');
      barsEl.innerHTML = `<div class="font-semibold text-slate-700 dark:text-slate-200 mb-1">Tín hiệu đạo hàm còn lại khi truyền ngược qua <strong>L = ${numLayers}</strong> tầng tại <strong>z = ${zProbe.toFixed(1)}</strong>:</div>${rows}`;
    }

    function renderConv() {
      if (activeTab !== 'conv') return;
      const inGridEl = mountEl.querySelector('[data-m4-ingrid]');
      const kGridEl = mountEl.querySelector('[data-m4-kgrid]');
      const outGridEl = mountEl.querySelector('[data-m4-outgrid]');
      const outTitleEl = mountEl.querySelector('[data-m4-outtitle]');
      const infoEl = mountEl.querySelector('[data-m4-convinfo]');

      const kernel = KERNELS[kernelKey].m;
      const outSize = Math.floor((6 - 3 + 2 * padP) / strideS) + 1;
      selectedOut.r = Math.min(selectedOut.r, outSize - 1);
      selectedOut.c = Math.min(selectedOut.c, outSize - 1);

      const getPadded = (r, c) => {
        const ir = r - padP;
        const ic = c - padP;
        if (ir < 0 || ir >= 6 || ic < 0 || ic >= 6) return 0;
        return grid6[ir][ic];
      };

      const topR = selectedOut.r * strideS - padP;
      const leftC = selectedOut.c * strideS - padP;

      // Render 6x6 input grid
      inGridEl.innerHTML = '';
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const val = grid6[r][c];
          const inWindow = r >= topR && r < topR + 3 && c >= leftC && c < leftC + 3;
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.className = `conv-cell h-8 rounded font-mono text-xs font-bold transition cursor-pointer ${
            val === 1
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-100 dark:bg-surface-850 text-slate-500 dark:text-slate-400'
          } ${inWindow ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-surface-950' : ''}`;
          cell.textContent = String(val);
          cell.addEventListener('click', () => {
            grid6[r][c] = grid6[r][c] ? 0 : 1;
            renderConv();
          });
          inGridEl.appendChild(cell);
        }
      }

      // Render 3x3 Kernel
      kGridEl.innerHTML = kernel.flat().map((v) =>
        `<div class="h-8 flex items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold">${v}</div>`
      ).join('');

      // Compute & render Output feature map
      outTitleEl.textContent = `Feature Map đầu ra ${outSize}×${outSize} (Click ô để soi phép tính)`;
      outGridEl.style.display = 'grid';
      outGridEl.style.gridTemplateColumns = `repeat(${outSize}, minmax(0, 1fr))`;
      outGridEl.style.maxWidth = `${outSize * 38}px`;
      outGridEl.innerHTML = '';

      let detailTerms = [];
      let rawSelected = 0;
      let finalSelected = 0;

      for (let or = 0; or < outSize; or++) {
        for (let oc = 0; oc < outSize; oc++) {
          let sum = 0;
          const terms = [];
          for (let kr = 0; kr < 3; kr++) {
            for (let kc = 0; kc < 3; kc++) {
              const pv = getPadded(or * strideS + kr, oc * strideS + kc);
              const kv = kernel[kr][kc];
              sum += pv * kv;
              if (or === selectedOut.r && oc === selectedOut.c && kv !== 0) {
                terms.push(`${pv}×(${kv})`);
              }
            }
          }
          const outVal = useRelu ? Math.max(0, sum) : sum;
          const isSel = or === selectedOut.r && oc === selectedOut.c;
          if (isSel) {
            rawSelected = sum;
            finalSelected = outVal;
            detailTerms = terms;
          }

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `h-8 rounded font-mono text-[11px] font-bold transition cursor-pointer border ${
            outVal > 0
              ? 'bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 border-emerald-500/40'
              : (outVal < 0 ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/35' : 'bg-slate-100 dark:bg-surface-850 text-slate-500 border-slate-200 dark:border-slate-700')
          } ${isSel ? 'ring-2 ring-amber-400' : ''}`;
          btn.textContent = String(outVal);
          btn.addEventListener('click', () => {
            selectedOut = { r: or, c: oc };
            renderConv();
          });
          outGridEl.appendChild(btn);
        }
      }

      infoEl.innerHTML = `
        <div>Kích thước đầu ra: <strong>⌊(6 − 3 + 2×${padP}) / ${strideS}⌋ + 1 = ${outSize}×${outSize}</strong></div>
        <div class="mt-1">Tại ô <strong>(${selectedOut.r}, ${selectedOut.c})</strong>: Tổng tích chập = ${detailTerms.join(' + ') || '0'} = <strong>${rawSelected}</strong>${useRelu ? ` → ReLU = <strong class="text-emerald-500">${finalSelected}</strong>` : ''}</div>
      `;
    }

    function setTab(tab) {
      activeTab = tab;
      mountEl.querySelectorAll('[data-m4-tab]').forEach((b) => {
        const on = b.dataset.m4Tab === tab;
        b.className = 'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ' + (
          on ? 'bg-white dark:bg-surface-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
        );
      });
      mountEl.querySelectorAll('[data-m4-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.m4Panel !== tab));
      if (tab === 'act') drawActivations();
      else renderConv();
    }

    mountEl.querySelectorAll('[data-m4-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.m4Tab)));
    mountEl.querySelectorAll('[data-m4-fn]').forEach((cb) => {
      cb.addEventListener('change', () => {
        enabled[cb.dataset.m4Fn] = cb.checked;
        drawActivations();
      });
    });

    const zIn = mountEl.querySelector('[data-m4-z]');
    const lIn = mountEl.querySelector('[data-m4-l]');
    zIn.addEventListener('input', () => {
      zProbe = Number(zIn.value);
      mountEl.querySelector('[data-m4-zv]').textContent = zProbe.toFixed(1);
      drawActivations();
    });
    lIn.addEventListener('input', () => {
      numLayers = Number(lIn.value);
      mountEl.querySelector('[data-m4-lv]').textContent = String(numLayers);
      drawActivations();
    });

    mountEl.querySelectorAll('[data-m4-img]').forEach((b) => {
      b.addEventListener('click', () => {
        grid6 = IMG_PRESETS[b.dataset.m4Img].map((r) => r.slice());
        renderConv();
      });
    });
    mountEl.querySelector('[data-m4-kselect]').addEventListener('change', (e) => {
      kernelKey = e.target.value;
      renderConv();
    });
    mountEl.querySelector('[data-m4-pad]').addEventListener('click', (e) => {
      padP = padP === 0 ? 1 : 0;
      e.currentTarget.textContent = `Padding P=${padP}`;
      renderConv();
    });
    mountEl.querySelector('[data-m4-stride]').addEventListener('click', (e) => {
      strideS = strideS === 1 ? 2 : 1;
      e.currentTarget.textContent = `Stride S=${strideS}`;
      renderConv();
    });
    mountEl.querySelector('[data-m4-relu]').addEventListener('click', (e) => {
      useRelu = !useRelu;
      e.currentTarget.textContent = `ReLU: ${useRelu ? 'Bật' : 'Tắt'}`;
      renderConv();
    });

    registerRedraw(() => { if (activeTab === 'act') drawActivations(); });
    setTab('act');
  }

  // ==========================================================================
  // MODULE 5: K-MEANS TỪNG BƯỚC & XOAY TRỤC PCA 2D
  // ==========================================================================
  function buildModule5(mountEl) {
    let activeTab = 'kmeans';
    const PALETTE = ['#ef4444', '#0ea5e9', '#10b981', '#f59e0b', '#a855f7'];

    const PRESETS = {
      clusters3: [
        [1.4, 1.5], [1.9, 1.8], [1.2, 2.2], [2.1, 1.2], [1.6, 2.4], [2.4, 1.9], [1.0, 1.4],
        [4.2, 5.1], [4.6, 5.6], [3.8, 5.4], [4.9, 4.9], [4.3, 4.6], [5.1, 5.4], [3.9, 4.8],
        [6.4, 2.1], [6.8, 2.5], [6.0, 1.8], [7.1, 2.0], [6.5, 2.9], [5.9, 2.4], [6.9, 1.6]
      ],
      bt51: [[1, 1], [2, 1], [5, 4], [6, 5]],
      clusters4: [
        [1.5, 1.5], [1.8, 2.0], [1.2, 1.9], [2.1, 1.4], [1.6, 1.1],
        [1.6, 5.3], [2.0, 5.7], [1.3, 5.8], [2.2, 5.1], [1.8, 4.9],
        [6.1, 5.4], [6.5, 5.8], [5.8, 5.9], [6.8, 5.2], [6.2, 4.8],
        [6.2, 1.6], [6.7, 2.0], [5.9, 1.9], [6.5, 1.2], [6.0, 2.3]
      ]
    };

    let K = 3;
    let pts = PRESETS.clusters3.map((p) => ({ x: p[0], y: p[1], label: -1 }));
    let centroids = [];
    let prevCentroids = [];
    let iteration = 0;
    let nextPhase = 'assign'; // 'assign' | 'update'

    // PCA fixed centered cloud
    const pcaRaw = [
      [-2.8, -1.6], [-2.3, -0.9], [-2.0, -1.5], [-1.7, -0.5], [-1.4, -1.1],
      [-1.1, -0.2], [-0.8, -0.8], [-0.5, 0.2], [-0.3, -0.5], [0.1, 0.4],
      [0.3, -0.3], [0.6, 0.7], [0.9, 0.1], [1.2, 0.9], [1.5, 0.4],
      [1.8, 1.2], [2.1, 0.8], [2.4, 1.5], [2.7, 1.1], [1.0, -0.2],
      [-1.0, 0.3], [0.0, 0.0], [2.2, 1.8], [-2.2, -1.9]
    ];
    // Center strictly at (0,0)
    const mx = pcaRaw.reduce((s, p) => s + p[0], 0) / pcaRaw.length;
    const my = pcaRaw.reduce((s, p) => s + p[1], 0) / pcaRaw.length;
    const pcaPts = pcaRaw.map((p) => [p[0] - mx, p[1] - my]);
    const sxx = pcaPts.reduce((s, p) => s + p[0] * p[0], 0) / pcaPts.length;
    const syy = pcaPts.reduce((s, p) => s + p[1] * p[1], 0) / pcaPts.length;
    const sxy = pcaPts.reduce((s, p) => s + p[0] * p[1], 0) / pcaPts.length;
    const totalVar = sxx + syy;
    const pc1Rad = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const pc1Deg = ((pc1Rad * 180) / Math.PI + 180) % 180;
    const pc2Deg = (pc1Deg + 90) % 180;
    let thetaDeg = 0;

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 05</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Phân cụm K-Means Từng bước &amp; Xoay trục chiếu PCA 2D</h4>
          </div>
          <div class="flex items-center gap-1 bg-slate-200/75 dark:bg-surface-850 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button type="button" data-m5-tab="kmeans" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">1. K-Means từng bước</button>
            <button type="button" data-m5-tab="pca" class="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition">2. Xoay trục PCA 2D</button>
          </div>
        </div>

        <!-- TAB 1: KMEANS -->
        <div data-m5-panel="kmeans" class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m5-kmcanvas class="block cursor-crosshair"></canvas>
          </div>
          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex flex-wrap gap-1.5">
                <button type="button" data-m5-preset="clusters3" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] cursor-pointer">3 cụm tự nhiên</button>
                <button type="button" data-m5-preset="bt51" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] cursor-pointer">Bài tập 5.1</button>
                <button type="button" data-m5-preset="clusters4" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] cursor-pointer">4 cụm</button>
              </div>
              <div class="flex items-center justify-between pt-1">
                <span class="font-semibold">Số cụm K:</span>
                <strong data-m5-kv class="font-mono text-emerald-500">3</strong>
              </div>
              <input data-m5-k type="range" min="2" max="5" step="1" value="3" class="interactive-range w-full" />
            </div>

            <div class="grid grid-cols-2 gap-1.5">
              <button type="button" data-m5-assign class="px-2.5 py-1.5 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer">1. Gán cụm</button>
              <button type="button" data-m5-update class="px-2.5 py-1.5 rounded-lg font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 cursor-pointer">2. Cập nhật tâm</button>
              <button type="button" data-m5-run class="px-2.5 py-1.5 rounded-lg font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 cursor-pointer">Chạy hội tụ</button>
              <button type="button" data-m5-kmpp class="px-2.5 py-1.5 rounded-lg font-semibold bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 cursor-pointer">Khởi tạo K-Means++</button>
            </div>

            <div data-m5-kmstats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>

        <!-- TAB 2: PCA -->
        <div data-m5-panel="pca" class="hidden grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m5-pcacanvas class="block"></canvas>
          </div>
          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div class="flex justify-between">
                <label class="font-semibold">Góc trục chiếu $\\theta$:</label>
                <strong data-m5-thetav class="font-mono text-emerald-500">0°</strong>
              </div>
              <input data-m5-theta type="range" min="0" max="180" step="1" value="0" class="interactive-range w-full" />
              <div class="flex gap-2">
                <button type="button" data-m5-pc1 class="flex-1 px-2.5 py-1.5 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer">Nhảy tới PC1 tối ưu</button>
                <button type="button" data-m5-pc2 class="flex-1 px-2.5 py-1.5 rounded-lg font-semibold bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 cursor-pointer">Nhảy tới PC2</button>
              </div>
            </div>
            <div data-m5-pcastats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-2 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>
      </div>
    `;

    const kmCanvas = mountEl.querySelector('[data-m5-kmcanvas]');
    const kmStats = mountEl.querySelector('[data-m5-kmstats]');
    const kSlider = mountEl.querySelector('[data-m5-k]');
    const kVal = mountEl.querySelector('[data-m5-kv]');
    const pcaCanvas = mountEl.querySelector('[data-m5-pcacanvas]');
    const pcaStats = mountEl.querySelector('[data-m5-pcastats]');
    const thetaSlider = mountEl.querySelector('[data-m5-theta]');
    const thetaVal = mountEl.querySelector('[data-m5-thetav]');

    function initCentroids(plusPlus) {
      iteration = 0;
      nextPhase = 'assign';
      pts.forEach((p) => { p.label = -1; });
      centroids = [];
      if (!pts.length) return;

      if (plusPlus) {
        const idx0 = Math.floor(Math.random() * pts.length);
        centroids.push({ x: pts[idx0].x, y: pts[idx0].y });
        while (centroids.length < K) {
          const d2 = pts.map((p) => Math.min(...centroids.map((c) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2)));
          const total = d2.reduce((a, b) => a + b, 0);
          if (total <= 1e-12) {
            centroids.push({ x: pts[centroids.length % pts.length].x, y: pts[centroids.length % pts.length].y });
            continue;
          }
          let r = Math.random() * total;
          let picked = pts.length - 1;
          for (let i = 0; i < d2.length; i++) {
            r -= d2[i];
            if (r <= 0) { picked = i; break; }
          }
          centroids.push({ x: pts[picked].x, y: pts[picked].y });
        }
      } else {
        const shuffled = pts.slice().sort(() => Math.random() - 0.5);
        for (let k = 0; k < K; k++) {
          const src = shuffled[k % shuffled.length];
          centroids.push({ x: src.x, y: src.y });
        }
      }
      prevCentroids = centroids.map((c) => ({ ...c }));
    }

    function assignStep() {
      let changed = false;
      pts.forEach((p) => {
        let bestK = 0;
        let bestD = Infinity;
        centroids.forEach((c, k) => {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
          if (d < bestD) { bestD = d; bestK = k; }
        });
        if (p.label !== bestK) changed = true;
        p.label = bestK;
      });
      nextPhase = 'update';
      return changed;
    }

    function updateStep() {
      prevCentroids = centroids.map((c) => ({ ...c }));
      centroids.forEach((c, k) => {
        const mem = pts.filter((p) => p.label === k);
        if (mem.length > 0) {
          c.x = mem.reduce((s, p) => s + p.x, 0) / mem.length;
          c.y = mem.reduce((s, p) => s + p.y, 0) / mem.length;
        }
      });
      iteration++;
      nextPhase = 'assign';
    }

    function computeMetrics() {
      if (pts.some((p) => p.label === -1)) return { wcss: null, sil: null };
      let wcss = 0;
      pts.forEach((p) => {
        const c = centroids[p.label];
        if (c) wcss += (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      });

      // Silhouette Score
      let silSum = 0, validCount = 0;
      pts.forEach((p, i) => {
        const same = pts.filter((q, j) => j !== i && q.label === p.label);
        if (same.length === 0) return;
        const a = same.reduce((s, q) => s + Math.hypot(p.x - q.x, p.y - q.y), 0) / same.length;
        let bMin = Infinity;
        for (let k = 0; k < K; k++) {
          if (k === p.label) continue;
          const other = pts.filter((q) => q.label === k);
          if (other.length === 0) continue;
          const avg = other.reduce((s, q) => s + Math.hypot(p.x - q.x, p.y - q.y), 0) / other.length;
          if (avg < bMin) bMin = avg;
        }
        if (bMin < Infinity && Math.max(a, bMin) > 0) {
          silSum += (bMin - a) / Math.max(a, bMin);
          validCount++;
        }
      });
      return { wcss, sil: validCount > 0 ? silSum / validCount : null };
    }

    function drawKMeans() {
      if (activeTab !== 'kmeans') return;
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(kmCanvas, 290);
      const map = makeMapper(0, 8, 0, 7, width, height);
      drawGridAndAxes(ctx, pal, map, 0, 8, 0, 7, 1, 1, 'x₁', 'x₂');

      // Voronoi tint background
      const nx = 32, ny = 28;
      const cw = map.plotW / nx, ch = map.plotH / ny;
      for (let ix = 0; ix < nx; ix++) {
        for (let iy = 0; iy < ny; iy++) {
          const px = map.pad.l + (ix + 0.5) * cw;
          const py = map.pad.t + (iy + 0.5) * ch;
          const d = map.toData(px, py);
          let bestK = 0, bestD = Infinity;
          centroids.forEach((c, k) => {
            const dist = (d.x - c.x) ** 2 + (d.y - c.y) ** 2;
            if (dist < bestD) { bestD = dist; bestK = k; }
          });
          ctx.fillStyle = PALETTE[bestK] + '18';
          ctx.fillRect(map.pad.l + ix * cw, map.pad.t + iy * ch, cw + 0.6, ch + 0.6);
        }
      }

      // Lines from points to centroids
      pts.forEach((p) => {
        if (p.label >= 0 && centroids[p.label]) {
          const a = map.toPx(p.x, p.y);
          const bPt = map.toPx(centroids[p.label].x, centroids[p.label].y);
          ctx.strokeStyle = PALETTE[p.label] + '55';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bPt.x, bPt.y);
          ctx.stroke();
        }
      });

      // Points
      pts.forEach((p) => {
        const px = map.toPx(p.x, p.y);
        ctx.fillStyle = p.label >= 0 ? PALETTE[p.label] : pal.muted;
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.pointBorder;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      // Centroids + motion trail
      centroids.forEach((c, k) => {
        const pc = prevCentroids[k];
        const a = map.toPx(c.x, c.y);
        if (pc && Math.hypot(c.x - pc.x, c.y - pc.y) > 0.02) {
          const pa = map.toPx(pc.x, pc.y);
          ctx.save();
          ctx.strokeStyle = PALETTE[k];
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = PALETTE[k];
        ctx.strokeStyle = pal.isDark ? '#f8fafc' : '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(a.x - 6, a.y - 6, 12, 12);
        ctx.fill();
        ctx.stroke();
      });

      const { wcss, sil } = computeMetrics();
      kmStats.innerHTML = `
        <div class="flex justify-between"><span>Vòng lặp:</span><strong>${iteration}</strong></div>
        <div class="flex justify-between"><span>Bước tiếp theo:</span><strong>${nextPhase === 'assign' ? '1. Gán cụm' : '2. Cập nhật tâm'}</strong></div>
        <div class="flex justify-between"><span>WCSS (Inertia):</span><strong class="text-emerald-600 dark:text-emerald-400">${wcss !== null ? wcss.toFixed(4) : 'Chưa gán cụm'}</strong></div>
        <div class="flex justify-between"><span>Silhouette Score:</span><span>${sil !== null ? sil.toFixed(4) : '—'}</span></div>
      `;
    }

    function drawPCA() {
      if (activeTab !== 'pca') return;
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(pcaCanvas, 290);
      const map = makeMapper(-3.6, 3.6, -2.8, 2.8, width, height);
      drawGridAndAxes(ctx, pal, map, -3.6, 3.6, -2.8, 2.8, 1, 1, 'x₁', 'x₂');

      const rad = (thetaDeg * Math.PI) / 180;
      const ux = Math.cos(rad);
      const uy = Math.sin(rad);

      // Axis line
      ctx.save();
      ctx.beginPath();
      ctx.rect(map.pad.l, map.pad.t, map.plotW, map.plotH);
      ctx.clip();
      const pL = map.toPx(-6 * ux, -6 * uy);
      const pR = map.toPx(6 * ux, 6 * uy);
      ctx.strokeStyle = pal.emerald;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(pL.x, pL.y);
      ctx.lineTo(pR.x, pR.y);
      ctx.stroke();

      // Orthogonal projections
      let projVar = 0;
      pcaPts.forEach(([x, y]) => {
        const proj = x * ux + y * uy;
        projVar += proj * proj;
        const pxProj = proj * ux;
        const pyProj = proj * uy;

        const a = map.toPx(x, y);
        const bPt = map.toPx(pxProj, pyProj);
        ctx.strokeStyle = pal.isDark ? 'rgba(245,158,11,0.4)' : 'rgba(217,119,6,0.38)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bPt.x, bPt.y);
        ctx.stroke();

        ctx.fillStyle = pal.sky;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = pal.amber;
        ctx.beginPath();
        ctx.arc(bPt.x, bPt.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      projVar /= pcaPts.length;
      const ratioPct = (projVar / totalVar) * 100;
      const reconErr = totalVar - projVar;

      pcaStats.innerHTML = `
        <div class="flex justify-between"><span>Vector trục v(θ):</span><strong>[${ux.toFixed(3)}, ${uy.toFixed(3)}]</strong></div>
        <div class="flex justify-between"><span>Phương sai chiếu:</span><strong class="text-emerald-500">${projVar.toFixed(3)} / ${totalVar.toFixed(3)}</strong></div>
        <div>
          <div class="flex justify-between mb-1"><span>Tỷ lệ phương sai giữ lại:</span><strong>${ratioPct.toFixed(1)}%</strong></div>
          <div class="h-2.5 rounded-full bg-slate-100 dark:bg-surface-850 overflow-hidden">
            <div class="h-full bg-emerald-500 transition-all" style="width:${Math.min(100, ratioPct)}%"></div>
          </div>
        </div>
        <div class="flex justify-between"><span>Sai số tái tạo (Residual):</span><span>${reconErr.toFixed(3)} (Cực tiểu tại PC1 ≈ ${pc1Deg.toFixed(1)}°)</span></div>
      `;
    }

    function setTab(tab) {
      activeTab = tab;
      mountEl.querySelectorAll('[data-m5-tab]').forEach((b) => {
        const on = b.dataset.m5Tab === tab;
        b.className = 'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ' + (
          on ? 'bg-white dark:bg-surface-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
        );
      });
      mountEl.querySelectorAll('[data-m5-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.m5Panel !== tab));
      if (tab === 'kmeans') drawKMeans();
      else drawPCA();
    }

    mountEl.querySelectorAll('[data-m5-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.m5Tab)));

    mountEl.querySelectorAll('[data-m5-preset]').forEach((b) => {
      b.addEventListener('click', () => {
        const key = b.dataset.m5Preset;
        pts = PRESETS[key].map((p) => ({ x: p[0], y: p[1], label: -1 }));
        if (key === 'bt51') {
          K = 2;
          kSlider.value = '2';
          kVal.textContent = '2';
          centroids = [{ x: 1, y: 1 }, { x: 2, y: 1 }];
          prevCentroids = centroids.map((c) => ({ ...c }));
          iteration = 0;
          nextPhase = 'assign';
        } else {
          if (key === 'clusters4') { K = 4; kSlider.value = '4'; kVal.textContent = '4'; }
          else { K = 3; kSlider.value = '3'; kVal.textContent = '3'; }
          initCentroids(true);
        }
        drawKMeans();
      });
    });

    kSlider.addEventListener('input', () => {
      K = Number(kSlider.value);
      kVal.textContent = String(K);
      initCentroids(true);
      drawKMeans();
    });

    mountEl.querySelector('[data-m5-assign]').addEventListener('click', () => { assignStep(); drawKMeans(); });
    mountEl.querySelector('[data-m5-update]').addEventListener('click', () => { updateStep(); drawKMeans(); });
    mountEl.querySelector('[data-m5-run]').addEventListener('click', () => {
      for (let s = 0; s < 15; s++) {
        const changed = assignStep();
        updateStep();
        if (!changed && s > 0) break;
      }
      assignStep();
      drawKMeans();
    });
    mountEl.querySelector('[data-m5-kmpp]').addEventListener('click', () => { initCentroids(true); drawKMeans(); });

    kmCanvas.addEventListener('click', (evt) => {
      const pos = getCanvasPos(kmCanvas, evt);
      const map = makeMapper(0, 8, 0, 7, kmCanvas.clientWidth, 290);
      const d = map.toData(pos.x, pos.y);
      if (d.x >= 0 && d.x <= 8 && d.y >= 0 && d.y <= 7) {
        pts.push({ x: d.x, y: d.y, label: -1 });
        drawKMeans();
      }
    });

    thetaSlider.addEventListener('input', () => {
      thetaDeg = Number(thetaSlider.value);
      thetaVal.textContent = `${thetaDeg}°`;
      drawPCA();
    });
    mountEl.querySelector('[data-m5-pc1]').addEventListener('click', () => {
      thetaDeg = Math.round(pc1Deg);
      thetaSlider.value = String(thetaDeg);
      thetaVal.textContent = `${thetaDeg}°`;
      drawPCA();
    });
    mountEl.querySelector('[data-m5-pc2]').addEventListener('click', () => {
      thetaDeg = Math.round(pc2Deg);
      thetaSlider.value = String(thetaDeg);
      thetaVal.textContent = `${thetaDeg}°`;
      drawPCA();
    });

    initCentroids(true);
    registerRedraw(() => { if (activeTab === 'kmeans') drawKMeans(); else drawPCA(); });
    setTab('kmeans');
  }

  // ==========================================================================
  // MODULE 6: THÍ NGHIỆM ĐÁNH ĐỔI BIAS – VARIANCE (HỒI QUY ĐA THỨC)
  // ==========================================================================
  function buildModule6(mountEl) {
    const trueFn = (x) => Math.sin(1.5 * Math.PI * x);
    let degree = 3;
    let noiseStd = 0.25;
    let nTrain = 18;
    let ridgeLam = 0.0;
    let trainSet = [];
    let ghostCurves = [];

    function randNorm() {
      const u1 = Math.max(1e-7, Math.random());
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    function sampleTrainData() {
      const arr = [];
      for (let i = 0; i < nTrain; i++) {
        const x = (i + 0.15 + Math.random() * 0.7) / nTrain;
        const y = trueFn(x) + randNorm() * noiseStd;
        arr.push({ x, y });
      }
      return arr;
    }

    // Solve (V^T V + N * lam * diag(0,1,...,1)) w = V^T y via partial-pivoted Gauss
    function fitPoly(pts, deg, lam) {
      const m = deg + 1;
      const n = pts.length;
      const A = Array.from({ length: m }, () => new Float64Array(m + 1));

      for (let i = 0; i < n; i++) {
        const u = 2 * pts[i].x - 1; // scale x in [0,1] -> u in [-1,1] for numerical stability
        const row = new Float64Array(m);
        row[0] = 1;
        for (let j = 1; j < m; j++) row[j] = row[j - 1] * u;
        for (let r = 0; r < m; r++) {
          for (let c = 0; c < m; c++) A[r][c] += row[r] * row[c];
          A[r][m] += row[r] * pts[i].y;
        }
      }
      for (let j = 1; j < m; j++) {
        A[j][j] += n * lam + 1e-10;
      }

      for (let col = 0; col < m; col++) {
        let piv = col;
        for (let r = col + 1; r < m; r++) {
          if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
        }
        [A[col], A[piv]] = [A[piv], A[col]];
        const div = Math.abs(A[col][col]) < 1e-12 ? 1e-12 : A[col][col];
        for (let c = col; c <= m; c++) A[col][c] /= div;
        for (let r = 0; r < m; r++) {
          if (r === col) continue;
          const factor = A[r][col];
          for (let c = col; c <= m; c++) A[r][c] -= factor * A[col][c];
        }
      }

      const w = Array.from({ length: m }, (_, i) => A[i][m]);
      return (x) => {
        const u = 2 * x - 1;
        let acc = 0, pow = 1;
        for (let j = 0; j < m; j++) {
          acc += w[j] * pow;
          pow *= u;
        }
        return acc;
      };
    }

    mountEl.innerHTML = `
      <div class="interactive-card rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-900/80 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mô phỏng Tương tác • Module 06</span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Thí nghiệm Đánh đổi Bias – Variance (Hồi quy Đa thức)</h4>
          </div>
          <div class="flex gap-1.5 text-xs">
            <button type="button" data-m6-resample class="px-2.5 py-1 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer">Lấy mẫu Train mới (Xem Variance)</button>
            <button type="button" data-m6-clear class="px-2.5 py-1 rounded-lg font-semibold bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700 cursor-pointer">Xóa vết cũ</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016]">
            <canvas data-m6-canvas class="block"></canvas>
          </div>
          <div class="lg:col-span-5 space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div>
                <div class="flex justify-between mb-1"><span>Bậc đa thức d:</span><strong data-m6-dv class="font-mono text-emerald-500">3</strong></div>
                <input data-m6-d type="range" min="1" max="10" step="1" value="3" class="interactive-range w-full" />
              </div>
              <div>
                <div class="flex justify-between mb-1"><span>Mức nhiễu σ:</span><strong data-m6-sv class="font-mono text-amber-500">0.25</strong></div>
                <input data-m6-s type="range" min="0.05" max="0.50" step="0.05" value="0.25" class="interactive-range w-full" />
              </div>
              <div>
                <div class="flex justify-between mb-1"><span>Số điểm mẫu N:</span><strong data-m6-nv class="font-mono text-sky-500">18</strong></div>
                <input data-m6-n type="range" min="10" max="40" step="2" value="18" class="interactive-range w-full" />
              </div>
              <div>
                <div class="flex justify-between mb-1"><span>Điều chuẩn Ridge λ:</span><strong data-m6-lv class="font-mono text-indigo-500">0.00</strong></div>
                <input data-m6-l type="range" min="0" max="0.25" step="0.01" value="0" class="interactive-range w-full" />
              </div>
            </div>
            <div data-m6-stats class="p-3 rounded-lg bg-white dark:bg-surface-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300"></div>
          </div>
        </div>
      </div>
    `;

    const canvas = mountEl.querySelector('[data-m6-canvas]');
    const statsEl = mountEl.querySelector('[data-m6-stats]');

    function draw() {
      const pal = getTheme();
      const { ctx, width, height } = setupCanvas(canvas, 290);
      const map = makeMapper(0, 1, -1.8, 1.8, width, height);
      drawGridAndAxes(ctx, pal, map, 0, 1, -1.8, 1.8, 0.2, 0.6, 'x', 'y');

      // Ghost curves from previous resamples (visualizing Variance!)
      ghostCurves.forEach((predFn) => {
        ctx.strokeStyle = pal.isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.26)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const x = i / 100;
          const y = Math.max(-2.2, Math.min(2.2, predFn(x)));
          const p = map.toPx(x, y);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });

      // True underlying function f(x) = sin(1.5*pi*x)
      ctx.save();
      ctx.strokeStyle = pal.muted;
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = i / 120;
        const p = map.toPx(x, trueFn(x));
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();

      // Current fitted polynomial
      const model = fitPoly(trainSet, degree, ridgeLam);
      ctx.strokeStyle = pal.emerald;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = i / 120;
        const y = Math.max(-2.2, Math.min(2.2, model(x)));
        const p = map.toPx(x, y);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Train scatter
      let trainMse = 0;
      trainSet.forEach((pt) => {
        const err = model(pt.x) - pt.y;
        trainMse += err * err;
        const p = map.toPx(pt.x, pt.y);
        ctx.fillStyle = pal.sky;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.pointBorder;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      });
      trainMse /= trainSet.length;

      // Expected noiseless MSE against f(x) + irreducible noise variance
      let funcMse = 0;
      for (let i = 0; i < 100; i++) {
        const x = (i + 0.5) / 100;
        const diff = model(x) - trueFn(x);
        funcMse += diff * diff;
      }
      funcMse /= 100;
      const expectedTestMse = funcMse + noiseStd * noiseStd;

      let statusBadge = '';
      if (degree <= 2) {
        statusBadge = `<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">High Bias (Underfitting)</span>`;
      } else if (degree >= 7 && ridgeLam < 0.02) {
        statusBadge = `<span class="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">High Variance (Overfitting)</span>`;
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">Cân bằng tốt (Good Fit)</span>`;
      }

      statsEl.innerHTML = `
        <div class="flex justify-between"><span>Train MSE:</span><strong>${trainMse.toFixed(4)}</strong></div>
        <div class="flex justify-between"><span>Sai số hàm E[(f̂−f)²]:</span><strong class="text-indigo-500">${funcMse.toFixed(4)}</strong></div>
        <div class="flex justify-between"><span>Expected Test MSE:</span><strong class="text-emerald-600 dark:text-emerald-400">${expectedTestMse.toFixed(4)}</strong></div>
        <div class="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <span>Chẩn đoán:</span>${statusBadge}
        </div>
      `;
    }

    trainSet = sampleTrainData();

    mountEl.querySelector('[data-m6-d]').addEventListener('input', (e) => {
      degree = Number(e.target.value);
      mountEl.querySelector('[data-m6-dv]').textContent = String(degree);
      ghostCurves = [];
      draw();
    });
    mountEl.querySelector('[data-m6-s]').addEventListener('input', (e) => {
      noiseStd = Number(e.target.value);
      mountEl.querySelector('[data-m6-sv]').textContent = noiseStd.toFixed(2);
      ghostCurves = [];
      trainSet = sampleTrainData();
      draw();
    });
    mountEl.querySelector('[data-m6-n]').addEventListener('input', (e) => {
      nTrain = Number(e.target.value);
      mountEl.querySelector('[data-m6-nv]').textContent = String(nTrain);
      ghostCurves = [];
      trainSet = sampleTrainData();
      draw();
    });
    mountEl.querySelector('[data-m6-l]').addEventListener('input', (e) => {
      ridgeLam = Number(e.target.value);
      mountEl.querySelector('[data-m6-lv]').textContent = ridgeLam.toFixed(2);
      draw();
    });

    mountEl.querySelector('[data-m6-resample]').addEventListener('click', () => {
      ghostCurves.push(fitPoly(trainSet, degree, ridgeLam));
      if (ghostCurves.length > 6) ghostCurves.shift();
      trainSet = sampleTrainData();
      draw();
    });

    mountEl.querySelector('[data-m6-clear]').addEventListener('click', () => {
      ghostCurves = [];
      draw();
    });

    registerRedraw(draw);
    draw();
  }

  const BUILDERS = {
    'module-1': buildModule1,
    'module-2': buildModule2,
    'module-3': buildModule3,
    'module-4': buildModule4,
    'module-5': buildModule5,
    'module-6': buildModule6
  };

  function mount(moduleId, containerEl) {
    destroy();
    if (!containerEl) return;

    buildQuickToc(containerEl);
    bindQuickChecks(containerEl);

    const mountEl = containerEl.querySelector('[data-interactive-lab]');
    const builder = BUILDERS[moduleId];
    if (mountEl && typeof builder === 'function') {
      builder(mountEl);
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(mountEl, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }
  }

  return { mount, redrawActive, destroy };
})();
