import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const paths = [
  '../src/app/admin/promotions/page.tsx',
  '../src/app/admin/banners/page.tsx',
  '../src/app/admin/content/page.tsx',
];
const sources = await Promise.all(paths.map(path => readFile(new URL(path, import.meta.url), 'utf8')));

test('promotion, banner and content screens use shared accessible feedback', () => {
  for (const source of sources) {
    assert.match(source, /AdminFeedback tone="success" message=\{msg\}/);
    assert.match(source, /AdminFeedback tone="error" message=\{error\}/);
    assert.match(source, /role="status">Yükleniyor/);
    assert.doesNotMatch(source, /msg&&<div className="ok"/);
    assert.doesNotMatch(source, /error&&<div className="error"/);
  }
});

test('new admin errors clear stale success feedback', () => {
  for (const source of sources) {
    assert.match(source, /showError=useCallback\(\(message:string\)=>\{setMsg\(''\);setError\(message\)\},\[\]\)/);
    assert.match(source, /catch\{showError\(/);
  }
});

test('successful mutations survive the following list refresh', () => {
  for (const source of sources) {
    assert.match(source, /load=useCallback\(async\(\)=>\{setLoading\(true\);setError\(''\)/);
    assert.match(source, /useEffect\(\(\)=>\{void load\(\)\},\[load\]\)/);
  }
});
