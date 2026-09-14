import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const admin=await readFile(new URL('../src/app/admin/banners/page.tsx',import.meta.url),'utf8');
const home=await readFile(new URL('../src/app/page.tsx',import.meta.url),'utf8');

test('banner admin validates upload type, size, links and date order',()=>{
 assert.match(admin,/IMAGE_TYPES=\['image\/jpeg','image\/png','image\/webp'\]/);
 assert.match(admin,/MAX_IMAGE_SIZE=10\*1024\*1024/);
 assert.match(admin,/safeLink\(linkUrl\)/);
 assert.match(admin,/startsAt&&endsAt&&startsAt>endsAt/);
});

test('banner uploads clean orphan files when persistence fails',()=>{
 assert.match(admin,/storage\.from\('product-images'\)\.upload\(uploadedPath,imageFile/);
 assert.match(admin,/if\(result\.error\)\{if\(uploadedPath\)await supabase\.storage\.from\('product-images'\)\.remove\(\[uploadedPath\]\)/);
});

test('banner edits and state changes are scoped to the selected id',()=>{
 assert.match(admin,/from\('site_banners'\)\.update\(payload\)\.eq\('id',editing\.id\)/);
 assert.match(admin,/update\(\{is_active:!current\}\)\.eq\('id',id\)/);
 assert.match(admin,/delete\(\)\.eq\('id',item\.id\)/);
});

test('banner list supports search, status filters and editing',()=>{
 assert.match(admin,/const filtered=useMemo/);
 assert.match(admin,/status==='all'\|\|\(status==='active'\?item\.is_active:!item\.is_active\)/);
 assert.match(admin,/setEditing\(item\)/);
});

test('public home only renders active banners inside their schedule',()=>{
 assert.match(home,/export const dynamic='force-dynamic'/);
 assert.match(home,/starts_at\.is\.null,starts_at\.lte\.'\+now/);
 assert.match(home,/ends_at\.is\.null,ends_at\.gte\.'\+now/);
});
