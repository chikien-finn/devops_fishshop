import { BookOpen, Droplets, Thermometer, ShieldCheck, AlertTriangle } from 'lucide-react';

const GUIDES = [
  {
    title: '1. Chu trình vi sinh (Cycle hồ trước khi thả cá)',
    icon: ShieldCheck,
    color: '#059669',
    points: [
      'Khử Clo trong nước máy bằng dung dịch khử Clo hoặc phơi nước tối thiểu 24 giờ trước khi đổ vào hồ.',
      'Châm men vi sinh sống và chạy lọc liên tục 7 - 14 ngày để thiết lập hệ vi sinh xử lý Amoniac (NH3) và Nitrit (NO2).',
      'Thả trước một ít cá khỏe để test nước trước khi thả các dòng nhạy cảm như Cá Dĩa, Cá Neon hoặc Tép.',
    ],
  },
  {
    title: '2. Kiểm soát Nhiệt độ & Độ pH chuẩn từng dòng',
    icon: Thermometer,
    color: '#0284c7',
    points: [
      'Cá cảnh nhiệt đới (Neon, Betta, Chuột, Ali): nhiệt độ ổn định 25 - 28°C, pH 6.5 - 7.5.',
      'Cá Dĩa & Thần Tiên: cần nước ấm hơn (27 - 30°C) và ít dao động nhiệt giữa ngày và đêm.',
      'Tép Thủy Sinh: ưu tiên nước mát 22 - 26°C, pH 6.2 - 6.8 và cần thay nước từ từ theo phương pháp nhỏ giọt.',
    ],
  },
  {
    title: '3. Kỹ thuật thả cá mới mua (Chống sốc nước)',
    icon: Droplets,
    color: '#9333ea',
    points: [
      'Ngâm nguyên túi cá vào mặt hồ 15 - 20 phút để cân bằng nhiệt độ trong túi và hồ nuôi.',
      'Mở túi, múc từ từ từng ít nước hồ pha vào túi (khoảng 30% thể tích túi) trong 10 - 15 phút để cá quen độ pH.',
      'Dùng vợt nhẹ nhàng vớt cá thả vào hồ; bỏ nước cũ trong túi, không đổ nước túi trực tiếp vào hồ chính.',
    ],
  },
  {
    title: '4. Phòng bệnh & Cho ăn đúng cách',
    icon: AlertTriangle,
    color: '#d97706',
    points: [
      'Chỉ cho lượng thức ăn cá ăn hết trong vòng 2 - 3 phút; thức ăn thừa làm tăng khí độc và gây đục nước.',
      'Thay nước định kỳ 20 - 30% mỗi tuần, hút cặn đáy và vệ sinh bông lọc bằng chính nước hồ cũ để tránh chết vi sinh.',
      'Không tắt lọc qua đêm vì vi sinh hiếu khí sẽ thiếu oxy và chết hàng loạt sau vài giờ ngắt dòng.',
    ],
  },
];

export default function KnowledgePage() {
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <BookOpen size={26} color="#0284c7" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Cẩm Nang & Kiến Thức Nuôi Cá Cảnh
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Tổng hợp kinh nghiệm xử lý nước, thuần cá mới và chăm sóc hồ thủy sinh bền vững từ đội ngũ kỹ thuật AquaCraft Đà Nẵng.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <div
              key={guide.title}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={20} color={guide.color} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{guide.title}</h2>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.885rem', lineHeight: 1.7 }}>
                {guide.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
