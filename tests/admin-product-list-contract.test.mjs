import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/admin/products/page.tsx', import.meta.url), 'utf8');

test('admin product list supports operational search and filters', () => {
  assert.match(source, /useMemo/);
  assert.match(source, /row\.name\.toLocaleLowerCase\('tr-TR'\)\.includes\(term\)/);
  assert.match(source, /row\.sku/);
  assert.match(source, /status==='active'/);
  assert.match(source, /stock==='out'/);
  assert.match(source, /row\.category_id===category/);
  assert.match(source, /row\.brand_id===brand/);
});

test('admin product list reports result count and empty filtered state', () => {
  assert.match(source, /filteredRows\.length} \/ \{rows\.length} ürün gösteriliyor/);
  assert.match(source, /Filtrelerle eşleşen ürün bulunamadı/);
  assert.match(source, /Filtreleri Temizle/);
});

test('admin product list highlights critical and exhausted stock', () => {
  assert.match(source, /stock_quantity<=0\?'badge danger'/);
  assert.match(source, /stock_quantity<=5\?'badge warning'/);
});
