import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const layout=await readFile(new URL('../src/app/admin/layout.tsx',import.meta.url),'utf8');
const navigation=await readFile(new URL('../src/app/admin/AdminNavigation.tsx',import.meta.url),'utf8');

test('admin layout uses the shared responsive navigation',()=>{
 assert.match(layout,/import AdminNavigation/);
 assert.match(layout,/<AdminNavigation\/>/);
 assert.match(layout,/<AdminGate>/);
});
test('admin navigation marks exact and nested routes active',()=>{
 assert.match(navigation,/href==='\/admin'\?pathname===href/);
 assert.match(navigation,/pathname\.startsWith\(href\+'\/'\)/);
 assert.match(navigation,/aria-current=\{active\(href\)\?'page':undefined\}/);
});
test('mobile admin menu is accessible and closes after navigation',()=>{
 assert.match(navigation,/aria-expanded=\{open\}/);
 assert.match(navigation,/aria-controls="admin-menu"/);
 assert.match(navigation,/useEffect\(\(\)=>\{setOpen\(false\)\},\[pathname\]\)/);
});
test('admin navigation exposes store preview and logout',()=>{
 assert.match(navigation,/href="\/" target="_blank"/);
 assert.match(navigation,/href="\/admin\/logout"/);
});
