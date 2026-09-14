import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const admin=await readFile(new URL('../src/app/admin/content/page.tsx',import.meta.url),'utf8');
const home=await readFile(new URL('../src/app/page.tsx',import.meta.url),'utf8');

test('content admin validates title, placement, link and ordering',()=>{
 assert.match(admin,/if\(!title\)/);
 assert.match(admin,/Object\.hasOwn\(placements,placement\)/);
 assert.match(admin,/safeLink\(linkUrl\)/);
 assert.match(admin,/!Number\.isInteger\(sortOrder\)\|\|sortOrder<0/);
});

test('content mutations are scoped to selected records',()=>{
 assert.match(admin,/from\('content_blocks'\)\.update\(payload\)\.eq\('id',editing\.id\)/);
 assert.match(admin,/update\(\{is_active:!current\}\)\.eq\('id',id\)/);
 assert.match(admin,/delete\(\)\.eq\('id',item\.id\)/);
});

test('content list supports search, placement and activation filters',()=>{
 assert.match(admin,/const filtered=useMemo/);
 assert.match(admin,/placementFilter==='all'\|\|item\.placement===placementFilter/);
 assert.match(admin,/status==='all'\|\|\(status==='active'\?item\.is_active:!item\.is_active\)/);
});

test('every admin placement is connected to the public home page',()=>{
 for(const placement of ['home_after_hero','home_after_categories','home_after_products','home_before_footer']){
  assert.match(home,new RegExp('ContentBlocks items=\\{content\\} placement="'+placement+'"'));
 }
});
