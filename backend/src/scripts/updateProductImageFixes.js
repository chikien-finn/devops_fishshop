import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';

const IMAGE_FIXES = [
  {
    id: '6afbf280d0890c9cd110d830',
    slug: 'loc-thac-treo-mini-sobo-wp-303h-tich-hop-hut-vang-5w-280l-h',
    name: 'Lọc Thác Treo Mini Sobo WP-303H Tích Hợp Hút Váng (5W - 280L/h)',
    images: ['https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d82e',
    slug: 'be-kinh-sieu-trong-ultra-clear-30x20x20cm-kinh-5-ly-vat-canh',
    name: 'Bể Kính Siêu Trong Ultra Clear 30x20x20cm (Kính 5 Ly Vát Cạnh)',
    images: ['https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d831',
    slug: 'loc-thung-ngoai-sunsun-hw-603b-cho-be-thuy-sinh-6w-400l-h',
    name: 'Lọc Thùng Ngoài SunSun HW-603B Cho Bể Thủy Sinh (6W - 400L/h)',
    images: ['https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d82f',
    slug: 'be-kinh-duc-uon-canh-bo-tron-lien-khoi-40x25x25cm-kinh-8-ly',
    name: 'Bể Kính Đúc Uốn Cạnh Bo Tròn Liền Khối 40x25x25cm (Kính 8 Ly)',
    images: ['https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d832',
    slug: 'den-led-thuy-sinh-chihiros-a-series-chinh-7-cap-do-sang-a301-30cm',
    name: 'Đèn LED Thủy Sinh Chihiros A-Series Chỉnh 7 Cấp Độ Sáng (A301 - 30cm)',
    images: ['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d833',
    slug: 'den-kep-ban-thuy-sinh-wrgb-sieu-sang-doi-mau-da-sac-15w',
    name: 'Đèn Kẹp Bàn Thủy Sinh WRGB Siêu Sáng Đổi Màu Đa Sắc (15W)',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d834',
    slug: 'may-sui-khi-oxy-sieu-em-usb-mini-2-voi-chong-on-cho-ho-ca-3w',
    name: 'Máy Sủi Khí Oxy Siêu Êm USB Mini 2 Vòi Chống Ồn Cho Hồ Cá (3W)',
    images: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d835',
    slug: 'binh-khi-co2-nhom-duc-1l-kem-van-dien-mufan-chuyen-thuy-sinh',
    name: 'Bình Khí CO2 Nhôm Đúc 1L Kèm Van Điện Mufan Chuyên Thủy Sinh',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d836',
    slug: 'bo-nhip-thang-keo-tia-cay-inox-27cm-chong-ri-chuyen-dung',
    name: 'Bộ Nhíp Thẳng & Kéo Tỉa Cây Inox 27cm Chống Rỉ Chuyên Dụng',
    images: ['https://images.unsplash.com/photo-1516683037151-9a17603a8dc7?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6afbf280d0890c9cd110d837',
    slug: 'phan-nen-thuy-sinh-cao-cap-gex-xanh-soil-nhat-ban-tui-2kg',
    name: 'Phân Nền Thủy Sinh Cao Cấp Gex Xanh Soil Nhật Bản (Túi 2kg)',
    images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=60']
  },
  {
    id: '6aec892a5bf2a9de515a95f8',
    slug: 'cay-thuy-sinh-ray-nana-cot-lua',
    name: 'Cây Thủy Sinh Ráy Nana Cột Lũa (Anubias Nana)',
    images: ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=60']
  }
];

const run = async () => {
  console.log('[FixImages] Kết nối tới MongoDB...');
  await mongoose.connect(ENV.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log(`[FixImages] Cập nhật ${IMAGE_FIXES.length} sản phẩm phụ kiện/bể kính/cây thủy sinh...`);
  for (const item of IMAGE_FIXES) {
    const res = await Product.updateOne(
      {
        $or: [
          { _id: item.id },
          { slug: item.slug },
          { name: item.name }
        ]
      },
      {
        $set: {
          images: item.images,
          updatedAt: new Date()
        }
      }
    );
    console.log(`  ✓ [${item.name}]: Matched ${res.matchedCount}, Modified ${res.modifiedCount}`);
  }

  console.log('[FixImages] Hoàn tất cập nhật ảnh sản phẩm!');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[FixImages Lỗi]:', err);
  process.exit(1);
});
