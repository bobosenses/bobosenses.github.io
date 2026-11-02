const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeMedia = matchMedia('(prefers-color-scheme: dark)');
function syncThemeLabel() {
  const dark = root.dataset.theme === 'dark';
  themeButton?.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#09090b' : '#fafafa');
}
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  syncThemeLabel();
});
themeMedia.addEventListener('change', event => {
  let saved;
  try { saved = localStorage.getItem('theme'); } catch {}
  if (saved !== 'light' && saved !== 'dark') root.dataset.theme = event.matches ? 'dark' : 'light';
  syncThemeLabel();
});
syncThemeLabel();

const menu = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const nav = document.querySelector<HTMLElement>('#site-nav');
function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', '打开导航菜单'); }
menu?.addEventListener('click', () => {
  const open = nav?.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(Boolean(open)));
  menu.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
});
document.addEventListener('click', event => { if (event.target instanceof Element && !event.target.closest('.header-inner')) closeMenu(); });
matchMedia('(min-width: 431px)').addEventListener('change', closeMenu);

interface SearchDoc { title: string; url: string; date: string; text: string }
const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
const input = document.querySelector<HTMLInputElement>('[data-search-input]');
const results = document.querySelector<HTMLElement>('[data-search-results]');
const searchData = document.querySelector('#search-data')?.textContent || '[]';
const docs: SearchDoc[] = JSON.parse(searchData);
let selected = 0;
let searchOpener: HTMLElement | null = null;
let priorOverflow = '';
function selectResult(index: number) {
  const links = results?.querySelectorAll<HTMLAnchorElement>('a') || [];
  selected = links.length ? (index + links.length) % links.length : 0;
  links.forEach((link, i) => link.dataset.selected = String(i === selected));
  links[selected]?.scrollIntoView({ block: 'nearest' });
}
function renderResults() {
  if (!results || !input) return;
  const query = input.value.trim().toLocaleLowerCase();
  const matches = docs.filter(doc => `${doc.title} ${doc.text}`.toLocaleLowerCase().includes(query)).slice(0, 12);
  results.replaceChildren();
  const label = document.createElement('p');
  label.className = 'search-group-label';
  label.textContent = query ? `找到 ${matches.length} 篇文章` : '从最近的文章开始';
  results.append(label);
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = '没有找到相关文章，试试其他关键词。';
    results.append(empty);
  }
  matches.forEach(doc => {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = doc.url;
    const body = document.createElement('span');
    body.textContent = doc.title;
    const date = document.createElement('small');
    date.textContent = doc.date;
    body.append(date);
    link.append(body);
    results.append(link);
  });
  selectResult(0);
}
function openSearch() {
  if (!dialog || !input || dialog.open) return;
  searchOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  closeMenu();
  input.value = '';
  dialog.showModal();
  priorOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  renderResults();
  input.focus();
}
document.querySelector('[data-search-open]')?.addEventListener('click', openSearch);
input?.addEventListener('input', renderResults);
dialog?.addEventListener('close', () => { document.body.style.overflow = priorOverflow; searchOpener?.focus(); });
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
document.addEventListener('keydown', event => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  const typing = target?.matches('input, textarea, select') || target?.isContentEditable;
  if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing)) {
    event.preventDefault();
    openSearch();
  }
  if (event.key === 'Escape') {
    closeMenu();
    if (dialog?.open) { event.preventDefault(); dialog.close(); }
  }
  if (!dialog?.open) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    selectResult(selected + (event.key === 'ArrowDown' ? 1 : -1));
  }
  if (event.key === 'Enter' && event.target === input) {
    event.preventDefault();
    results?.querySelectorAll<HTMLAnchorElement>('a')[selected]?.click();
  }
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('[data-back-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
const blueprint = document.querySelector<HTMLElement>('[data-blueprint]');
blueprint?.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = blueprint.getBoundingClientRect();
  blueprint.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 8}px`);
  blueprint.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 6}px`);
});
blueprint?.addEventListener('pointerleave', () => { blueprint.style.setProperty('--pointer-x', '0px'); blueprint.style.setProperty('--pointer-y', '0px'); });

async function copyText(text: string, button: HTMLButtonElement, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制 ✓';
    button.setAttribute('aria-live', 'polite');
    window.setTimeout(() => { button.textContent = label; }, 2000);
  } catch {
    button.textContent = '复制失败，请手动复制';
    window.setTimeout(() => { button.textContent = label; }, 2500);
  }
}
const copyLink = document.querySelector<HTMLButtonElement>('[data-copy-link]');
copyLink?.addEventListener('click', () => copyText(location.href, copyLink, '复制文章链接'));
document.querySelectorAll<HTMLPreElement>('.prose pre').forEach(pre => {
  const code = pre.querySelector('code');
  if (!code) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-code';
  button.textContent = '复制';
  button.setAttribute('aria-label', '复制代码');
  button.addEventListener('click', () => copyText(code.textContent || '', button, '复制'));
  pre.append(button);
});
document.querySelectorAll<HTMLTableElement>('.prose table').forEach(table => {
  const wrap = document.createElement('div');
  wrap.className = 'table-scroll';
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', '可横向滚动的表格');
  table.before(wrap);
  wrap.append(table);
});
