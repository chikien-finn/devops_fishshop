import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShoppingBag color="#0284c7" /> Giỏ hàng của bạn
      </h1>
      <p style={{ color: '#64748b' }}>Giỏ hàng hiện đang trống.</p>
    </div>
  );
}

