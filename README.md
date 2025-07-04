# Backlogless: Task manager with low overhead

Lightweight, browser-based mini task tracker. Simple, keyboard-driven. Inspired by emacs org-mode, designed to avoid accruing backlogs. The main feature is lack of features.

## Features

### Task Management
- Single-line tasks with indent levels
- Maximum of 5 tasks to avoid backlog management overhead
- Bullet styling: none, dot or dash

### Keyboard Shortcuts

#### Navigation
- ↑/↓ arrow: Move up/down task list (green highlight on active task)
- shift + n/p: Alternative navigation (next/previous)

#### Task Creation & Editing
- ctrl + enter: Create new task below current one (same indent level)
- enter or F2: Edit current task
- double-click: Edit task text
- ctrl + ←/→: Decrease/increase indent
- alt + ↑/↓: Swap current task with task above/below
- delete: Remove current task

#### Task Status
- shift + →: Toggle task status (Active to Completed to Remove)
- shift + ←: Reactivate completed task
- shift + enter: Mark as complete and remove immediately

#### Other
- shift + t: Toggle theme (light/dark)
- ctrl + i: Show/hide header image


### Notes
- May do a backend at some point, to enable logging of completed tasks

## Installation / use
   - Open https://ddrmv.github.io/backlogless/
   
or

   - `git clone https://github.com/ddrmv/backlogless.git`
   - Open `index.html` in a browser


### Tips

- Click on Help for shortcuts
- Edit task limits: Change `MAX_TASKS` and `MAX_INDENT` constants if you want less / more tasks
- Image: Swap the image in `img/` to place a funny cat image


## License

MIT
