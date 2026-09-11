import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const productsSource = await readFile(new URL('../src/app/products/page.tsx', import.meta.url), 'utf8');
const productDetailSource = await readFile(new URL('../src/app/product/[slug]/page.tsx', import.meta.url), 'utf8');
const addToCartSource = await readFile(new URL('../src/components/AddToCartButton.tsx', import.meta.url), 'utf8');

test('public product catalog only queries active products', () => {
  assert.match(productsSource, /from\('products'\)[\s\S]*?eq\('is_active',true\)/);
});

test('public category and brand filters only expose active records', () => {
  assert.match(productsSource, /from\('categories'\)[\s\S]*?eq\('is_active',true\)/);
  assert.match(productsSource, /from\('brands'\)[\s\S]*?eq\('is_active',true\)/);
});

test('product detail lookup is scoped by slug and active state', () => {
  assert.match(productDetailSource, /eq\('slug',slug\)\.eq\('is_active',true\)\.maybeSingle\(\)/);
});

test('inactive or missing product detail is non-indexable', () => {
  assert.match(productDetailSource, /robots:\{index:false,follow:false\}/);
  assert.match(productDetailSource, /Ürün bulunamadı/);
});

test('add to cart is disabled when stock is zero or negative', () => {
  assert.match(addToCartSource, /disabled=\{product\.stock_quantity<=0\}/);
  assert.match(addToCartSource, /product\.stock_quantity<=0\?'Stokta Yok'/);
});

test('add to cart adds one unit and delegates quantity clamping to the cart provider', () => {
  assert.match(addToCartSource, /addItem\(product,1\)/);
});

test('product detail passes current database stock to add-to-cart control', () => {
  assert.match(productDetailSource, /stock_quantity:product\.stock_quantity/);
});

test('catalog search and filter logic operates on already active product set', () => {
  assert.match(productsSource, /const products=\(p\?\?\[\]\) as Product\[\]/);
  assert.match(productsSource, /let filtered=products\.filter/);
});
