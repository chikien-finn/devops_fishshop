import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';
import User from '../features/users/user.model.js';
import Product from '../features/products/product.model.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Đang kết nối tới MongoDB...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Seed] Kết nối MongoDB thành công!');

    // 1. Dọn dẹp dữ liệu cũ (Tùy chọn)
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('[Seed] Đã dọn dẹp bộ sưu tập cũ.');

    // 2. Tạo tài khoản mẫu
    const users = await User.create([
      {
        name: 'Quản trị viên AquaCraft',
        email: 'admin@aquacraft.com',
        password: 'admin123', // Model sẽ tự động hash bằng bcrypt
        role: 'admin',
        phone: '0901234567',
        address: 'Quận 1, TP. Hồ Chí Minh',
      },
      {
        name: 'Nguyễn Văn Khách',
        email: 'khachhang@gmail.com',
        password: 'user123',
        role: 'user',
        phone: '0987654321',
        address: 'Hà Nội',
      },
    ]);
    console.log(`[Seed] Đã tạo thành công ${users.length} tài khoản người dùng mẫu.`);

    // 3. Tạo dữ liệu cá cảnh & thủy sinh mẫu
    const products = await Product.create([
      {
        name: 'Cá Betta Halfmoon Xanh Ánh Kim',
        description: 'Cá Betta đuôi xòe 180 độ màu xanh ánh kim, dễ nuôi, thích hợp bể mini.',
        price: 150000,
        category: 'fish',
        waterType: 'freshwater',
        stock: 25,
        origin: 'Thái Lan',
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60'],
      },
      {
        name: 'Cá Dĩa Bồ Câu Đỏ (Pigeon Blood Discus)',
        description: 'Vua của các loài cá cảnh nước ngọt, hoa văn đỏ cam rực rỡ, thích hợp bể thủy sinh lớn.',
        price: 350000,
        category: 'fish',
        waterType: 'freshwater',
        stock: 15,
        origin: 'Việt Nam',
        images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=60'],
      },
      {
        name: 'Cá Hề Nemo Ocellaris',
        description: 'Cá cảnh nước mặn nổi tiếng với sọc cam trắng, sống cộng sinh với hải quỳ.',
        price: 220000,
        category: 'fish',
        waterType: 'saltwater',
        stock: 20,
        origin: 'Indonesia',
        images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=60'],
      },
      {
        name: 'Cây Thủy Sinh Ráy Nana Cột Lũa',
        description: 'Cây thủy sinh tiền cảnh cực kỳ dễ sống, không cần CO2 mạnh hay ánh sáng cao.',
        price: 65000,
        category: 'plant',
        waterType: 'freshwater',
        stock: 50,
        origin: 'Việt Nam',
        images: ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=60'],
      },
      {
        name: 'Thức Ăn Hạt Chìm Cho Cá Cảnh Cao Cấp (100g)',
        description: 'Thức ăn dinh dưỡng cao bổ sung vitamin và tảo Spirulina giúp cá lên màu tự nhiên.',
        price: 85000,
        category: 'food',
        stock: 100,
        origin: 'Nhật Bản',
        images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=60'],
      },
    ]);
    console.log(`[Seed] Đã tạo thành công ${products.length} sản phẩm cá cảnh & phụ kiện mẫu.`);

    console.log('[Seed] Hoàn tất quá trình nạp dữ liệu mẫu vào MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Lỗi]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
