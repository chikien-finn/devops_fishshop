import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true,
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
    category: {
      type: String,
      enum: ['fish', 'plant', 'accessory', 'tank', 'food'],
      default: 'fish',
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
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

export default mongoose.model('Product', productSchema);

