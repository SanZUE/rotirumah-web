'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { rupiah } from '@/lib/data';
import { useCart } from '@/components/CartProvider';
import { whatsappUrl } from '@/lib/contact';

const SHIPPING = 10000;

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const total = useMemo(() => subtotal + (items.length ? SHIPPING : 0), [items.length, subtotal]);
  const message = useMemo(() => {
    const lines = items.map((item) => `- ${item.name}${item.variant ? ` (${item.variant})` : ''} x${item.qty} = ${rupiah(item.price * item.qty)}`);
    return ["Halo RotiRumah, saya ingin memesan:", '', ...lines, '', `Subtotal: ${rupiah(subtotal)}`, `Ongkir: ${rupiah(items.length ? SHIPPING : 0)}`, `Total: ${rupiah(total)}`].join('\n');
  }, [items, subtotal, total]);

  return <main><section className="page-hero"><div className="container"><div className="eyebrow">Order</div><h1>Keranjang belanja</h1><p>{itemCount ? `${itemCount} item siap dipesan.` : 'Keranjangmu masih kosong. Pilih produk dari menu untuk mulai memesan.'}</p></div></section><section className="section" style={{ paddingTop: 10 }}><div className="container">{!items.length ? <div className="empty-state"><div><h1>Keranjang kosong</h1><p>Pilih produk, varian, dan jumlah dari halaman menu.</p><Link href="/menu" className="btn btn-brown">Lihat Menu</Link></div></div> : <div className="cart-layout"><div className="cart-list">{items.map((item) => <article key={item.key} className="cart-item"><img src={item.image} alt={item.name}/><div><strong>{item.name}</strong><div style={{fontSize:13,color:'var(--muted)',marginTop:5}}>{item.variant ? `Varian: ${item.variant} · ` : ''}{rupiah(item.price)}</div><div className="cart-controls"><button type="button" onClick={() => updateQuantity(item.key, item.qty - 1)} disabled={item.qty === 1}>−</button><span>{item.qty}</span><button type="button" onClick={() => updateQuantity(item.key, item.qty + 1)}>+</button><button type="button" className="remove-btn" onClick={() => removeItem(item.key)}>Hapus</button></div></div><strong>{rupiah(item.price * item.qty)}</strong></article>)}<div style={{display:'flex', gap:12, flexWrap:'wrap'}}><Link href="/menu" className="link-more">← Lanjut belanja</Link><button type="button" className="text-button" onClick={clearCart}>Kosongkan keranjang</button></div></div><aside className="summary"><h3 style={{marginTop:0}}>Ringkasan pesanan</h3><div className="summary-row"><span>Item</span><span>{itemCount}</span></div><div className="summary-row"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div><div className="summary-row"><span>Ongkir</span><span>{rupiah(SHIPPING)}</span></div><div className="summary-total"><span>Total</span><span>{rupiah(total)}</span></div><a className="btn btn-brown" style={{width:'100%',marginTop:18}} href={whatsappUrl(message)} target="_blank" rel="noreferrer">Pesan via WhatsApp</a></aside></div>}</div></section></main>;
}
