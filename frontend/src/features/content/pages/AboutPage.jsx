import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, MapPin, Phone, Mail, Fish } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <Fish size={28} color="#0284c7" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Giới Thiệu Về Hệ Thống AquaCraft Đà Nẵng
          </h1>
        </div>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>
          AquaCraft là hệ thống trại cá cảnh và cửa hàng sinh vật thủy sinh tại TP. Đà Nẵng, chuyên nhân giống,
          thuần dưỡng và phân phối hơn 250 dòng cá cảnh nước ngọt, cá biển, tép cảnh, cây thủy sinh và phụ kiện hồ cá.
          Mỗi lô cá trước khi xuất trại đều được dưỡng cách ly đủ ngày, kiểm tra khỏe mạnh và đóng gói oxy tiêu chuẩn.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <ShieldCheck size={24} color="#059669" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem' }}>Bảo Hành Cá Sống 100%</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Cam kết cá khỏe mạnh khi nhận hàng, hỗ trợ đổi trả / hoàn tiền nhanh nếu phát sinh rủi ro khi mở bọc.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Truck size={24} color="#0284c7" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem' }}>Giao Hỏa Tốc Đà Nẵng & Toàn Quốc</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Giao nội thành Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ, Liên Chiểu trong ngày và đóng oxy 48h toàn quốc.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Phone size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem' }}>Hỗ Trợ Kỹ Thuật 24/7</h3>
          <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> TP. Đà Nẵng</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} /> Hotline/Zalo: 0332127582</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> support@aquacraft.vn</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <Link
          to="/products"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Khám phá danh mục sản phẩm AquaCraft
        </Link>
      </div>
    </div>
  );
}
