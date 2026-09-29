/* Read existing rendered Angular scopes only. Never call a SIMS API or alter a model. */
function startSimsSkin(win, doc) {
  if (win.__shsbPersonalSkin) return;
  win.__shsbPersonalSkin = true;
  const sections = new WeakMap();
  const prefix = 'shsb-sims:completed:v1:';
  const selector = '#homeworkItems .homeworkItems-item, .homework-homepage-widget-item, .homeworkDetailItem';
  let timer, observer, storageError = '';
  const validId = value => (typeof value === 'string' || typeof value === 'number') && String(value).length > 0 && String(value).length < 200 && !/[\x00-\x1f]/.test(String(value));
  function identity(row) {
    try {
      const school = win.location.hash.match(/^#!?\/schools\/([^/]+)/)?.[1];
      const element = win.angular?.element(row);
      const scope = element?.scope?.();
      const item = row.matches('.homework-homepage-widget-item') ? scope?.hwk : row.matches('.homeworkDetailItem') ? scope?.vm?.item : scope?.item;
      const student = item?.StudentId ?? scope?.homework?.studentId ?? scope?.vm?.studentId;
      const assignment = item?.HomeworkId ?? (row.matches(".homeworkDetailItem") ? scope?.vm?.homeworkId : undefined);
      if (![school, student, assignment].every(validId)) return null;
      return prefix + JSON.stringify([String(school), String(student), String(assignment)]);
    } catch { return null; }
  }
  function read(key) {
    try { return win.localStorage.getItem(key) === 'true'; }
    catch { storageError = 'This browser cannot access saved ticks. Allow site storage, then try again.'; return false; }
  }
  function paint(row, control) {
    const key = identity(row);
    const input = control.querySelector('input');
    const done = key ? read(key) : false;
    input.disabled = !key;
    input.checked = done;
    input.setAttribute('aria-label', done ? 'Mark incomplete for me' : 'Mark completed for me');
    control.title = key ? 'Saved only in this browser. Does not submit homework to SIMS.' : 'Assignment/student ID unavailable. Personal ticks are disabled for this item.';
    row.classList.toggle('shsb-personally-done', done);
    const text = done ? 'Done for me' : 'Mark done';
    if (control.querySelector('span').textContent !== text) control.querySelector('span').textContent = text;
  }
  function filterSections() {
    const hosts = [...doc.querySelectorAll('#homeworkItems .view-body, homework-homepage-widget')];
    for (const host of hosts) {
      const listRows = [...host.querySelectorAll('.homeworkItems-item, .homework-homepage-widget-item')];
      const tasks = listRows.filter(row => row.querySelector('.shsb-completion'));
      let section = sections.get(host);
      if (!section) {
        const bar = doc.createElement('div');
        bar.className = 'shsb-homework-filters';
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', 'Personal homework view');
        const buttons = {};
        section = {mode: 'todo', bar, buttons};
        for (const [mode, title] of [['todo', 'To do'], ['done', 'Done']]) {
          const button = doc.createElement('button');
          button.type = 'button';
          button.dataset.shsbView = mode;
          button.addEventListener('click', event => {
            event.stopPropagation();
            section.mode = mode;
            scan();
          });
          button.addEventListener('keydown', event => event.stopPropagation());
          buttons[mode] = button;
          bar.append(button);
        }
        const empty = doc.createElement('p');
        empty.className = 'shsb-homework-empty';
        empty.setAttribute('role', 'status');
        section.empty = empty;
        sections.set(host, section);
      }
      if (!host.contains(section.bar)) host.prepend(section.bar);
      const content = host.querySelector('.dates-container')?.parentElement || host.querySelector('.homepage-widget-body, .scroll-container') || host;
      if (section.empty.parentElement !== content) content.append(section.empty);
      let doneCount = 0, visibleCount = 0;
      for (const row of tasks) {
        const done = row.classList.contains('shsb-personally-done');
        if (done) doneCount++;
        const hide = section.mode === 'todo' ? done : !done;
        row.dataset.shsbFilterHidden = String(hide);
        if (!hide) visibleCount++;
      }
      for (const row of listRows.filter(row => !tasks.includes(row))) {
        row.dataset.shsbFilterHidden = String(section.mode === 'done');
      }
      // Suppress date headings only when all their assignments were filtered out.
      for (const group of host.querySelectorAll('article[ng-repeat="date in homework.items"], article[ng-repeat="date in homework.itemsPast"]')) {
        const children = [...group.querySelectorAll('.homeworkItems-item')];
        group.dataset.shsbFilterHidden = String(children.length > 0 && children.every(row => row.dataset.shsbFilterHidden === 'true'));
      }
      for (const [mode, title, count] of [['todo', 'To do', tasks.length - doneCount], ['done', 'Done', doneCount]]) {
        const button = section.buttons[mode];
        const text = `${title} (${count})`;
        if (button.textContent !== text) button.textContent = text;
        button.setAttribute('aria-pressed', String(section.mode === mode));
        button.title = 'Personal completion for assignments currently loaded in this list';
      }
      const text = section.mode === 'done' ? 'No completed homework in this list yet.' : 'No remaining homework in this list.';
      if (section.empty.textContent !== text) section.empty.textContent = text;
      section.empty.hidden = visibleCount > 0 || tasks.length === 0;
    }
  }
  function scan() {
    if (!doc.body?.matches('[ng-app="studentApp"][ng-controller="IndexCtrl"]')) return;
    observer?.disconnect();
    try {
      const rows = [...doc.querySelectorAll(selector)];
      for (const row of rows) {
        // SIMS also uses this class for its "No homework due" placeholder.
        if (!identity(row) && !row.matches('[ng-click], .homeworkDetailItem')) continue;
        let control = row.querySelector('.shsb-completion');
        if (!control) {
          control = doc.createElement('label');
          control.className = 'shsb-completion';
          const input = doc.createElement('input');
          input.type = 'checkbox';
          const text = doc.createElement('span');
          control.append(input, text);
          control.addEventListener('click', event => event.stopPropagation());
          control.addEventListener('keydown', event => event.stopPropagation());
          input.addEventListener('change', () => {
            const key = identity(row); // Re-read: Angular can reuse a row for another assignment.
            if (!key) { scan(); return; }
            try {
              win.localStorage.setItem(key, input.checked ? 'true' : 'false');
              storageError = '';
            } catch {
              storageError = 'Tick was not saved. This browser has blocked storage or storage is full.';
            }
            scan();
          });
          const target = row.querySelector('td.homeworkItems-item-description, .homework-detail-header-panel') || row;
          target.prepend(control);
        }
        paint(row, control);
      }
      filterSections();
      let note = doc.getElementById('shsb-personal-note');
      if (rows.length) {
        if (!note) { note = doc.createElement('div'); note.id = 'shsb-personal-note'; note.setAttribute('role', 'status'); }
        const host = doc.querySelector('#homeworkItems .view-body, #homework .view-body, homework-homepage-widget') || rows[0]?.closest('.view-body');
        if (host && note.parentElement !== host) host.prepend(note);
        const message = storageError || (rows.some(identity)
          ? 'Personal ticks • saved in this browser only. Use SIMS’s Submit for Marking to hand work in.'
          : 'Skin active. Assignment IDs are not available yet; personal ticks are disabled until SIMS loads them.');
        if (note.textContent !== message) note.textContent = message;
      } else { note?.remove(); }
    } finally {
      observer?.observe(doc.body, {childList: true, subtree: true, characterData: true});
    }
  }
  function schedule() { win.clearTimeout(timer); timer = win.setTimeout(scan, 100); }
  observer = new win.MutationObserver(schedule);
  win.addEventListener('hashchange', schedule);
  win.addEventListener('storage', event => { if (!event.key || event.key.startsWith(prefix)) schedule(); });
  // A scope can change without the DOM changing, including account and route transitions.
  const poll = win.setInterval(scan, 2000);
  win.addEventListener('pagehide', () => { observer.disconnect(); win.clearTimeout(timer); win.clearInterval(poll); }, {once: true});
  win.addEventListener('pageshow', event => { if (event.persisted) win.location.reload(); });
  scan();
}
