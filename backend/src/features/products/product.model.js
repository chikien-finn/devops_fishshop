import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm không được để trống'],
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    discount: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['fish', 'plant', 'accessory', 'tank', 'food'],
      default: 'fish',
    },
    subCategory: {
      type: String,
      default: '',
    },
    categoryName: {
      type: String,
      default: '',
    },
    homeSections: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
    soldOut: {
      type: Boolean,
      default: false,
    },
    actionText: {
      type: String,
      default: 'TÙY CHỌN',
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    specs: {
      ph: { type: String, default: '6.5 - 7.5' },
      temp: { type: String, default: '26 - 28°C' },
      food: { type: String, default: 'Cám, trùn chỉ, bobo...' },
      habit: { type: String, default: 'Hiền lành, bơi theo đàn' },
    },
    origin: {
      type: String,
      default: 'Việt Nam',
    },
    waterType: {
      type: String,
      enum: ['freshwater', 'saltwater'],
      default: 'freshwater',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ isActive: 1, homeSections: 1, createdAt: -1 });
productSchema.index({ isActive: 1, stock: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ stock: 1, createdAt: -1 });
productSchema.index({ category: 1, waterType: 1, stock: 1, price: 1 });
productSchema.index(
  { name: 'text', categoryName: 'text', origin: 'text' },
  { default_language: 'none', name: 'product_text_idx' }
);
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
