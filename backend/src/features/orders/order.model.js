import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    shippingRegion: { type: String, enum: ['north', 'central', 'south'], default: 'central' },
    shippingAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'banking'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired'],
      default: 'unpaid',
    },
    paymentExpiresAt: { type: Date, default: null },
    paymentPaidAt: { type: Date, default: null },
    statusUpdatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ createdAt: -1, _id: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1, _id: -1 });
orderSchema.index({ status: 1, totalAmount: 1, createdAt: 1 });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1, paymentExpiresAt: 1 });

export default mongoose.model('Order', orderSchema);

