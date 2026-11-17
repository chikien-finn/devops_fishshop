import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      minlength: [2, 'Họ tên tối thiểu 2 ký tự'],
      maxlength: [50, 'Họ tên tối đa 50 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Email tối đa 100 ký tự'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      default: '',
      maxlength: [15, 'Số điện thoại tối đa 15 ký tự'],
    },
    address: {
      type: String,
      default: '',
      maxlength: [200, 'Địa chỉ tối đa 200 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model('User', userSchema);

