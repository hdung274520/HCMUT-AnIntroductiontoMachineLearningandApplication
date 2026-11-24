/**
 * Quản lý Trình biên tập mã nguồn Python (js/core/editor.js)
 * Bọc CodeMirror 5 với chế độ Python, hỗ trợ thụt lề 4 dấu cách, phím tắt Ctrl+Enter
 * và cơ chế dự phòng <textarea> nếu CDN gặp sự cố.
 */
window.EditorManager = (function () {
  let cmInstance = null;
  let textareaEl = null;

  function init(textareaId, onRunShortcut) {
    textareaEl = document.getElementById(textareaId);
    if (!textareaEl) return;

    if (window.CodeMirror) {
      cmInstance = CodeMirror.fromTextArea(textareaEl, {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {
          'Tab': (cm) => {
            if (cm.somethingSelected()) cm.indentSelection('add');
            else cm.replaceSelection('    ', 'end');
          },
          'Shift-Tab': (cm) => cm.indentSelection('subtract'),
          'Ctrl-Enter': () => onRunShortcut && onRunShortcut(),
          'Cmd-Enter': () => onRunShortcut && onRunShortcut()
        }
      });
    } else {
      textareaEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (onRunShortcut) onRunShortcut();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const start = textareaEl.selectionStart;
          const end = textareaEl.selectionEnd;
          textareaEl.value = textareaEl.value.substring(0, start) + '    ' + textareaEl.value.substring(end);
          textareaEl.selectionStart = textareaEl.selectionEnd = start + 4;
        }
      });
    }
  }

  function getCode() {
    return cmInstance ? cmInstance.getValue() : (textareaEl ? textareaEl.value : '');
  }

  function setCode(newCode) {
    if (cmInstance) {
      cmInstance.setValue(newCode);
      setTimeout(() => cmInstance.refresh(), 20);
    } else if (textareaEl) {
      textareaEl.value = newCode;
    }
  }

  function refresh() {
    if (cmInstance) cmInstance.refresh();
  }

  return { init, getCode, setCode, refresh };
})();
