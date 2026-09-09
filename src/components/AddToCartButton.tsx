'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
type Props={product:{id:string;name:string;slug:string;price:number;stock_quantity:number;image_url?:string|null};className?:string;label?:string};
export function AddToCartButton({product,className,label='Sepete Ekle'}:Props){const {addItem}=useCart();const [added,setAdded]=useState(false);return <button type="button" className={className||'button'} disabled={product.stock_quantity<=0} onClick={()=>{addItem(product,1);setAdded(true);setTimeout(()=>setAdded(false),1200)}}>{product.stock_quantity<=0?'Stokta Yok':added?'Sepete Eklendi ✓':label}</button>}
