export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  stock_quantity: number;
  image_url?: string | null;
};

export function clampQuantity(quantity:number, stock:number){
  if (stock <= 0) return 0;
  return Math.min(Math.max(1, Math.trunc(quantity || 1)), stock);
}

export function cartSubtotal(items:CartItem[]){
  return items.reduce((sum,item)=>sum + item.price * item.quantity, 0);
}

export function cartCount(items:CartItem[]){
  return items.reduce((sum,item)=>sum + item.quantity, 0);
}
