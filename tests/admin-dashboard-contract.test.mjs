import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/app/admin/page.tsx',import.meta.url),'utf8');

test('admin dashboard loads within the authenticated browser session',()=>{
 assert.match(source,/^'use client'/);
 assert.match(source,/useEffect\(\(\)=>/);
 assert.doesNotMatch(source,/export const dynamic/);
});

test('dashboard queries only operational summary fields',()=>{
 assert.match(source,/select\('id,name,sku,stock_quantity,is_active'\)/);
 assert.match(source,/select\('id,order_number,status,payment_status,total_amount,created_at,customers\(first_name,last_name\)'\)/);
 assert.match(source,/\.limit\(5\)/);
});

test('dashboard exposes actionable orders and stock alerts',()=>{
 assert.match(source,/İşlem bekleyen sipariş/);
 assert.match(source,/Kritik veya tükenen stok/);
 assert.match(source,/href=\{`\/admin\/orders\/\$\{order\.id\}`\}/);
 assert.match(source,/href=\{`\/admin\/products\/\$\{product\.id\}\/edit`\}/);
});
