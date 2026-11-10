import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';
import '../configs/db.config.js';
import Product from '../features/products/product.model.js';
import Order from '../features/orders/order.model.js';
import Review from '../features/reviews/review.model.js';
import User from '../features/users/user.model.js';
import { DANANG_FISH_CATALOG } from './danangFishData.js';

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/aquacraft';
const GB_BYTES = 1024 * 1024 * 1024;

const parseArgs = (argv = []) => {
  const opts = {
    uri: '',
    useEnv: false,
    confirmRemote: false,
    dryRun: false,
    cleanBulk: false,
    targetGb: 2.05,
    batchSize: 1000,
    entropyBytes: 3300,
  };

  for (const arg of argv) {
    if (arg.startsWith('--uri=')) opts.uri = arg.slice(6).trim();
    else if (arg === '--use-env') opts.useEnv = true;
    else if (arg === '--confirm-remote') opts.confirmRemote = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--clean-bulk') opts.cleanBulk = true;
    else if (arg.startsWith('--target-gb=')) opts.targetGb = Math.max(0.01, Number(arg.slice(12)) || 2.05);
    else if (arg.startsWith('--batch-size=')) opts.batchSize = Math.min(5000, Math.max(100, parseInt(arg.slice(13), 10) || 1000));
    else if (arg.startsWith('--entropy-bytes=')) opts.entropyBytes = Math.min(12000, Math.max(512, parseInt(arg.slice(16), 10) || 3300));
  }

  return opts;
};

const isLocalUri = (uri) =>
  /^mongodb(\+srv)?:\/\/([^@]*@)?(localhost|127\.0\.0\.1|mongodb)(:|\/|$)/i.test(uri);

const maskUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

const formatMB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const formatGB = (bytes) => `${(bytes / GB_BYTES).toFixed(3)} GB`;

const makeEntropy = (bytes) => crypto.randomBytes(bytes).toString('base64');

const buildBulkProductDoc = (template, runTag, seq, entropyBytes, baseTimestamp) => {
  const skuCode = `DN-${runTag}-${String(seq).padStart(7, '0')}`;
  const entropy = makeEntropy(entropyBytes);

  return {
    name: `${template.name} (Lô ${skuCode})`,
    slug: `bulk-${template.slug}-${runTag}-${seq}`,
    description: `${template.description || ''}\n<!-- bulk-seed:${skuCode}:${entropy} -->`,
    price: template.price,
    oldPrice: template.oldPrice || null,
    discount: template.discount || '',
    category: template.category || 'fish',
    subCategory: template.subCategory || 'ca-canh',
    categoryName: template.categoryName || 'Cá Cảnh Đà Nẵng',
    homeSections: Array.isArray(template.homeSections) ? template.homeSections : [],
    stock: 25,
    soldOut: false,
    actionText: 'TÙY CHỌN',
    images: Array.isArray(template.images) ? template.images : [],
    sizes: Array.isArray(template.sizes) && template.sizes.length > 0 ? template.sizes : ['Tiêu chuẩn'],
    specs: template.specs || {
      ph: '6.5 - 7.5',
      temp: '26 - 28°C',
      food: 'Cám, trùn chỉ, bobo...',
      habit: 'Hiền lành, bơi theo đàn',
    },
    origin: template.origin || 'Đà Nẵng, Việt Nam',
    waterType: template.waterType || 'freshwater',
    isActive: true,
    createdAt: new Date(baseTimestamp - seq * 1000),
    updatedAt: new Date(baseTimestamp - seq * 1000),
  };
};

const DISTRICTS_DN = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Cẩm Lệ', 'Liên Chiểu'];
const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered'];

const buildBulkOrderDoc = (template, userId, seq, entropyBytes, baseTimestamp) => {
  const district = DISTRICTS_DN[seq % DISTRICTS_DN.length];
  const qty = (seq % 5) + 1;
  const price = Number(template.price) || 20000;
  const entropy = makeEntropy(entropyBytes);

  return {
    user: userId,
    items: [
      {
        product: template._id,
        name: template.name,
        price,
        quantity: qty,
      },
    ],
    totalAmount: price * qty,
    shippingAddress: `[BULK-2GB] Lô ${seq} - Quận ${district}, TP. Đà Nẵng | ${entropy}`,
    phoneNumber: `099${String(seq % 10000000).padStart(7, '0')}`,
    paymentMethod: seq % 2 === 0 ? 'cod' : 'banking',
    status: ORDER_STATUSES[seq % ORDER_STATUSES.length],
    createdAt: new Date(baseTimestamp - seq * 1000),
    updatedAt: new Date(baseTimestamp - seq * 1000),
  };
};

const buildBulkReviewDoc = (template, userId, seq, entropyBytes, baseTimestamp) => {
  const entropy = makeEntropy(entropyBytes);
  return {
    product: template._id,
    user: userId,
    rating: (seq % 2) + 4,
    comment: `[BULK-2GB] Cá khỏe đẹp, giao nhanh tại Đà Nẵng #${seq} | ${entropy}`,
    createdAt: new Date(baseTimestamp - seq * 1000),
    updatedAt: new Date(baseTimestamp - seq * 1000),
  };
};

const run = async () => {
  const opts = parseArgs(process.argv.slice(2));
  const targetUri = opts.uri || (opts.useEnv ? ENV.MONGO_URI : DEFAULT_LOCAL_URI);
  const targetBytes = Math.round(opts.targetGb * GB_BYTES);

  console.log(`[Seed2GB] Target DB: ${maskUri(targetUri)}`);
  console.log(`[Seed2GB] Target size: ${opts.targetGb} GB (${formatGB(targetBytes)}) cho cả dataSize và storageSize`);

  if (!isLocalUri(targetUri) && !opts.confirmRemote && !opts.dryRun) {
    console.error('[Seed2GB] DỪNG AN TOÀN: URI là MongoDB remote (EC2).');
    console.error('Hãy kiểm tra `df -h` trên EC2 còn trống >= 5 GB rồi chạy lại kèm cờ `--confirm-remote`.');
    process.exit(1);
  }

  await mongoose.connect(targetUri);
  const db = mongoose.connection.db;

  const printStats = async (prefix = '[Seed2GB]') => {
    const s = await db.stats();
    console.log(
      `${prefix} objects=${s.objects} | dataSize=${formatMB(s.dataSize)} (${formatGB(s.dataSize)}) | storageSize=${formatMB(s.storageSize)} (${formatGB(s.storageSize)}) | indexSize=${formatMB(s.indexSize)}`
    );
    return s;
  };

  if (opts.cleanBulk) {
    console.log('[Seed2GB] Đang dọn dữ liệu bulk test...');
    const [pDel, oDel, rDel] = await Promise.all([
      Product.deleteMany({ slug: /^bulk-/ }),
      Order.deleteMany({ shippingAddress: /^\[BULK-2GB\]/ }),
      Review.deleteMany({ comment: /^\[BULK-2GB\]/ }),
    ]);
    console.log(`[Seed2GB] Đã xóa bulk: products=${pDel.deletedCount}, orders=${oDel.deletedCount}, reviews=${rDel.deletedCount}`);
    await printStats('[Seed2GB After Clean]');
    await mongoose.disconnect();
    process.exit(0);
  }

  let stats = await printStats('[Seed2GB Initial]');

  if (opts.dryRun) {
    const sampleSizeBytes = opts.entropyBytes * 1.34 + 1400;
    const estDocsNeeded = Math.max(0, Math.ceil((targetBytes - stats.storageSize) / sampleSizeBytes));
    console.log(`[Seed2GB Dry-Run] Ước tính ~${Math.round(sampleSizeBytes)} bytes/doc (khó nén) -> cần thêm ~${estDocsNeeded.toLocaleString()} documents.`);
    console.log('[Seed2GB Dry-Run] Không ghi vào DB.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Đảm bảo DB có sẵn dữ liệu mẫu tối thiểu nếu đang chạy trên local Docker DB trống
  let realProducts = await Product.find({ slug: { $not: /^bulk-/ } }).lean();
  if (realProducts.length === 0) {
    console.log('[Seed2GB] DB chưa có sản phẩm gốc, nạp trước danh mục cá Đà Nẵng từ danangFishData.js...');
    await Product.collection.insertMany(DANANG_FISH_CATALOG, { ordered: false });
    realProducts = await Product.find({ slug: { $not: /^bulk-/ } }).lean();
  }

  let sampleUser = await User.findOne({}).select('_id').lean();
  if (!sampleUser) {
    const createdUser = await User.create({
      name: 'Khách hàng Mẫu Đà Nẵng',
      email: 'khachhang@gmail.com',
      password: 'user123',
      role: 'user',
      phone: '0905123456',
      address: 'Hải Châu, Đà Nẵng',
    });
    sampleUser = { _id: createdUser._id };
  }

  // Tạo index trước khi bơm dữ liệu lớn để truy vấn & phân trang web luôn nhanh
  await Promise.all([Product.createIndexes(), Order.createIndexes(), Review.createIndexes()]);

  const runTag = Date.now().toString(36);
  let prodSeq = 1;
  let orderSeq = 1;
  let reviewSeq = 1;

  // Đặt timestamp lùi lại 30 ngày so với sản phẩm thật để 325 cá chuẩn luôn đứng đầu trang chủ & trang 1
  const baseTimestamp = Date.now() - 30 * 86400 * 1000;
  const startTime = Date.now();
  let round = 0;

  while (stats.dataSize < targetBytes || stats.storageSize < targetBytes) {
    const targetKind = round % 3; // Xoay vòng đều: 0=products, 1=orders, 2=reviews
    const batch = [];

    if (targetKind === 0) {
      for (let i = 0; i < opts.batchSize; i++) {
        const tpl = realProducts[(prodSeq + i) % realProducts.length];
        batch.push(buildBulkProductDoc(tpl, runTag, prodSeq + i, opts.entropyBytes, baseTimestamp));
      }
      await Product.collection.insertMany(batch, { ordered: false, writeConcern: { w: 1 } });
      prodSeq += opts.batchSize;
    } else if (targetKind === 1) {
      for (let i = 0; i < opts.batchSize; i++) {
        const tpl = realProducts[(orderSeq + i) % realProducts.length];
        batch.push(buildBulkOrderDoc(tpl, sampleUser._id, orderSeq + i, opts.entropyBytes, baseTimestamp));
      }
      await Order.collection.insertMany(batch, { ordered: false, writeConcern: { w: 1 } });
      orderSeq += opts.batchSize;
    } else {
      for (let i = 0; i < opts.batchSize; i++) {
        const tpl = realProducts[(reviewSeq + i) % realProducts.length];
        batch.push(buildBulkReviewDoc(tpl, sampleUser._id, reviewSeq + i, opts.entropyBytes, baseTimestamp));
      }
      await Review.collection.insertMany(batch, { ordered: false, writeConcern: { w: 1 } });
      reviewSeq += opts.batchSize;
    }

    round++;
    if (round % 9 === 0) {
      stats = await printStats(`[Seed2GB Round ${round} | ${(Date.now() - startTime) / 1000}s]`);
    }
  }

  stats = await printStats('[Seed2GB Final]');
  console.log(`[Seed2GB] Hoàn tất trong ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed2GB Lỗi]:', err);
  process.exit(1);
});
