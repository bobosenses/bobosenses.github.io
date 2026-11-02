import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const htmlFiles = (await walk(root)).filter(file => file.endsWith('.html'));
const pages = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, 'utf8')])));

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

test('every original Markdown article retains its public URL and title', async () => {
  const files = (await readdir('_posts')).filter(file => file.endsWith('.md'));
  for (const file of files) {
    const markdown = await readFile(path.join('_posts', file), 'utf8');
    // Draft/future articles intentionally do not get public routes.
    if (/^draft:\s*true$/m.test(markdown)) continue;
    const rawDate = markdown.match(/^date:\s*(.+)$/m)?.[1];
    if (rawDate && new Date(rawDate) > new Date()) continue;
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    const html = pages.get(path.join(root, 'posts', slug, 'index.html'));
    assert.ok(html, `missing legacy article /posts/${slug}/`);
    const title = markdown.match(/^title:\s*"?([^\n]+?)"?\s*$/m)?.[1];
    assert.ok(title && decode(html).includes(title), `article title missing: ${file}`);
  }
});

test('all internal links, fragments and local assets resolve in static output', async () => {
  const broken = [];
  for (const [file, html] of pages) {
    const route = '/' + path.relative(root, file).split(path.sep).join('/').replace(/index\.html$/, '');
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const target = decode(match[1]);
      if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(target)) continue;
      const url = new URL(target, `https://bobosenses.github.io${route}`);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const dest = path.join(root, pathname);
      try { await access(dest); } catch { broken.push(`${route} → ${target}`); continue; }
      if (url.hash && dest.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1));
        const destHtml = pages.get(dest) || '';
        if (!decode(destHtml).includes(`id="${id}"`)) broken.push(`${route} → ${target} (fragment)`);
      }
    }
  }
  assert.deepEqual(broken, []);
});

test('search JSON is parseable and covers all published articles', () => {
  const home = pages.get(path.join(root, 'index.html'));
  const raw = home.match(/<script[^>]*id="search-data"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, 'search data missing');
  const docs = JSON.parse(raw);
  const articlePages = [...pages.keys()].filter(file => file.includes(`${path.sep}posts${path.sep}`));
  assert.equal(docs.length, articlePages.length);
  for (const doc of docs) {
    assert.ok(doc.text.length > 0);
    assert.ok(pages.has(path.join(root, decodeURIComponent(doc.url), 'index.html')));
  }
});

test('RSS, sitemap, metadata and legacy Liquid removal are complete', async () => {
  const feed = await readFile(path.join(root, 'feed.xml'), 'utf8');
  const articleCount = [...pages.keys()].filter(file => file.includes(`${path.sep}posts${path.sep}`)).length;
  assert.equal((feed.match(/<item>/g) || []).length, articleCount);
  await access(path.join(root, 'sitemap-index.xml'));
  for (const [file, html] of pages) {
    assert.match(html, /<html lang="zh-CN"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<meta name="description"/);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${file} needs one h1`);
    assert.doesNotMatch(html, /\{%\s*(include|assign|for|if)|\{\{\s*site\./);
  }
});
