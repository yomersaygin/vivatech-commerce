'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, cartCount, cartSubtotal, clampQuantity } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

type CouponState={code:string;discount:number;message?:string}|null;
type CartContextValue={items:CartItem[];count:number;subtotal:number;coupon:CouponState;discount:number;total:number;couponBusy:boolean;addItem:(item:Omit<CartItem,'quantity'>,quantity?:number)=>void;setQuantity:(id:string,quantity:number)=>void;removeItem:(id:string)=>void;clearCart:()=>void;applyCoupon:(code:string)=>Promise<boolean>;clearCoupon:()=>void;};
const CartContext=createContext<CartContextValue|null>(null);const STORAGE_KEY='vivatech-cart-v1';const COUPON_KEY='vivatech-coupon-v1';
export function CartProvider({children}:{children:React.ReactNode}){const [items,setItems]=useState<CartItem[]>([]);const [ready,setReady]=useState(false);const [coupon,setCoupon]=useState<CouponState>(null);const [couponBusy,setCouponBusy]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)setItems(JSON.parse(raw));const c=localStorage.getItem(COUPON_KEY);if(c)setCoupon({code:c,discount:0});}catch{}finally{setReady(true)}},[]);
 useEffect(()=>{if(ready)localStorage.setItem(STORAGE_KEY,JSON.stringify(items));},[items,ready]);
 const subtotal=cartSubtotal(items);
 async function applyCoupon(code:string){const clean=code.trim().toUpperCase();if(!clean){setCoupon(null);localStorage.removeItem(COUPON_KEY);return false;}setCouponBusy(true);const {data,error}=await supabase.rpc('validate_coupon',{p_code:clean,p_subtotal:subtotal});setCouponBusy(false);const r=data as any;if(error||!r?.valid){setCoupon({code:clean,discount:0,message:r?.message||error?.message||'Kupon geçersiz'});return false;}setCoupon({code:r.code||clean,discount:Number(r.discount_amount)||0});localStorage.setItem(COUPON_KEY,r.code||clean);return true;}
 useEffect(()=>{if(!ready||!coupon?.code)return;applyCoupon(coupon.code);},[subtotal,ready]);
 const clearCoupon=()=>{setCoupon(null);localStorage.removeItem(COUPON_KEY)};
 const value=useMemo<CartContextValue>(()=>({items,count:cartCount(items),subtotal,coupon,discount:coupon?.discount||0,total:Math.max(0,subtotal-(coupon?.discount||0)),couponBusy,addItem:(item,quantity=1)=>setItems(current=>{const existing=current.find(x=>x.id===item.id);if(existing)return current.map(x=>x.id===item.id?{...x,quantity:clampQuantity(x.quantity+quantity,item.stock_quantity),stock_quantity:item.stock_quantity,price:item.price}:x);const q=clampQuantity(quantity,item.stock_quantity);return q?[...current,{...item,quantity:q}]:current;}),setQuantity:(id,quantity)=>setItems(current=>current.map(x=>x.id===id?{...x,quantity:clampQuantity(quantity,x.stock_quantity)}:x).filter(x=>x.quantity>0)),removeItem:(id)=>setItems(current=>current.filter(x=>x.id!==id)),clearCart:()=>{setItems([]);clearCoupon()},applyCoupon,clearCoupon}),[items,subtotal,coupon,couponBusy]);return <CartContext.Provider value={value}>{children}</CartContext.Provider>}
export function useCart(){const ctx=useContext(CartContext);if(!ctx)throw new Error('useCart must be used inside CartProvider');return ctx}
