const tabCode = { html: '', css: '', js: '' };
let activeTab = 'html';

function switchTab(tab) {
  tabCode[activeTab] = textarea.value;        // save current
  activeTab = tab;
  textarea.value = tabCode[tab];              // load new
  updateLineNumbers();

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  textarea.placeholder = tab === 'html'
    ? 'Write your HTML code here...'
    : tab === 'css'
      ? 'Write your CSS code here...'
      : 'Write your JS code here...';
}

// Code 
function generateOutput() {
  const code = document.getElementById('inputCode').value.trim();
  const output = document.getElementById('output');

  if (!code) {
    output.innerHTML = '<div class="placeholder">Please write some code first!</div>';
    return;
  }

  try {
    output.innerHTML = '<div class="placeholder"><div class="loading"></div> Running code...</div>';

    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '10px';
      iframe.style.minHeight = '360px';

      iframe.srcdoc = code;

      output.innerHTML = '';
      output.appendChild(iframe);

      iframe.onerror = function () {
        output.innerHTML = '<div class="placeholder">Error loading code. Please check your syntax.</div>';
      };

    }, 500);

  } catch (error) {
    output.innerHTML = '<div class="placeholder">Error: ' + error.message + '</div>';
  }
}

// =============== KEYBOARD SHORTCUTS ===============

document.addEventListener('DOMContentLoaded', function () {
  const inputCode = document.getElementById('inputCode');

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateOutput();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      clearOutput();
    }

    if (e.target === inputCode && e.key === 'Tab') {
      e.preventDefault();
      const start = inputCode.selectionStart;
      const end = inputCode.selectionEnd;

      inputCode.value = inputCode.value.substring(0, start) + '  ' + inputCode.value.substring(end);
      inputCode.selectionStart = inputCode.selectionEnd = start + 2;
    }
  });

  inputCode.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.max(this.scrollHeight, 300) + 'px';
  });
});

// =============== UTILITY FUNCTIONS ===============

function formatCode() {
  const inputCode = document.getElementById('inputCode');
  let code = inputCode.value;

  code = code.replace(/></g, '>\n<');
  code = code.replace(/\n\s*\n/g, '\n');

  inputCode.value = code;
}

function downloadCode() {
  const code = document.getElementById('inputCode').value;

  if (!code.trim()) {
    alert('No code to download!');
    return;
  }

  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'code-runner-output.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function shareCode() {
  const code = document.getElementById('inputCode').value;

  if (!code.trim()) {
    alert('No code to share!');
    return;
  }

  navigator.clipboard.writeText(code).then(() => {
    const output = document.getElementById('output');
    const originalContent = output.innerHTML;
    output.innerHTML = '<div class="placeholder">Code copied to clipboard!</div>';

    setTimeout(() => {
      output.innerHTML = originalContent;
    }, 2000);
  }).catch(err => {
    console.error('Could not copy code: ', err);
    alert('Could not copy code to clipboard');
  });
}

// =============== ERROR HANDLING ===============

// Global error handler for iframe content
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'error') {
    const output = document.getElementById('output');
    output.innerHTML = '<div class="placeholder"> Runtime Error: ' + e.data.message + '</div>';
  }
});

// Handle uncaught errors
window.addEventListener('error', function (e) {
  console.error('Code Runner Error:', e.error);
});

// =============== PERFORMANCE OPTIMIZATIONS ===============

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =============== MOBILE OPTIMIZATIONS ===============

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
  document.addEventListener('DOMContentLoaded', function () {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        #inputCode {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
  });
}

// =============== CONSOLE LOG INTERCEPTOR (OPTIONAL) ===============

function interceptConsoleLogs() {
  const originalLog = console.log;
  const logs = [];

  console.log = function (...args) {
    logs.push(args.join(' '));
    originalLog.apply(console, arguments);
  };

  return logs;
}

// =============== CODE VALIDATION ===============

function validateHTML(code) {
  const errors = [];

  if (!code.includes('<!DOCTYPE') && !code.includes('<html')) {
    errors.push('Consider adding DOCTYPE and HTML tags for proper structure');
  }

  const openTags = code.match(/<(\w+)(?:\s|>)/g) || [];
  const closeTags = code.match(/<\/(\w+)>/g) || [];

  if (openTags.length !== closeTags.length) {
    errors.push('Possible unclosed HTML tags detected');
  }

  return errors;
}

// =============== INITIALIZATION ===============

document.addEventListener('DOMContentLoaded', function () {
  console.log('Code Runner initialized successfully!');

  console.log('Keyboard Shortcuts:');
  console.log('   Ctrl/Cmd + Enter: Run Code');
  console.log('   Ctrl/Cmd + L: Clear Code');
  console.log('   Tab: Insert spaces in textarea');

  setTimeout(() => {
    document.getElementById('inputCode').focus();
  }, 1000);
});

const textarea = document.getElementById('inputCode');
const lineNumbers = document.getElementById('lineNumbers');

function updateLineNumbers() {
  const lines = textarea.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
    `<span>${i + 1}</span>`
  ).join('');
}

textarea.addEventListener('input', updateLineNumbers);

textarea.addEventListener('scroll', () => {
  lineNumbers.scrollTop = textarea.scrollTop;
});

textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    updateLineNumbers();
  }
});

function runCode() {
  tabCode[activeTab] = textarea.value; // save before run
  const frame = document.getElementById('outputFrame');
  frame.srcdoc = `
    ${tabCode.html}
    <style>${tabCode.css}</style>
    <script>${tabCode.js}<\/script>
  `;
}

function clearOutput() {
  document.getElementById('outputFrame').srcdoc = '';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

updateLineNumbers();

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  const icon = document.querySelector('#themeBtn i');
  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}