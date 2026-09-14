import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const feedback = await readFile(new URL('../src/app/admin/AdminFeedback.tsx', import.meta.url), 'utf8');
const products = await readFile(new URL('../src/app/admin/products/page.tsx', import.meta.url), 'utf8');
const categories = await readFile(new URL('../src/app/admin/categories/_components/CategoryManager.tsx', import.meta.url), 'utf8');
const brands = await readFile(new URL('../src/app/admin/brands/_components/BrandManager.tsx', import.meta.url), 'utf8');

test('shared admin feedback exposes semantic live regions', () => {
  assert.match(feedback, /role=\{tone === 'error' \? 'alert' : 'status'\}/);
  assert.match(feedback, /aria-live=\{tone === 'error' \? 'assertive' : 'polite'\}/);
});

test('catalog screens use explicit success and error feedback', () => {
  for (const source of [products, categories, brands]) {
    assert.match(source, /AdminFeedback/);
    assert.match(source, /tone:'success'/);
    assert.match(source, /tone:'error'/);
    assert.doesNotMatch(source, /message\.startsWith|msg==='Ürün silindi\.'/);
  }
});

test('catalog operations hide raw database errors and prevent duplicate deletes', () => {
  assert.doesNotMatch(products, /error\.message|imageLoadError\.message|storageError\.message/);
  assert.match(products, /disabled=\{deletingId!==null\}/);
  assert.match(products, /Siliniyor…/);
  assert.doesNotMatch(categories, /String\(err\)|err\.message/);
  assert.doesNotMatch(brands, /String\(err\)|err\.message/);
  assert.match(brands, /disabled=\{busy\}/);
});
