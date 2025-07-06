const TASKS_KEY = 'tasks';
const THEME_KEY = 'theme';
const MAX_TASKS = 5;
const MAX_INDENT = 3;
const MIN_INDENT = 0;
const BULLET_KEY = 'bullet_style';
const BULLET_OPTIONS = {
  none: '',
  dot: '•',
  dash: '-',
};

const taskList = document.getElementById('task-list');
const settingsMenu = document.getElementById('settings-menu');
const themeToggle = document.getElementById('theme-toggle');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');
const clearTasks = document.getElementById('clear-tasks');
const bulletSelect = document.getElementById('bullet-select');
const headerImage = document.getElementById('header-image');

grabTheme();
let tasks = loadTasks();
if (tasks.length === 0) {
  tasks = [{
    text: 'This comes first',
    indent_level: 0,
    created_at: Date.now(),
    status: 'active',
    completed_at: null
  }];
  saveTasks();
}
let activeIdx = 0;
let bulletStyle = loadBulletStyle();
if (bulletSelect) {
  bulletSelect.value = bulletStyle;
  bulletSelect.onchange = function () {
    bulletStyle = bulletSelect.value;
    saveBulletStyle(bulletStyle);
    render();
  };
}
render();

function grabTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}
function loadTasks() {
  try {
    const t = JSON.parse(localStorage.getItem(TASKS_KEY));
    if (!t || !Array.isArray(t) || t.length === 0) {
      return [{
        text: 'This comes first',
        indent_level: 0,
        created_at: Date.now(),
        status: 'active',
        completed_at: null
      }];
    }
    return t;
  } catch {
    return [{
      text: 'This comes first',
      indent_level: 0,
      created_at: Date.now(),
      status: 'active',
      completed_at: null
    }];
  }
}
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
function loadBulletStyle() {
  return localStorage.getItem(BULLET_KEY) || 'none';
}
function saveBulletStyle(style) {
  localStorage.setItem(BULLET_KEY, style);
}
function render() {
  taskList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'task' + (i === activeIdx ? ' active' : '') + (t.status === 'completed' ? ' completed' : '') + (i === 0 ? ' first' : '');
    li.style.marginLeft = (t.indent_level * 20) + 'px';
    let displayText = t.text;
    if (displayText === '' || /^\s*$/.test(displayText)) {
      displayText = '...';
    }
    // Add bullet as a separate span
    const bullet = BULLET_OPTIONS[bulletStyle] || '';
    li.innerHTML = bullet ? `<span class="bullet-prefix">${bullet}</span>&nbsp;&nbsp;<span class="task-text">${displayText}</span>` : `<span class="task-text">${displayText}</span>`;
    li.tabIndex = 0;
    li.onclick = () => { activeIdx = i; render(); };
    li.ondblclick = () => editTask(i);
    taskList.appendChild(li);
  });
}
function editTask(i) {
  const li = taskList.children[i];
  const textSpan = li.querySelector('.task-text');
  textSpan.contentEditable = true;
  textSpan.focus();
  // Auto-select all text
  const range = document.createRange();
  range.selectNodeContents(textSpan);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  textSpan.onblur = () => {
    let newText = textSpan.textContent.trim();
    if (newText === '' || /^\s*$/.test(newText)) {
      newText = '...';
    }
    tasks[i].text = newText;
    textSpan.contentEditable = false;
    saveTasks();
    render();
  };
  textSpan.onkeydown = e => {
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      e.stopPropagation();
      textSpan.blur();
    }
  };
}
function addTask(idx) {
  if (tasks.length >= MAX_TASKS) return;
  const now = Date.now();
  let indent = 0;
  if (tasks.length > 0 && typeof tasks[idx]?.indent_level === 'number') {
    indent = tasks[idx].indent_level;
  }
  const t = { text: '', indent_level: indent, created_at: now, status: 'active', completed_at: null };
  if (tasks.length === 0) {
    tasks.push(t);
    activeIdx = 0;
  } else {
    tasks.splice(idx + 1, 0, t);
    activeIdx = idx + 1;
  }
  saveTasks();
  render();
  editTask(activeIdx);
}

function addTaskAbove(idx) {
  if (tasks.length >= MAX_TASKS) return;
  const now = Date.now();
  let indent = 0;
  if (tasks.length > 0 && typeof tasks[idx]?.indent_level === 'number') {
    indent = tasks[idx].indent_level;
  }
  const t = { text: '', indent_level: indent, created_at: now, status: 'active', completed_at: null };
  if (tasks.length === 0) {
    tasks.push(t);
    activeIdx = 0;
  } else {
    tasks.splice(idx, 0, t);
    activeIdx = idx;
  }
  saveTasks();
  render();
  editTask(activeIdx);
}
function completeTask(idx) {
  if (tasks[idx].status === 'completed') {
    tasks.splice(idx, 1);
    if (activeIdx >= tasks.length) activeIdx = tasks.length - 1;
    if (activeIdx < 0) activeIdx = 0;
  } else {
    tasks[idx].status = 'completed';
    tasks[idx].completed_at = Date.now();
  }
  saveTasks();
  render();
}
function activateTask(idx) {
  tasks[idx].status = 'active';
  tasks[idx].completed_at = null;
  saveTasks();
  render();
}
function indentTask(idx, dir) {
  const t = tasks[idx];
  t.indent_level = Math.max(MIN_INDENT, Math.min(MAX_INDENT, t.indent_level + dir));
  saveTasks();
  render();
}
function swapTasks(i, j) {
  if (j < 0 || j >= tasks.length) return;
  [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
  activeIdx = j;
  saveTasks();
  render();
}
function clearAllTasks() {
  if (confirm('Clear all tasks?')) {
    tasks = [];
    activeIdx = 0;
    saveTasks();
    render();
  }
}
function toggleHeaderImage() {
  if (headerImage) {
    headerImage.style.display = headerImage.style.display === 'block' ? 'none' : 'block';
  }
}

function toggleSettingsMenu() {
  if (settingsMenu) {
    settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'flex' : 'none';
  }
}
function deleteTask(idx) {
  if (tasks.length === 0) return;
  tasks.splice(idx, 1);
  if (activeIdx >= tasks.length) activeIdx = tasks.length - 1;
  if (activeIdx < 0) activeIdx = 0;
  saveTasks();
  render();
}
// Keyboard shortcuts
window.addEventListener('keydown', e => {
  if (helpModal && !helpModal.hidden) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      helpModal.hidden = true;
    }
    return;
  }
  // Blur editable field for Alt+Up/Down
  if ((e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.isContentEditable) {
      activeEl.blur();
    }
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      swapTasks(activeIdx, activeIdx - 1);
    } else if (e.key === 'ArrowDown') {
      swapTasks(activeIdx, activeIdx + 1);
    }
    return;
  }
  // Shift+N/P navigation (not editing)
  if (
    e.shiftKey &&
    (e.key === 'N' || e.key === 'n' || e.key === 'P' || e.key === 'p') &&
    !(document.activeElement && document.activeElement.isContentEditable)
  ) {
    e.preventDefault();
    if (e.key === 'N' || e.key === 'n') {
      activeIdx = Math.min(tasks.length - 1, activeIdx + 1);
      render();
    } else if (e.key === 'P' || e.key === 'p') {
      activeIdx = Math.max(0, activeIdx - 1);
      render();
    }
    return;
  }
  if (e.ctrlKey && e.key === 'Enter') {
    addTask(activeIdx);
  } else if (e.altKey && e.key === 'Enter') {
    addTaskAbove(activeIdx);
  } else if ((e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) || e.key === 'F2') {
    // Only trigger edit if not already editing
    const li = taskList.children[activeIdx];
    if (li && !li.isContentEditable && document.activeElement !== li) {
      editTask(activeIdx);
      e.preventDefault();
    }
  } else if (e.key === 'ArrowUp') {
    activeIdx = Math.max(0, activeIdx - 1);
    render();
  } else if (e.key === 'ArrowDown') {
    activeIdx = Math.min(tasks.length - 1, activeIdx + 1);
    render();
  } else if (e.ctrlKey && e.key === 'ArrowLeft') {
    indentTask(activeIdx, -1);
  } else if (e.ctrlKey && e.key === 'ArrowRight') {
    indentTask(activeIdx, 1);
  } else if (e.shiftKey && e.key === 'ArrowRight') {
    if (tasks[activeIdx]?.status === 'active') completeTask(activeIdx);
    else if (tasks[activeIdx]?.status === 'completed') completeTask(activeIdx);
  } else if (e.shiftKey && e.key === 'ArrowLeft') {
    if (tasks[activeIdx]?.status === 'completed') activateTask(activeIdx);
  } else if (e.shiftKey && e.key === 'Enter') {
    if (tasks[activeIdx] && tasks[activeIdx].status === 'active') {
      // Mark as completed, then remove
      tasks[activeIdx].status = 'completed';
      tasks[activeIdx].completed_at = Date.now();
      saveTasks();
      // Remove immediately
      tasks.splice(activeIdx, 1);
      if (activeIdx >= tasks.length) activeIdx = tasks.length - 1;
      if (activeIdx < 0) activeIdx = 0;
      saveTasks();
      render();
    } else if (tasks[activeIdx]) {
      // If already completed, just remove
      completeTask(activeIdx);
    }
  } else if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
    // Prevent theme toggle if editing a task
    if (document.activeElement && document.activeElement.isContentEditable) return;
    toggleTheme();
  } else if (e.ctrlKey && (e.key === 'I' || e.key === 'i')) {
    // Prevent image toggle if editing a task
    if (document.activeElement && document.activeElement.isContentEditable) return;
    toggleHeaderImage();
  } else if (e.ctrlKey && (e.key === 'M' || e.key === 'm')) {
    // Prevent menu toggle if editing a task
    if (document.activeElement && document.activeElement.isContentEditable) return;
    toggleSettingsMenu();
  } else if (e.key === 'Delete') {
    // Only delete task if not editing text
    if (!(document.activeElement && document.activeElement.isContentEditable)) {
      deleteTask(activeIdx);
    }
  }
});
themeToggle.onclick = toggleTheme;
helpBtn.onclick = () => { helpModal.hidden = false; };
closeHelp.onclick = () => { helpModal.hidden = true; };
clearTasks.onclick = clearAllTasks;
