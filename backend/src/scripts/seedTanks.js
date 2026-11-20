import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';
import Product from '../features/products/product.model.js';

const TANK_PRODUCTS = [
  {
    name: 'Hồ Thủy Sinh Iwagumi Tối Giản (Trọn Gói 60cm)',
    slug: 'ho-thuy-sinh-iwagumi-toi-gian',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 3500000,
    oldPrice: 4200000,
    discount: '17%',
    stock: 10,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'],
    description: 'Bố cục đá tự nhiên Iwagumi kết hợp thảm trân châu ngọc trai xanh mướt, lọc thùng êm ái, rất hợp đặt phòng khách hoặc bàn làm việc sang trọng.'
  },
  {
    name: 'Hồ Thủy Sinh Rừng Rậm Lũa Bonsai (Trọn Gói 90cm)',
    slug: 'ho-thuy-sinh-rung-ram-lua-bonsai',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 7500000,
    oldPrice: 8900000,
    discount: '16%',
    stock: 10,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1520637736862-23c2a3e0b4a4?w=800&auto=format&fit=crop&q=80'],
    description: 'Tuyệt phẩm bố cục cây cổ thụ bonsai tán rêu xanh mướt giữa dòng suối sỏi trắng tự nhiên, tạo cảm giác thư thái và mát mắt cho cả căn phòng.'
  },
  {
    name: 'Hồ Thủy Sinh Hà Lan (Dutch Style) Đa Sắc (120cm)',
    slug: 'ho-thuy-sinh-ha-lan-dutch-style',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 14000000,
    oldPrice: 16500000,
    discount: '15%',
    stock: 8,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1571752726703-5e7d1f6598a1?w=800&auto=format&fit=crop&q=80'],
    description: 'Khu vườn dưới nước rực rỡ sắc màu với các luống cây thủy sinh đỏ, cam, xanh đan xen nghệ thuật, phối hợp hệ thống làm mát Chiller chuyên nghiệp.'
  },
  {
    name: 'Bể Bán Cạn Paludarium Thác Nước Rêu Rừng (80cm)',
    slug: 'be-ban-can-paludarium-thac-nuoc',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 6800000,
    oldPrice: 7900000,
    discount: '14%',
    stock: 10,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80'],
    description: 'Mô phỏng vách núi rừng nhiệt đới với thác nước róc rách, sương khói mờ ảo và thảm thực vật dương xỉ, phong lan mini và rêu bán cạn tự nhiên.'
  },
  {
    name: 'Hồ Nano Cube Để Bàn Làm Việc Siêu Tinh Tế (30cm)',
    slug: 'ho-nano-cube-de-ban-lam-viec',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 1200000,
    oldPrice: 1500000,
    discount: '20%',
    stock: 15,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'],
    description: 'Kích thước nhỏ gọn lý tưởng cho bàn làm việc công sở, quầy lễ tân hoặc kệ sách. Cây phát triển chậm, dễ chăm sóc mà không cần bình CO2 phức tạp.'
  },
  {
    name: 'Hồ Biotop Sông Amazon Nước Đen Nuôi Cá Dĩa (120cm)',
    slug: 'ho-biotop-song-amazon-nuoc-den',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 8500000,
    oldPrice: 9800000,
    discount: '13%',
    stock: 8,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80'],
    description: 'Mô phỏng nguyên bản lòng sông Rio Negro xứ Amazon. Nước ngả màu trà tự nhiên giàu tannin giúp cá Dĩa và Thần Tiên căng màu rực rỡ, đề kháng cực cao.'
  },
  {
    name: 'Hồ Biotop Khe Suối Đá Cuội Đông Dương (100cm)',
    slug: 'ho-biotop-khe-suoi-da-cuoi-dong-duong',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 5500000,
    oldPrice: 6500000,
    discount: '15%',
    stock: 10,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&auto=format&fit=crop&q=80'],
    description: 'Tái hiện sinh cảnh suối nguồn trong vắt với luồng nước tuần hoàn mát rượi, cá thích bơi ngược dòng và bám vào các phiến cuội nhẵn mịn.'
  },
  {
    name: 'Hồ Biotop Châu Phi - Rạn Đá Hồ Malawi Nuôi Cá Ali (120cm)',
    slug: 'ho-biotop-chau-phi-ran-da-malawi',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 9000000,
    oldPrice: 10500000,
    discount: '14%',
    stock: 8,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&auto=format&fit=crop&q=80'],
    description: 'Được mệnh danh là "rạn san hô nước ngọt" nhờ màu sắc rực rỡ từ đàn cá Ali Thái bơi lội qua các khe hang đá vôi kỳ vĩ.'
  },
  {
    name: 'Hồ Cá Biển San Hô Công Nghệ Sump Đáy (90cm)',
    slug: 'ho-ca-bien-san-ho-sump-day',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    waterType: 'saltwater',
    price: 15000000,
    oldPrice: 17500000,
    discount: '14%',
    stock: 6,
    isActive: true,
    origin: 'Việt Nam',
    images: ['https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80'],
    description: 'Mang đại dương thu nhỏ vào ngôi nhà của bạn với san hô mềm chuyển động theo làn sóng và cặp cá hề Nemo bơi lội trong hải quỳ phát quang.'
  },
  {
    name: 'Hồ Nano Marine Nước Mặn All-In-One Để Bàn (40cm)',
    slug: 'ho-nano-marine-nuoc-man-de-ban',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    waterType: 'saltwater',
    price: 4500000,
    oldPrice: 5200000,
    discount: '13%',
    stock: 12,
    isActive: true,
    origin: 'Việt Nam',
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80'],
    description: 'Giải pháp hồ cá biển mini thông minh với hệ lọc tích hợp sẵn phía sau, không tốn diện tích, cực kỳ thích hợp cho các bạn trẻ mới tiếp cận cá biển.'
  },
  {
    name: 'Hồ Cá Rồng Huyết Long / Kim Long Phong Thủy (180cm)',
    slug: 'ho-ca-rong-huyet-long-kim-long',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 25000000,
    oldPrice: 28000000,
    discount: '11%',
    stock: 5,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1516683037151-9a17603a8dc7?w=800&auto=format&fit=crop&q=80'],
    description: 'Hồ kính đại cỡ chuẩn phong thủy đón tài lộc cho phòng khách biệt thự và văn phòng lãnh đạo. Hệ lọc tràn dưới Sump 5 ngăn xử lý lượng thức ăn lớn.'
  },
  {
    name: 'Hồ Bể Kính Nuôi Cá Vàng Ranchu & Oranda Thủy Tộc (80cm)',
    slug: 'ho-kinh-ca-vang-ranchu-oranda',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 3800000,
    oldPrice: 4500000,
    discount: '15%',
    stock: 10,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80'],
    description: 'Không gian sống bồng bềnh cho những chú cá vàng Ranchu tròn xoe ngộ nghĩnh. Hệ thống lọc oxy tạo dòng chảy êm nhẹ giúp cá bơi lội thảnh thơi.'
  },
  {
    name: 'Hồ Kính Kết Hợp Lọc Tràn Koi Ban Công & Sân Vườn (160cm)',
    slug: 'ho-kinh-loc-tran-koi-da-nang',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 16000000,
    oldPrice: 19000000,
    discount: '16%',
    stock: 5,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1516683037151-9a17603a8dc7?w=800&auto=format&fit=crop&q=80'],
    description: 'Giải pháp ngắm cá Koi tuyệt đẹp từ góc nhìn ngang thay vì chỉ nhìn từ trên xuống như hồ xi măng truyền thống, tối ưu cho ban công nhà phố và biệt thự sân vườn.'
  },
  {
    name: 'Hồ Thủy Sinh Bố Cục Rêu & Lũa Rồng (Dragon Wood 60cm)',
    slug: 'ho-thuy-sinh-reu-va-lua-rong',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 2900000,
    oldPrice: 3500000,
    discount: '17%',
    stock: 12,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80'],
    description: 'Dòng hồ thủy sinh quốc dân cho người mới bắt đầu. Sự kết hợp giữa đá Da Voi góc cạnh và lũa bọc rêu Fissidens xanh mát, ít tốn công chăm bón.'
  },
  {
    name: 'Hồ Nano Nuôi Tép Cảnh Thủy Sinh Mini (45cm)',
    slug: 'ho-nano-nuoi-tep-canh-thuy-sinh',
    category: 'tank',
    categoryName: 'Hồ Cá Có Sẵn',
    price: 2400000,
    oldPrice: 2900000,
    discount: '17%',
    stock: 15,
    isActive: true,
    origin: 'Việt Nam',
    waterType: 'freshwater',
    images: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'],
    description: 'Hồ nuôi tép cảnh chuyên sâu được kiểm soát TDS và khoáng chất tối ưu giúp tép lột vỏ dễ dàng, sinh sản nhanh và ôm trứng liên tục.'
  }
];

const run = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[SeedTanks] Đã kết nối MongoDB thành công');

    const results = [];
    for (const item of TANK_PRODUCTS) {
      const doc = await Product.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push({ slug: doc.slug, _id: doc._id.toString(), name: doc.name, price: doc.price });
    }

    console.log(`[SeedTanks] Hoàn tất đồng bộ ${results.length} hồ cá có sẵn vào DB:`);
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('[SeedTanks Error]:', error);
    process.exit(1);
  }
};

run();
