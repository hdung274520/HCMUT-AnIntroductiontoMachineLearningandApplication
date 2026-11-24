/**
 * Động cơ Thực thi Python trên Trình duyệt — Pyodide WebAssembly (js/core/pyodide-runner.js)
 * Nạp sẵn NumPy, Pandas, Scikit-Learn, Matplotlib và tự động trích xuất biểu đồ sang ảnh PNG Base64.
 */
window.PyodideRunner = (function () {
  const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const CORE_PACKAGES = ['numpy', 'pandas', 'scikit-learn', 'matplotlib'];

  let pyInstance = null;
  let initPromise = null;
  let statusCallback = null;

  function onStatusChange(cb) {
    statusCallback = cb;
  }

  function notifyStatus(state, message) {
    if (typeof statusCallback === 'function') {
      statusCallback(state, message);
    }
  }

  async function ensureReady() {
    if (pyInstance) return pyInstance;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        if (typeof loadPyodide !== 'function') {
          throw new Error('Không thể tải thư viện Pyodide từ CDN. Vui lòng kiểm tra kết nối mạng.');
        }

        notifyStatus('loading', 'Đang tải nhân Python WASM...');
        const py = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });

        notifyStatus('loading', 'Đang nạp NumPy, Pandas, Sklearn, Matplotlib...');
        await py.loadPackage(CORE_PACKAGES);

        // Cấu hình Matplotlib backend Agg & ghi đè plt.show() để thu thập toàn bộ biểu đồ
        await py.runPythonAsync(String.raw`
import sys
import io
import base64
import warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["figure.dpi"] = 130
plt.rcParams["axes.edgecolor"] = "#cbd5e1"
plt.rcParams["axes.linewidth"] = 0.8

_ML_LAB_CAPTURED_PLOTS = []

def _ml_lab_capture_open_figures():
    for fig_num in plt.get_fignums():
        fig = plt.figure(fig_num)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", facecolor="white")
        buf.seek(0)
        _ML_LAB_CAPTURED_PLOTS.append(base64.b64encode(buf.read()).decode("ascii"))
    plt.close("all")

plt.show = _ml_lab_capture_open_figures
        `);

        pyInstance = py;
        notifyStatus('ready', 'Python 3 + Sklearn Sẵn sàng');
        return py;
      } catch (err) {
        initPromise = null;
        notifyStatus('error', 'Lỗi nạp Pyodide (Nhấn để thử lại)');
        throw err;
      }
    })();

    return initPromise;
  }

  function isReadyOrLoading() {
    return Boolean(pyInstance || initPromise);
  }

  /**
   * Chạy đoạn mã Python và trả về { stdout, stderr, plotsBase64, elapsedMs }
   */
  async function execute(code) {
    const stdoutBuffer = [];
    const stderrBuffer = [];
    const t0 = performance.now();

    try {
      const py = await ensureReady();

      py.setStdout({ batched: (msg) => stdoutBuffer.push(msg) });
      py.setStderr({ batched: (msg) => stderrBuffer.push(msg) });

      await py.runPythonAsync('_ML_LAB_CAPTURED_PLOTS.clear()\nplt.close("all")');
      await py.loadPackagesFromImports(code);
      await py.runPythonAsync(code);

      const plotsProxy = await py.runPythonAsync('_ml_lab_capture_open_figures()\n_ML_LAB_CAPTURED_PLOTS');
      const plotsBase64 = plotsProxy.toJs();
      plotsProxy.destroy();

      return {
        ok: true,
        stdout: stdoutBuffer.join('\n').trim(),
        stderr: stderrBuffer.join('\n').trim(),
        plotsBase64,
        elapsedMs: Math.round(performance.now() - t0)
      };
    } catch (err) {
      return {
        ok: false,
        stdout: stdoutBuffer.join('\n').trim(),
        stderr: String(err.message || err),
        plotsBase64: [],
        elapsedMs: Math.round(performance.now() - t0)
      };
    }
  }

  return { onStatusChange, ensureReady, isReadyOrLoading, execute };
})();
