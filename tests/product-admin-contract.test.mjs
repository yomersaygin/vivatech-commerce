import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/admin/products/_components/ProductForm.tsx', import.meta.url), 'utf8');

test('product save guard blocks invalid name, price and stock', () => {
  assert.match(source, /form\.name\.trim\(\)\.length\s*>=\s*2/);
  assert.match(source, /Number\(form\.price\)\s*>=\s*0/);
  assert.match(source, /Number\(form\.stock_quantity\)\s*>=\s*0/);
  assert.match(source, /if\s*\(!canSave\)/);
});

test('product payload derives numeric price and stock from form state', () => {
  assert.match(source, /price:\s*Number\(form\.price\)/);
  assert.match(source, /compare_at_price:\s*form\.compare_at_price\s*===\s*''\s*\?\s*null\s*:\s*Number\(form\.compare_at_price\)/);
  assert.match(source, /stock_quantity:\s*Number\(form\.stock_quantity\)/);
});

test('product edits are scoped to the current product id', () => {
  assert.match(source, /from\('products'\)\.update\(payload\)\.eq\('id',\s*productId\)/);
});

test('new products obtain their id from the database before image upload', () => {
  assert.match(source, /from\('products'\)\.insert\(payload\)\.select\('id'\)\.single\(\)/);
  assert.match(source, /await\s+uploadImages\(id,\s*payload\.name\)/);
});

test('product image uploads only accept JPEG PNG or WebP and cap files at 10 MB', () => {
  assert.match(source, /image\/jpeg/);
  assert.match(source, /image\/png/);
  assert.match(source, /image\/webp/);
  assert.match(source, /file\.size\s*<=\s*10\s*\*\s*1024\s*\*\s*1024/);
});

test('primary image mutations are scoped to the current product', () => {
  assert.match(source, /update\(\{\s*is_primary:\s*false\s*\}\)\.eq\('product_id',\s*productId\)/);
  assert.match(source, /update\(\{\s*is_primary:\s*true\s*\}\)\.eq\('id',\s*imageId\)\.eq\('product_id',\s*productId\)/);
});
