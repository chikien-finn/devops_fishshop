import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';
import Coupon from '../features/coupons/coupon.model.js';

const INITIAL_COUPONS = [
  {
    code: 'AQUACHAO',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 150000,
    maxDiscount: 50000,
    usageLimit: 500,
    usedCount: 42,
    active: true,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
  },
  {
    code: 'FREESHIPDN',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderAmount: 200000,
    maxDiscount: 30000,
    usageLimit: 1000,
    usedCount: 185,
    active: true,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
  },
  {
    code: 'VIPTHUYSINH',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 500000,
    maxDiscount: 50000,
    usageLimit: 300,
    usedCount: 88,
    active: true,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
  },
  {
    code: 'AQUAPRO',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1000000,
    maxDiscount: 200000,
    usageLimit: 200,
    usedCount: 37,
    active: true,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
  },
];

const run = async () => {
  console.log('[SeedCoupons] Kết nối MongoDB...');
  await mongoose.connect(ENV.MONGO_URI);

  for (const c of INITIAL_COUPONS) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
      console.log(`  ✓ Đã tạo coupon ${c.code}`);
    } else {
      await Coupon.updateOne({ code: c.code }, { $set: c });
      console.log(`  ✓ Đã cập nhật coupon ${c.code}`);
    }
  }

  console.log('[SeedCoupons] Hoàn tất nạp coupon mẫu!');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[SeedCoupons Lỗi]:', err);
  process.exit(1);
});
