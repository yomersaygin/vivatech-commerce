'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
type Props={product:{id:string;name:string;slug:string;price:number;stock_quantity:number;image_url?:string|null}};
export function AddToCartButton({product}:Props){const {addItem}=useCart();const [added,setAdded]=useState(false);return <button className="button" disabled={product.stock_quantity<=0} onClick={()=>{addItem(product,1);setAdded(true);setTimeout(()=>setAdded(false),1200)}}>{added?'Sepete Eklendi ✓':'Sepete Ekle'}</button>}
