import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const built = resolve(root, '.build');
let html = readFileSync(resolve(built, 'index.html'), 'utf8');

html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_match, href) => {
  const css = readFileSync(resolve(built, href.replace(/^\.\//, '')), 'utf8');
  return `<style>${css.replaceAll('</style', '<\\/style')}</style>`;
});

html = html.replace(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_match, src) => {
  const js = readFileSync(resolve(built, src.replace(/^\.\//, '')), 'utf8');
  return `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`;
});

if (/\b(?:src|href)="\.\/assets\//.test(html)) {
  throw new Error('В HTML остались внешние ресурсы сборки');
}

writeFileSync(resolve(root, 'index.html'), html);
process.stdout.write(`Готов автономный HTML: ${resolve(root, 'index.html')}\n`);

