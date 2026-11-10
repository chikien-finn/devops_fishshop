import { Link } from 'react-router-dom';
import { Layers, Droplets, Sparkles, ArrowRight } from 'lucide-react';

const TANK_MODELS = [
  {
    id: 'iwagumi',
    title: 'Hồ Thủy Sinh Iwagumi Tối Giản',
    size: '60x40x40 cm',
    style: 'Nhật Bản - Đá & Thảm Trân Châu',
    water: 'Nước ngọt (pH 6.2 - 6.8)',
    fishSuggest: 'Cá Neon Vua, Tép Red Cherry, Cá Chuột Panda',
    priceEstimate: '3.500.000đ - 6.000.000đ',
    desc: 'Bố cục đá tự nhiên kết hợp thảm cây thấp, lọc tràn êm ái, rất hợp đặt phòng khách hoặc bàn làm việc.',
  },
  {
    id: 'biotope-amazon',
    title: 'Hồ Biotop Sông Amazon (Cá Dĩa & Thần Tiên)',
    size: '120x50x50 cm',
    style: 'Lũa rừng & Lá bàng tự nhiên',
    water: 'Nước ngọt ấm (27 - 29°C)',
    fishSuggest: 'Cá Dĩa Đỏ, Cá Thần Tiên Ai Cập, Cá Chuột Sterbai',
    priceEstimate: '8.500.000đ - 15.000.000đ',
    desc: 'Mô phỏng môi trường nước đen tự nhiên giúp cá Dĩa và Thần Tiên lên màu rực rỡ, hạn chế stress.',
  },
  {
    id: 'marine-reef',
    title: 'Hồ Cá Biển San Hô Công Nghệ Sump',
    size: '90x45x45 cm',
    style: 'Nước mặn Reef - Đá sống & San hô mềm',
    water: 'Nước mặn (Độ mặn 1.023 - 1.025)',
    fishSuggest: 'Cá Hề Nemo, Cá Thia Xanh, Tôm Bọ Ngựa Biển',
    priceEstimate: '12.000.000đ - 22.000.000đ',
    desc: 'Hệ thống lọc dưới kèm Protein Skimmer giữ nước biển trong vắt, ánh sáng Reef chuyên dụng cho san hô.',
  },
  {
    id: 'koi-mini',
    title: 'Hồ Kính & Bể Kính Kết Hợp Lọc Tràn Koi Đà Nẵng',
    size: '150x60x60 cm',
    style: 'Ngoài trời / Ban công chống thấm',
    water: 'Nước ngọt giàu oxy',
    fishSuggest: 'Cá Koi Kohaku, Showa, Cá Chép Phụng',
    priceEstimate: '10.000.000đ - 18.000.000đ',
    desc: 'Thiết kế hệ lọc Drum/Baki tuần hoàn mạnh mẽ cho dòng cá Koi size vừa nuôi ban công nhà phố.',
  },
];

export default function TankModelsPage() {
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <Layers size={26} color="#0284c7" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Bộ Sưu Tập Mẫu Hồ Cá Thủy Sinh AquaCraft
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Tham khảo các mẫu hồ cá cảnh nước ngọt, nước mặn và hồ Biotop thiết kế tối ưu tại Đà Nẵng.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {TANK_MODELS.map((model) => (
          <div
            key={model.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', backgroundColor: '#eff6ff', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', marginBottom: '0.75rem' }}>
                <Sparkles size={13} />
                <span>{model.size}</span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>{model.title}</h2>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>{model.desc}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
                <div><strong>Phong cách:</strong> {model.style}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Droplets size={14} color="#0284c7" />
                  <span><strong>Thông số:</strong> {model.water}</span>
                </div>
                <div><strong>Gợi ý cá nuôi:</strong> {model.fishSuggest}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.95rem' }}>{model.priceEstimate}</span>
              <Link
                to="/products?category=fish"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0284c7', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <span>Chọn cá phù hợp</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
