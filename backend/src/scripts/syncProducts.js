import mongoose from 'mongoose';
import { ENV } from '../configs/env.config.js';
import '../configs/db.config.js';
import Product from '../features/products/product.model.js';
import { thienducSections } from '../../../frontend/src/features/products/data/thienducSections.js';
import { collectionsData } from '../../../frontend/src/features/products/data/collectionsData.js';
import { DANANG_FISH_CATALOG } from './danangFishData.js';

const toSlug = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const TYPO_REPLACEMENTS = [
  [/\s+/g, ' '],
  [/\bManrlboro\b/gi, 'Marlboro'],
  [/\bLeopand\b/gi, 'Leopard'],
  [/\bLeopar\b/gi, 'Leopard'],
  [/\bPegion\b/gi, 'Pigeon'],
  [/\bColban\b/gi, 'Cobalt'],
  [/\bGoldabino\b/gi, 'Gold Albino'],
  [/\bBaloon\b/gi, 'Balloon'],
  [/\bRed Chery\b/gi, 'Red Cherry'],
  [/\bCory Juli\b/gi, 'Corydoras Julii'],
  [/\s+-\s+/g, ' - '],
];

const cleanName = (raw = '') => {
  let s = String(raw).trim();
  for (const [pattern, replacement] of TYPO_REPLACEMENTS) {
    s = s.replace(pattern, replacement);
  }
  return s.trim();
};

const normalizeDescriptionForDaNang = (html = '') =>
  String(html)
    .replace(/Thiên Đức|thienduc/gi, 'AquaCraft')
    .replace(
      /Nội thành TP\.HCM:<\/strong>\s*Giao hàng hỏa tốc trong 1 - 2 tiếng hoặc nhận trong ngày qua Grab\/Ahamove\./gi,
      'Nội thành Đà Nẵng:</strong> Giao hàng hỏa tốc trong 1 - 2 tiếng tại Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ, Liên Chiểu qua Grab/Ahamove.'
    )
    .replace(/TP\.?\s*HCM|TP\.?\s*Hồ Chí Minh|Sài Gòn/gi, 'Đà Nẵng');

const normalizeSubCategory = (rawCat = '', sectionKey = '') => {
  const s = `${rawCat} ${sectionKey}`.toLowerCase();
  if (s.includes('chuot')) return 'ca-chuot';
  if (s.includes('dia')) return 'ca-dia';
  if (s.includes('phuong')) return 'ca-phuong-hoang';
  if (s.includes('tep')) return 'tep';
  if (s.includes('cauvong') || s.includes('cau-vong')) return 'ca-cau-vong';
  return 'ca-canh';
};

const syncProductsToMongo = async () => {
  try {
    console.log('[Sync] Đang kết nối tới MongoDB...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Sync] Kết nối thành công!');

    // 0. Xóa bản ghi trùng Cá Dĩa Bồ Câu Đỏ từ seed cũ (đã có bản đầy đủ hơn)
    const dupDel = await Product.deleteOne({ slug: 'ca-dia-bo-cau-do-pigeon-blood-discus' });
    if (dupDel.deletedCount > 0) {
      console.log('[Sync] Đã xóa bản trùng ca-dia-bo-cau-do-pigeon-blood-discus.');
    }

    // Sửa subCategory còn thiếu cho 2 sản phẩm seed ban đầu
    await Product.updateOne(
      { slug: 'ca-betta-halfmoon-xanh-anh-kim' },
      {
        $set: {
          subCategory: 'ca-betta',
          categoryName: 'Cá Betta',
          origin: 'Đà Nẵng, Việt Nam',
          stock: 25,
          soldOut: false,
          actionText: 'TÙY CHỌN',
        },
        $addToSet: { homeSections: { $each: ['danang', 'collection:ca-betta'] } },
      }
    );
    await Product.updateOne(
      { slug: 'ca-he-nemo-ocellaris' },
      {
        $set: {
          subCategory: 'ca-bien',
          categoryName: 'Cá Cảnh Nước Mặn',
          stock: 20,
          soldOut: false,
          actionText: 'TÙY CHỌN',
        },
      }
    );

    const productMap = new Map();

    const mergeItem = (item, sectionTag) => {
      const cleanedName = cleanName(item.name);
      const rawSlug = item.slug || toSlug(item.name);
      const cleanedSlug = toSlug(cleanedName);
      const mapKey = rawSlug;
      const existing = productMap.get(mapKey);

      const imagesSet = new Set([
        ...(existing?.images || []),
        ...(item.image ? [item.image] : []),
        ...(Array.isArray(item.gallery) ? item.gallery : []),
      ]);
      const homeSectionsSet = new Set([
        ...(existing?.homeSections || []),
        sectionTag,
      ]);

      productMap.set(mapKey, {
        legacySlugs: [...new Set([...(existing?.legacySlugs || []), rawSlug, toSlug(item.name)])],
        legacyNames: [...new Set([...(existing?.legacyNames || []), item.name, cleanedName])],
        payload: {
          name: cleanedName,
          slug: cleanedSlug,
          description: normalizeDescriptionForDaNang(item.description || existing?.description || ''),
          price: Number(item.price) || 0,
          oldPrice: item.oldPrice ? Number(item.oldPrice) : existing?.oldPrice || null,
          discount: item.discount || existing?.discount || '',
          category: 'fish',
          subCategory: normalizeSubCategory(item.category, sectionTag),
          categoryName: item.categoryName || existing?.categoryName || 'Cá Cảnh Thủy Sinh',
          homeSections: Array.from(homeSectionsSet),
          stock: 25,
          soldOut: false,
          actionText: 'TÙY CHỌN',
          images: Array.from(imagesSet).filter(Boolean),
          sizes:
            Array.isArray(item.sizes) && item.sizes.length > 0
              ? item.sizes
              : existing?.sizes || ['Tiêu chuẩn'],
          specs: item.specs || existing?.specs || {
            ph: '6.5 - 7.5',
            temp: '26 - 28°C',
            food: 'Cám, trùn chỉ, bobo...',
            habit: 'Hiền lành, bơi theo đàn',
          },
          origin: /đà nẵng/i.test(cleanedName) ? 'Đà Nẵng, Việt Nam' : 'Việt Nam',
          waterType: 'freshwater',
          isActive: true,
        },
      });
    };

    // 1. Thu thập & chuẩn hóa từ thienducSections + collectionsData
    Object.entries(thienducSections).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((item) => mergeItem(item, key));
      } else if (val && typeof val === 'object') {
        Object.entries(val).forEach(([subKey, arr]) => {
          arr.forEach((item) => mergeItem(item, `${key}:${subKey}`));
        });
      }
    });

    Object.entries(collectionsData).forEach(([colKey, colData]) => {
      (colData.items || []).forEach((item) => mergeItem(item, `collection:${colKey}`));
    });

    // 2. Thêm dữ liệu cá cảnh Đà Nẵng từ danangFishData.js
    for (const dnItem of DANANG_FISH_CATALOG) {
      productMap.set(dnItem.slug, {
        legacySlugs: [dnItem.slug],
        legacyNames: [dnItem.name],
        payload: dnItem,
      });
    }

    console.log(`[Sync] Tổng số sản phẩm cá cần đồng bộ/sửa: ${productMap.size}`);

    const existingDocs = await Product.find({}).select('_id slug name').lean();
    const bySlug = new Map();
    const byName = new Map();
    for (const doc of existingDocs) {
      if (doc.slug) bySlug.set(doc.slug, doc);
      if (doc.name) byName.set(doc.name, doc);
    }

    const bulkOps = [];
    let matchedExisting = 0;

    for (const { legacySlugs, legacyNames, payload } of productMap.values()) {
      const candidateSlugs = [...new Set([payload.slug, ...legacySlugs])];
      const candidateNames = [...new Set([payload.name, ...legacyNames])];
      const existing =
        candidateSlugs.map((s) => bySlug.get(s)).find(Boolean) ||
        candidateNames.map((n) => byName.get(n)).find(Boolean);

      if (existing) {
        matchedExisting++;
        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: payload },
          },
        });
      } else {
        bulkOps.push({
          updateOne: {
            filter: { slug: payload.slug },
            update: { $set: payload },
            upsert: true,
          },
        });
      }
    }

    const result = await Product.bulkWrite(bulkOps, { ordered: false });
    const createdCount = result.upsertedCount || 0;
    const updatedCount = matchedExisting;

    const totalInDb = await Product.countDocuments();
    const soldOutInDb = await Product.countDocuments({ soldOut: true });
    const hcmInDesc = await Product.countDocuments({ description: /TP\.?\s*HCM|Thiên Đức/i });
    const subStats = await Product.aggregate([
      { $group: { _id: { category: '$category', subCategory: '$subCategory' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log(`[Sync] Hoàn tất! Tạo mới: ${createdCount}, cập nhật/sửa chuẩn: ${updatedCount}.`);
    console.log(`[Sync] Tổng sản phẩm trong DB: ${totalInDb} | soldOut=true: ${soldOutInDb} | còn TP.HCM/Thiên Đức: ${hcmInDesc}`);
    console.log('[Sync] Phân bố theo danh mục:', subStats.map((s) => `${s._id.category}/${s._id.subCategory || '-'}: ${s.count}`).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('[Sync Lỗi]:', err);
    process.exit(1);
  }
};

syncProductsToMongo();
