import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Ticket,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  Fish,
  Layers,
} from 'lucide-react';
import productService, { isRequestCanceled } from '../../products/services/productService.js';
import { orderService } from '../../orders/services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { useCart } from '../../cart/hooks/useCart.jsx';

const STATIC_VOUCHERS = [
  {
    code: 'AQUACHAO',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 150000,
    maxDiscount: 50000,
    usageLimit: 500,
    usedCount: 42,
    desc: 'Giảm 10% tối đa 50.000đ cho đơn cá cảnh đầu tiên từ 150k',
    tag: 'Khách hàng mới',
    tagColor: '#0284c7',
  },
  {
    code: 'FREESHIPDN',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderAmount: 200000,
    maxDiscount: 30000,
    usageLimit: 1000,
    usedCount: 185,
    desc: 'Miễn phí giao hàng hỏa tốc 1 - 2h tại nội thành Đà Nẵng',
    tag: 'Freeship hỏa tốc',
    tagColor: '#059669',
  },
  {
    code: 'VIPTHUYSINH',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 500000,
    maxDiscount: 50000,
    usageLimit: 300,
    usedCount: 88,
    desc: 'Giảm ngay 50.000đ cho đơn hàng phụ kiện hồ kính từ 500k',
    tag: 'Hồ & Thiết bị',
    tagColor: '#d97706',
  },
  {
    code: 'AQUAPRO',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1000000,
    maxDiscount: 200000,
    usageLimit: 200,
    usedCount: 37,
    desc: 'Giảm 15% tối đa 200.000đ cho đơn sỉ/lẻ cá cảnh cao cấp từ 1 triệu',
    tag: 'VIP Member',
    tagColor: '#7c3aed',
  },
];

const PROMO_COMBOS = [
  {
    id: 'combo-1',
    name: 'Combo Hồ Kính Để Bàn Khởi Nghiệp (Tặng 5 Cá Neon)',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&auto=format&fit=crop&q=80',
    originalPrice: 420000,
    salePrice: 299000,
    discountBadge: 'Tiết kiệm 121K',
    items: [
      'Bể Kính Siêu Trong Ultra Clear 30x20x20cm (5 Ly vát cạnh)',
      'Lọc Thác Treo Mini Sobo WP-303H tích hợp hút váng',
      'Đèn Kẹp Bàn Thủy Sinh WRGB 15W siêu sáng',
      'Tặng kèm: 5 chú cá Neon Bụng Đỏ khỏe mạnh',
    ],
  },
  {
    id: 'combo-2',
    name: 'Combo Đàn Cá Neon & Dọn Bể Thần Tốc (Tặng Cám Dinh Dưỡng)',
    image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=600&auto=format&fit=crop&q=80',
    originalPrice: 260000,
    salePrice: 185000,
    discountBadge: 'Tiết kiệm 75K',
    items: [
      '10 chú Cá Neon Bạc & Neon Hoàng Đế bơi đàn rực rỡ',
      '2 chú Cá Chuột Vệ Sinh Hồ dọn thức ăn thừa',
      '1 Hũ Cám Hạt Nổi Cao Cấp Hikari tăng màu',
      'Đóng túi oxy 3 lớp an toàn giao nhanh Đà Nẵng',
    ],
  },
  {
    id: 'combo-3',
    name: 'Combo Hồ Biotop Thác Nước & Khí CO2 Chuyên Sâu',
    image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&auto=format&fit=crop&q=80',
    originalPrice: 850000,
    salePrice: 650000,
    discountBadge: 'Tiết kiệm 200K',
    items: [
      'Bể Kính Đúc Uốn Cạnh Bo Tròn Liền Khối 40x25x25cm (8 Ly)',
      'Lọc Thùng Ngoài SunSun HW-603B êm ái tuần hoàn',
      'Bình Khí CO2 Nhôm Đúc 1L van điện Mufan',
      'Tặng kèm: Phân nền thủy sinh Gex Soil Nhật Bản (Túi 2kg)',
    ],
  },
];

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState(STATIC_VOUCHERS);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });
  const { addToCart } = useCart();

  // Countdown timer to midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active coupons from backend
  useEffect(() => {
    orderService
      .getActiveCoupons()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge descriptions/tags if matching
          const merged = data.map((c) => {
            const found = STATIC_VOUCHERS.find((sv) => sv.code === c.code);
            return {
              ...c,
              desc: found?.desc || (c.discountType === 'percentage' ? `Giảm ${c.discountValue}% cho đơn từ ${formatCurrency(c.minOrderAmount)}` : `Giảm ${formatCurrency(c.discountValue)} cho đơn từ ${formatCurrency(c.minOrderAmount)}`),
              tag: found?.tag || (c.discountType === 'percentage' ? `Giảm ${c.discountValue}%` : `Giảm ${formatCurrency(c.discountValue)}`),
              tagColor: found?.tagColor || '#0284c7',
            };
          });
          setCoupons(merged);
        }
      })
      .catch(() => {
        // Keep static fallback
      });
  }, []);

  // Fetch flash sale products
  useEffect(() => {
    const controller = new AbortController();
    setLoadingProducts(true);

    productService
      .getProducts({ sale: 'true', limit: 8, sort: 'newest' }, { signal: controller.signal })
      .then((res) => {
        setSaleProducts(res.items || []);
        setLoadingProducts(false);
      })
      .catch((err) => {
        if (isRequestCanceled(err)) return;
        setLoadingProducts(false);
      });

    return () => controller.abort();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Đã sao chép mã "${code}"! Áp dụng tại Giỏ hàng.`);
    setTimeout(() => setCopiedCode(null), 2500);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddComboToCart = (combo) => {
    const dummyProduct = {
      _id: combo.id,
      name: combo.name,
      price: combo.salePrice,
      images: [combo.image],
      stock: 50,
    };
    addToCart(dummyProduct, 1);
    setToastMessage(`Đã thêm "${combo.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddProductToCart = (p) => {
    addToCart(p, 1);
    setToastMessage(`Đã thêm "${p.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO BANNER & FLASH SALE COUNTDOWN */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Flame size={14} color="#f59e0b" />
            <span>Đại Tiệc Ưu Đãi AquaCraft Đà Nẵng</span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '0.85rem',
            }}
          >
            Tuần Lễ Vàng Cá Cảnh & Thủy Sinh — Giảm Đến 50%
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#e0f2fe',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Săn deal cá cảnh thuần dưỡng, tép thủy sinh, hồ kính siêu trong và phụ kiện chính hãng với mức giá hấp dẫn nhất. Hỗ trợ giao hỏa tốc 1 - 2 giờ tại Đà Nẵng, bảo hành cá sống 100%.
          </p>

          {/* Countdown & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Clock size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Flash Sale kết thúc sau:</span>
              <div style={{ display: 'flex', gap: '4px', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                <span style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <a
              href="#voucher-hub"
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                padding: '9px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Ticket size={16} />
              <span>Thu thập mã giảm giá</span>
            </a>

            <a
              href="#flash-sale"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '9px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Xem cá sale sốc</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. KHO MÃ GIẢM GIÁ (VOUCHER HUB) */}
      <section id="voucher-hub" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.25rem',
              }}
            >
              <Ticket size={22} color="#0284c7" />
              <span>Kho Mã Giảm Giá Hôm Nay</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Sao chép mã voucher và dán tại bước thanh toán Giỏ hàng để nhận chiết khấu trực tiếp.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const percentUsed = coupon.usageLimit ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100)) : 50;

            return (
              <div
                key={coupon.code}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        backgroundColor: `${coupon.tagColor || '#0284c7'}15`,
                        color: coupon.tagColor || '#0284c7',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {coupon.tag || 'Mã ưu đãi'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {coupon.usageLimit ? `Còn ${coupon.usageLimit - coupon.usedCount} lượt` : 'Đang áp dụng'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                      {coupon.discountType === 'percentage'
                        ? `GIẢM ${coupon.discountValue}%`
                        : `GIẢM ${formatCurrency(coupon.discountValue)}`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                    {coupon.desc}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginBottom: '4px' }}>
                      <span>Đã dùng: {percentUsed}%</span>
                      <span>HSD: 31/12/2026</span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentUsed}%`,
                          backgroundColor: percentUsed > 80 ? '#dc2626' : '#0284c7',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Code box & Copy button */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: '#0f172a',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                      }}
                    >
                      {coupon.code}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      style={{
                        padding: '7px 12px',
                        backgroundColor: isCopied ? '#059669' : '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Đã lưu' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CÁC GÓI COMBO TIẾT KIỆM (COMBO DEALS) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '0.25rem',
            }}
          >
            <Layers size={22} color="#0284c7" />
            <span>Gói Combo Thủy Sinh Tiết Kiệm (Trọn Gói)</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Setup hồ cá đầy đủ thiết bị và sinh vật cảnh với chi phí tối ưu nhất, nhận hàng là chơi ngay.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PROMO_COMBOS.map((combo) => (
            <div
              key={combo.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', height: '190px', backgroundColor: '#f1f5f9' }}>
                <img
                  src={combo.image}
                  alt={combo.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/fish_neon.jpg';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {combo.discountBadge}
                </span>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {combo.name}
                  </h3>

                  <ul style={{ paddingLeft: '1.1rem', margin: '0 0 1rem 0', color: '#475569', fontSize: '0.8125rem', lineHeight: 1.7 }}>
                    {combo.items.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', display: 'block' }}>
                      {formatCurrency(combo.originalPrice)}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                      {formatCurrency(combo.salePrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddComboToCart(combo)}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Mua combo</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DANH SÁCH CÁ CẢNH & PHỤ KIỆN FLASH SALE */}
      <section id="flash-sale" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.25rem',
              }}
            >
              <Flame size={22} color="#dc2626" />
              <span>Sản Phẩm Đang Flash Sale Hôm Nay</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Giá sốc giới hạn số lượng trong ngày, bảo hành cá sống 100% khi mở thùng tại Đà Nẵng.
            </p>
          </div>

          <Link
            to="/products?sale=true"
            style={{
              color: '#0284c7',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Xem tất cả sản phẩm sale</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Fish size={36} color="#0284c7" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            Đang tải sản phẩm khuyến mãi...
          </div>
        ) : saleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            Hiện chưa có thêm sản phẩm flash sale nào trong danh mục.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {saleProducts.map((p) => {
              const oldPrice = p.oldPrice ? Number(p.oldPrice) : null;
              const hasOld = oldPrice && oldPrice > p.price;

              return (
                <div
                  key={p._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.03)';
                  }}
                >
                  <Link
                    to={`/products/${p.slug || p._id}`}
                    style={{
                      height: '180px',
                      backgroundColor: '#f8fafc',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'block',
                    }}
                  >
                    <img
                      src={p.images?.[0] || '/fish_neon.jpg'}
                      alt={p.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/fish_neon.jpg';
                      }}
                    />

                    {p.discount && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {p.discount}
                      </span>
                    )}
                  </Link>

                  <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          marginBottom: '0.4rem',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        <Link to={`/products/${p.slug || p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {p.name}
                        </Link>
                      </h4>
                    </div>

                    <div style={{ marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>
                          {formatCurrency(p.price)}
                        </span>
                        {hasOld && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatCurrency(oldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProductToCart(p)}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShoppingBag size={13} />
                        <span>Chọn mua</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. CHÍNH SÁCH ĐẶC QUYỀN AQUACRAFT */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Đặc Quyền Mua Sắm Tại AquaCraft Đà Nẵng
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
            Chúng tôi cam kết chất lượng sinh vật cảnh và dịch vụ chăm sóc tốt nhất cho hồ cá của bạn
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px', color: '#0284c7' }}>
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                Giao Hỏa Tốc 1 - 2H
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                Đóng oxy 3 lớp, giữ nhiệt an toàn đến tận tay tại nội thành Đà Nẵng.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', color: '#059669' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                Bảo Hành Cá Sống 100%
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                Quay video khi khui thùng, hoàn tiền hoặc đổi bù cá mới ngay lập tức nếu có rủi ro.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', color: '#d97706' }}>
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                Đổi Trả Phụ Kiện 7 Ngày
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                Lỗi 1 đổi 1 trong 7 ngày đối với máy lọc, máy sủi oxy và đèn thủy sinh.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#f3e8ff', padding: '10px', borderRadius: '8px', color: '#7c3aed' }}>
              <Gift size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                Tích Điểm VIP Member
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                Tích lũy 5% cho mỗi đơn hàng để đổi voucher giảm giá vào các đợt mua tiếp theo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
