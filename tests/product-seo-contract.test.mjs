import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const form=await readFile(new URL('../src/app/admin/products/_components/ProductForm.tsx',import.meta.url),'utf8');
const detail=await readFile(new URL('../src/app/product/[slug]/page.tsx',import.meta.url),'utf8');

test('product save generates persisted SEO defaults when fields are blank',()=>{
 assert.match(form,/const seoDraft = buildSeoDraft\(\)/);
 assert.match(form,/seo_title: form\.seo_title\.trim\(\) \|\| seoDraft\.seoTitle/);
 assert.match(form,/seo_description: form\.seo_description\.trim\(\) \|\| seoDraft\.seoDescription/);
});

test('SEO draft regeneration replaces stale values',()=>{
 assert.match(form,/seo_title: draft\.seoTitle, seo_description: draft\.seoDescription/);
 assert.doesNotMatch(form,/seo_title: prev\.seo_title \|\| seoTitle/);
});

test('SEO inputs enforce search-result character limits',()=>{
 assert.match(form,/input maxLength=\{60\}/);
 assert.match(form,/textarea maxLength=\{160\}/);
 assert.match(form,/form\.seo_title\.length <= 60/);
 assert.match(form,/form\.seo_description\.length <= 160/);
});

test('product form exposes a Google result preview',()=>{
 assert.match(form,/className="seo-preview"/);
 assert.match(form,/Google önizlemesi/);
 assert.match(form,/vivatech-commerce\.vercel\.app\/product\//);
});

test('public product metadata consumes persisted SEO fields',()=>{
 assert.match(detail,/title:p\.seo_title\|\|/);
 assert.match(detail,/description:p\.seo_description\|\|/);
 assert.match(detail,/openGraph:/);
});
