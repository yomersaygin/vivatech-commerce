import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const productForm = await readFile(new URL('../src/app/admin/products/_components/ProductForm.tsx', import.meta.url), 'utf8');
const login = await readFile(new URL('../src/app/admin/login/page.tsx', import.meta.url), 'utf8');
const dashboard = await readFile(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');

test('product form uses explicit feedback tone instead of message text heuristics', () => {
  assert.match(productForm, /messageTone/);
  assert.match(productForm, /showSuccess/);
  assert.match(productForm, /showError/);
  assert.match(productForm, /AdminFeedback tone=\{messageTone\}/);
  assert.doesNotMatch(productForm, /message\.includes\(/);
});

test('product form hides infrastructure errors and exposes loading status', () => {
  assert.doesNotMatch(productForm, /err\.message|error\?\.message|String\(err\)/);
  assert.match(productForm, /role="status">Ürün yükleniyor/);
});

test('admin login separates success and error feedback without raw auth messages', () => {
  assert.match(login, /type Feedback=\{tone:'success'\|'error';message:string\}/);
  assert.match(login, /AdminFeedback/);
  assert.match(login, /aria-busy=\{busy\}/);
  assert.doesNotMatch(login, /error\.message/);
});

test('dashboard uses shared error feedback and semantic loading status', () => {
  assert.match(dashboard, /AdminFeedback tone="error" message=\{error\}/);
  assert.match(dashboard, /role="status">Dashboard yükleniyor/);
});
