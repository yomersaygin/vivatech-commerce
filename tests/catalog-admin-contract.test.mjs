import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const categorySource = await readFile(new URL('../src/app/admin/categories/_components/CategoryManager.tsx', import.meta.url), 'utf8');
const brandSource = await readFile(new URL('../src/app/admin/brands/_components/BrandManager.tsx', import.meta.url), 'utf8');

test('category slug is normalized from Turkish characters', () => {
  assert.match(categorySource, /toLocaleLowerCase\('tr-TR'\)/);
  assert.match(categorySource, /replace\(\/ı\/g,'i'\)/);
  assert.match(categorySource, /replace\(\/ğ\/g,'g'\)/);
  assert.match(categorySource, /replace\(\/[^a-z0-9]\+\/g,'-'\)/);
});

test('category create and update use the categories table and update is scoped by id', () => {
  assert.match(categorySource, /supabase\.from\('categories'\)\.update\(payload\)\.eq\('id',editing\)/);
  assert.match(categorySource, /supabase\.from\('categories'\)\.insert\(payload\)/);
});

test('category deletion is confirmed and scoped to the selected id', () => {
  assert.match(categorySource, /confirm\(`\$\{x\.name\} kategorisi silinsin mi\?`\)/);
  assert.match(categorySource, /supabase\.from\('categories'\)\.delete\(\)\.eq\('id',x\.id\)/);
});

test('category parent list excludes the record being edited to prevent direct self-parenting', () => {
  assert.match(categorySource, /items\.filter\(x=>x\.id!==editing\)/);
  assert.match(categorySource, /parent_id:form\.parent_id\|\|null/);
});

test('brand slug is normalized from Turkish characters', () => {
  assert.match(brandSource, /toLocaleLowerCase\('tr-TR'\)/);
  assert.match(brandSource, /replace\(\/ı\/g,'i'\)/);
  assert.match(brandSource, /replace\(\/ş\/g,'s'\)/);
  assert.match(brandSource, /replace\(\/[^a-z0-9]\+\/g,'-'\)/);
});

test('brand create and update use the brands table and update is scoped by id', () => {
  assert.match(brandSource, /supabase\.from\('brands'\)\.update\(payload\)\.eq\('id',editing\)/);
  assert.match(brandSource, /supabase\.from\('brands'\)\.insert\(payload\)/);
});

test('brand deletion is confirmed and scoped to the selected id', () => {
  assert.match(brandSource, /confirm\(`\$\{x\.name\} markası silinsin mi\?`\)/);
  assert.match(brandSource, /supabase\.from\('brands'\)\.delete\(\)\.eq\('id',x\.id\)/);
});

test('category and brand payloads keep activation state explicit', () => {
  assert.match(categorySource, /is_active:form\.is_active/);
  assert.match(brandSource, /is_active:form\.is_active/);
});
