import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/admin/promotions/page.tsx', import.meta.url), 'utf8');

test('coupon codes are normalized before insert', () => {
  assert.match(source, /code:String\(f\.get\('code'\)\)\.trim\(\)\.toUpperCase\(\)/);
});

test('coupon numeric fields are converted explicitly', () => {
  assert.match(source, /const discountValue=Number\(f\.get\('value'\)\)/);
  assert.match(source, /const minSubtotal=Number\(f\.get\('min'\)\|\|0\)/);
  assert.match(source, /const usageLimit=limitValue\?Number\(limitValue\):null/);
});

test('new coupons and campaigns are active by default', () => {
  assert.match(source, /is_active:editingCoupon\?\.is_active\?\?true/);
  assert.match(source, /is_active:editingCampaign\?\.is_active\?\?true/);
  assert.match(source, /supabase\.from\('coupons'\)\.insert\(payload\)/);
  assert.match(source, /supabase\.from\('campaigns'\)\.insert\(payload\)/);
});

test('campaign slug is derived from title and normalized', () => {
  assert.match(source, /slugify=\(value:string\)=>value\.trim\(\)\.toLocaleLowerCase\('tr-TR'\)/);
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

test('percentage discounts are capped and usage limits stay integral', () => {
  assert.match(source, /discountType==='percentage'&&discountValue>100/);
  assert.match(source, /!Number\.isInteger\(usageLimit\)\|\|usageLimit<1/);
  assert.match(source, /step="1"[^>]*name="limit"/);
});

test('coupon and campaign edits are scoped to selected ids', () => {
  assert.match(source, /from\('coupons'\)\.update\(payload\)\.eq\('id',editingCoupon\.id\)/);
  assert.match(source, /from\('campaigns'\)\.update\(payload\)\.eq\('id',editingCampaign\.id\)/);
});

test('promotion operations surface loading and mutation errors', () => {
  assert.match(source, /couponError\|\|campaignError/);
  assert.match(source, /Durum değiştirilemedi/);
  assert.match(source, /setSaving\(true\)/);
});

test('promotion lists support search and activation filters', () => {
  assert.match(source, /const filteredCoupons=useMemo/);
  assert.match(source, /const filteredCampaigns=useMemo/);
  assert.match(source, /status==='all'\|\|\(status==='active'\?item\.is_active:!item\.is_active\)/);
});
