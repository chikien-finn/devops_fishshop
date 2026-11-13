import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, default: null, min: 0 },
  usageLimit: { type: Number, default: null, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, default: null },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
