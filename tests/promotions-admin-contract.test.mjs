import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/admin/promotions/page.tsx', import.meta.url), 'utf8');

test('coupon codes are normalized before insert', () => {
  assert.match(source, /code:String\(f\.get\('code'\)\)\.trim\(\)\.toUpperCase\(\)/);
});

test('coupon numeric fields are converted explicitly', () => {
  assert.match(source, /discount_value:Number\(f\.get\('value'\)\)/);
  assert.match(source, /min_subtotal:Number\(f\.get\('min'\)\|\|0\)/);
  assert.match(source, /usage_limit:f\.get\('limit'\)\?Number\(f\.get\('limit'\)\):null/);
});

test('new coupons and campaigns are active by default', () => {
  assert.match(source, /supabase\.from\('coupons'\)\.insert\([\s\S]*?is_active:true/);
  assert.match(source, /supabase\.from\('campaigns'\)\.insert\([\s\S]*?is_active:true/);
});

test('campaign slug is derived from title and normalized', () => {
  assert.match(source, /const slug=title\.toLocaleLowerCase\('tr-TR'\)/);
  assert.match(source, /replace\(\/ı\/g,'i'\)/);
  assert.match(source, /replace\(\/\[\^a-z0-9\]\+\/g,'-'\)/);
});

test('activation toggle targets only the selected record', () => {
  assert.match(source, /supabase\.from\(table\)\.update\(\{is_active:!current\}\)\.eq\('id',id\)/);
});

test('coupon form enforces positive discount and nonnegative minimum subtotal', () => {
  assert.match(source, /min="0\.01"[^>]*name="value"/);
  assert.match(source, /min="0"[^>]*name="min"/);
  assert.match(source, /min="1"[^>]*name="limit"/);
});
