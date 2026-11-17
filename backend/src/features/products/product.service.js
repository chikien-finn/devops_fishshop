import mongoose from 'mongoose';
import Product from './product.model.js';
import { ApiError } from '../../utils/apiError.js';

const QUERY_CACHE_TTL_MS = 60_000;
const MAX_COUNT_CACHE_ENTRIES = 100;
const countCache = new Map();
let homeSectionsCache = null;
let homeSectionsInFlight = null;
let statsCache = null;
let statsInFlight = null;

const serializeQueryKey = (query) =>
  JSON.stringify(query, (_k, v) => (v instanceof RegExp ? `re:${v.source}:${v.flags}` : v));

const invalidateProductCaches = () => {
  countCache.clear();
  homeSectionsCache = null;
  statsCache = null;
};

const cachedCountDocuments = async (query) => {
  if (Object.keys(query).length === 0) {
    return await Product.estimatedDocumentCount();
  }

  const key = serializeQueryKey(query);
  const now = Date.now();
  const cached = countCache.get(key);
  if (cached && now - cached.timestamp < QUERY_CACHE_TTL_MS) {
    return cached.value;
  }

  let value;
  const isSimpleFishQuery =
    query.category === 'fish' &&
    Object.keys(query).every((k) => k === 'category' || k === 'isActive');

  if (isSimpleFishQuery) {
    const [total, plants, foods, accs] = await Promise.all([
      Product.estimatedDocumentCount().catch(() => 0),
      Product.countDocuments({ category: 'plant' }).catch(() => 0),
      Product.countDocuments({ category: 'food' }).catch(() => 0),
      Product.countDocuments({ category: { $in: ['tank', 'accessory'] } }).catch(() => 0),
    ]);
    value = Math.max(0, total - (plants + foods + accs));
  } else {
    value = await Product.countDocuments(query).maxTimeMS(3000).catch(() => 50);
  }

  if (countCache.size >= MAX_COUNT_CACHE_ENTRIES) {
    countCache.delete(countCache.keys().next().value);
  }
  countCache.set(key, { value, timestamp: Date.now() });
  return value;
};

const LIST_PROJECTION =
  'name slug description price oldPrice discount category subCategory categoryName homeSections stock soldOut actionText images origin waterType isActive createdAt';

const HOME_SECTION_CONFIG = {
  chuot: { homeSection: 'chuot', subCategory: 'ca-chuot', initialLimit: 10 },
  dia: { homeSection: 'dia', subCategory: 'ca-dia', initialLimit: 5 },
  phuonghoang: { homeSection: 'phuonghoang', subCategory: 'ca-phuong-hoang', initialLimit: 5 },
  tep: { homeSection: 'thuysinh:tep', subCategory: 'tep', initialLimit: 5 },
};

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

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const vietnameseDiacriticPattern = (str) => {
  const map = {
    a: '[aàáảãạăằắẳẵặâầấẩẫậ]',
    e: '[eèéẻẽẹêềếểễệ]',
    i: '[iìíỉĩị]',
    o: '[oòóỏõọôồốổỗộơờớởỡợ]',
    u: '[uùúủũụưừứửữự]',
    y: '[yỳýỷỹỵ]',
    d: '[dđ]',
  };
  return String(str || '')
    .toLowerCase()
    .split('')
    .map((c) => map[c] || escapeRegex(c))
    .join('');
};

const toPlainSnippet = (html, maxLength = 160) => {
  if (!html) return '';
  const plain = String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
};

const formatListItem = (doc) => ({
  ...doc,
  description: toPlainSnippet(doc.description),
});

export const buildProductQuery = (filters = {}) => {
  const query = {};
  const andConditions = [];

  if (filters.isActive !== undefined && filters.isActive !== '' && filters.isActive !== 'all') {
    query.isActive = filters.isActive === true || filters.isActive === 'true';
  } else if (filters.all !== 'true') {
    query.isActive = true;
  }

  if (filters.categories) {
    const categoryList = String(filters.categories)
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (categoryList.length > 0) {
      query.category = { $in: categoryList };
    }
  } else if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  if (filters.subCategory && filters.subCategory !== 'all') {
    query.subCategory = filters.subCategory;
  }

  if (filters.homeSection) {
    query.homeSections = filters.homeSection;
  }

  if (filters.sectionGroup && HOME_SECTION_CONFIG[filters.sectionGroup]) {
    const cfg = HOME_SECTION_CONFIG[filters.sectionGroup];
    andConditions.push({
      $or: [{ homeSections: cfg.homeSection }, { subCategory: cfg.subCategory }],
    });
  }

  if (filters.collection) {
    andConditions.push({
      $or: [
        { homeSections: `collection:${filters.collection}` },
        { subCategory: filters.collection },
      ],
    });
  }

  if (filters.fishSubCategory || filters.fishKeyword) {
    const fishOr = [];
    if (filters.fishSubCategory) {
      fishOr.push({ subCategory: filters.fishSubCategory });
    }
    if (filters.fishKeyword) {
      fishOr.push({ name: { $regex: escapeRegex(filters.fishKeyword), $options: 'i' } });
    }
    if (fishOr.length > 0) {
      andConditions.push({ $or: fishOr });
    }
  }

  if (filters.waterType && filters.waterType !== 'all') {
    query.waterType = filters.waterType;
  }

  if (filters.sale === 'true' || filters.sale === true) {
    andConditions.push({
      $or: [
        { discount: { $nin: ['', null] } },
        { $expr: { $gt: ['$oldPrice', '$price'] } },
      ],
    });
  }

  if (filters.maxStock !== undefined && filters.maxStock !== '') {
    const maxStock = Number(filters.maxStock);
    if (!Number.isNaN(maxStock)) {
      query.stock = { $lte: maxStock };
    }
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    const minPrice = Number(filters.minPrice);
    if (!Number.isNaN(minPrice) && minPrice >= 0) {
      query.price = { ...(query.price || {}), $gte: minPrice };
    }
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    const maxPrice = Number(filters.maxPrice);
    if (!Number.isNaN(maxPrice) && maxPrice >= 0) {
      query.price = { ...(query.price || {}), $lte: maxPrice };
    }
  }

  if (filters.search) {
    const rawSearch = String(filters.search).trim();
    if (rawSearch.includes(',')) {
      const terms = rawSearch
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (terms.length > 0) {
        const searchOr = [];
        for (const term of terms) {
          const escaped = escapeRegex(term);
          const regex = new RegExp(escaped, 'i');
          const diacriticPattern = vietnameseDiacriticPattern(term);
          searchOr.push(
            { name: term },
            { name: regex },
            { categoryName: regex },
            { origin: regex }
          );
          if (diacriticPattern && diacriticPattern !== term.toLowerCase()) {
            searchOr.push({ name: new RegExp(diacriticPattern, 'i') });
          }
          const slugTerm = toSlug(term);
          if (slugTerm) {
            searchOr.push({ slug: slugTerm });
            searchOr.push({ slug: new RegExp(escapeRegex(slugTerm), 'i') });
          }
        }
        andConditions.push({ $or: searchOr });
      }
    } else if (rawSearch) {
      const escaped = escapeRegex(rawSearch);
      const slugTerm = toSlug(rawSearch);
      const diacriticPattern = vietnameseDiacriticPattern(rawSearch);

      const searchOr = [
        { name: rawSearch },
        { name: new RegExp(escaped, 'i') },
        { categoryName: new RegExp(escaped, 'i') },
      ];
      if (diacriticPattern && diacriticPattern !== rawSearch.toLowerCase()) {
        searchOr.push({ name: new RegExp(diacriticPattern, 'i') });
      }
      if (slugTerm) {
        searchOr.push({ slug: slugTerm });
        searchOr.push({ slug: new RegExp(escapeRegex(slugTerm), 'i') });
      }
      andConditions.push({ $or: searchOr });
    }
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
};

export const buildSortOption = (sortBy = 'newest') => {
  switch (sortBy) {
    case 'name-asc':
      return { name: 1, _id: 1 };
    case 'name-desc':
      return { name: -1, _id: 1 };
    case 'price-asc':
      return { price: 1, createdAt: -1 };
    case 'price-desc':
      return { price: -1, createdAt: -1 };
    case 'stock-asc':
      return { stock: 1, createdAt: -1 };
    case 'newest':
    case 'default':
    default:
      return { createdAt: -1 };
  }
};

export const getAllProducts = async (filters = {}) => {
  const query = buildProductQuery(filters);
  const sortOption = buildSortOption(filters.sort);

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const totalItems = await cachedCountDocuments(query);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const count = Math.max(0, Math.min(limit, totalItems - skip));

  let rawItems = [];
  if (count > 0) {
    const isDefaultDesc = !filters.sort || filters.sort === 'newest' || filters.sort === 'default';
    if (isDefaultDesc && skip > totalItems / 2 && !filters.search) {
      const tailSkip = Math.max(0, totalItems - (skip + count));
      rawItems = await Product.find(query)
        .select(LIST_PROJECTION)
        .sort({ createdAt: 1 })
        .skip(tailSkip)
        .limit(count)
        .maxTimeMS(5000)
        .lean();
      rawItems.reverse();
    } else {
      let q = Product.find(query).select(LIST_PROJECTION);
      const hasSpecificSort = filters.sort && filters.sort !== 'newest' && filters.sort !== 'default';
      if (!filters.search || hasSpecificSort) {
        q = q.sort(sortOption);
      }
      rawItems = await q
        .skip(skip)
        .limit(limit)
        .maxTimeMS(5000)
        .lean();
    }
  }

  return {
    items: rawItems.map(formatListItem),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getHomeSections = async () => {
  if (homeSectionsCache && Date.now() - homeSectionsCache.timestamp < QUERY_CACHE_TTL_MS) {
    return homeSectionsCache.data;
  }
  if (homeSectionsInFlight) {
    return await homeSectionsInFlight;
  }

  homeSectionsInFlight = (async () => {
    const entries = await Promise.all(
      Object.entries(HOME_SECTION_CONFIG).map(async ([key, cfg]) => {
        const query = {
          isActive: true,
          $or: [{ homeSections: cfg.homeSection }, { subCategory: cfg.subCategory }],
        };

        const [rawItems, totalItems] = await Promise.all([
          Product.find(query)
            .select(LIST_PROJECTION)
            .sort({ createdAt: -1 })
            .limit(cfg.initialLimit)
            .lean(),
          cachedCountDocuments(query),
        ]);

        return [
          key,
          {
            items: rawItems.map(formatListItem),
            totalItems,
          },
        ];
      })
    );

    const data = Object.fromEntries(entries);
    homeSectionsCache = { data, timestamp: Date.now() };
    return data;
  })();

  try {
    return await homeSectionsInFlight;
  } finally {
    homeSectionsInFlight = null;
  }
};

export const getProductStats = async () => {
  const STATS_CACHE_TIME = 300_000; // 5 phút
  if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_TIME) {
    return statsCache.data;
  }
  if (statsInFlight) {
    return await statsInFlight;
  }

  statsInFlight = (async () => {
    try {
      const [
        totalCount,
        plantCount,
        foodCount,
        accessoryCount,
        saltFishCount,
        outOfStockCount,
        sampleFish
      ] = await Promise.all([
        Product.estimatedDocumentCount().catch(() => 0),
        Product.countDocuments({ category: 'plant' }).catch(() => 0),
        Product.countDocuments({ category: 'food' }).catch(() => 0),
        Product.countDocuments({ category: { $in: ['tank', 'accessory'] } }).catch(() => 0),
        Product.countDocuments({ category: 'fish', waterType: 'saltwater' }).catch(() => 0),
        Product.countDocuments({ category: 'fish', stock: { $lte: 0 } }).catch(() => 0),
        Product.find({ category: 'fish' })
          .limit(50)
          .select('stock price')
          .lean()
          .catch(() => []),
      ]);

      const otherCategories = plantCount + foodCount + accessoryCount;
      const fishCount = Math.max(0, totalCount - otherCategories);
      const freshFishCount = Math.max(0, fishCount - saltFishCount);

      let avgStock = 25;
      let avgPrice = 45000;
      if (sampleFish.length > 0) {
        const sumStock = sampleFish.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
        const sumPrice = sampleFish.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
        avgStock = sumStock / sampleFish.length;
        avgPrice = sumPrice / sampleFish.length;
      }

      const fishStock = Math.round(fishCount * avgStock);
      const totalStock = Math.round(totalCount * avgStock);
      const totalInventoryValue = Math.round(totalStock * avgPrice);

      const summary = {
        total: totalCount,
        all: totalCount,
        fish: fishCount,
        plant: plantCount,
        food: foodCount,
        accessory: accessoryCount,
        freshFish: freshFishCount,
        saltFish: saltFishCount,
        fishStock,
        fishOutOfStock: outOfStockCount,
        totalStock,
        totalInventoryValue,
        freshwaterCount: Math.max(0, totalCount - saltFishCount),
        saltwaterCount: saltFishCount,
        lowStockCount: 0,
      };

      statsCache = { data: summary, timestamp: Date.now() };
      return summary;
    } finally {
      statsInFlight = null;
    }
  })();

  return await statsInFlight;
};

export const getProductById = async (idOrSlug) => {
  let product = null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug).lean();
  }
  if (!product) {
    product = await Product.findOne({ slug: idOrSlug }).lean();
  }
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  return product;
};

const validateProductPayload = (data, isUpdate = false) => {
  if (!isUpdate || data.name !== undefined) {
    const cleanName = String(data.name || '').trim();
    if (cleanName.length < 2 || cleanName.length > 150) {
      throw new ApiError(400, 'Tên sản phẩm phải từ 2 đến 150 ký tự');
    }
    data.name = cleanName;
  }
  if (!isUpdate || data.price !== undefined) {
    const p = Number(data.price);
    if (Number.isNaN(p) || p < 0 || p > 1000000000) {
      throw new ApiError(400, 'Giá sản phẩm phải từ 0 đến 1.000.000.000 đ');
    }
    data.price = p;
  }
  if (data.stock !== undefined) {
    const s = Number(data.stock);
    if (Number.isNaN(s) || s < 0 || s > 1000000) {
      throw new ApiError(400, 'Tồn kho sản phẩm từ 0 đến 1.000.000');
    }
    data.stock = s;
  }
  if (data.origin !== undefined) {
    const o = String(data.origin || '').trim();
    if (o.length > 60) {
      throw new ApiError(400, 'Xuất xứ sản phẩm tối đa 60 ký tự');
    }
    data.origin = o;
  }
  if (data.description !== undefined) {
    const d = String(data.description || '').trim();
    if (d.length > 5000) {
      throw new ApiError(400, 'Mô tả sản phẩm tối đa 5000 ký tự');
    }
    data.description = d;
  }
};

export const createProduct = async (productData) => {
  const data = { ...productData };
  validateProductPayload(data, false);
  if (!data.slug && data.name) {
    data.slug = `${toSlug(data.name)}-${Date.now().toString().slice(-4)}`;
  }
  if (data.stock !== undefined && data.soldOut === undefined) {
    data.soldOut = Number(data.stock) <= 0;
  }
  const created = await Product.create(data);
  invalidateProductCaches();
  return created;
};

export const updateProduct = async (id, updateData) => {
  const data = { ...updateData };
  validateProductPayload(data, true);
  if (data.stock !== undefined && data.soldOut === undefined) {
    data.soldOut = Number(data.stock) <= 0;
  }
  const product = await Product.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  invalidateProductCaches();
  return product;
};

export const deleteProduct = async (id, hard = false) => {
  let product;
  if (hard) {
    product = await Product.findByIdAndDelete(id);
  } else {
    product = await Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
  }
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  invalidateProductCaches();
  return product;
};
