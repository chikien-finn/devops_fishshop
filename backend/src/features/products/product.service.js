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

  const value = await Product.countDocuments(query);
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
          const regex = new RegExp(escapeRegex(term), 'i');
          searchOr.push({ name: regex }, { categoryName: regex }, { origin: regex });
          const slugTerm = toSlug(term);
          if (slugTerm) {
            searchOr.push({ slug: new RegExp(escapeRegex(slugTerm), 'i') });
          }
        }
        andConditions.push({ $or: searchOr });
      }
    } else if (rawSearch) {
      const tokens = rawSearch
        .replace(/"/g, ' ')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);
      if (tokens.length > 0) {
        andConditions.push({
          $text: { $search: tokens.map((token) => `"${token}"`).join(' ') },
        });
      }
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

  const [rawItems, totalItems] = await Promise.all([
    Product.find(query)
      .select(LIST_PROJECTION)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    cachedCountDocuments(query),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

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
  if (statsCache && Date.now() - statsCache.timestamp < QUERY_CACHE_TTL_MS) {
    return statsCache.data;
  }
  if (statsInFlight) {
    return await statsInFlight;
  }

  statsInFlight = (async () => {
    const rows = await Product.aggregate([
      { $match: { category: { $gte: '' } } },
      { $project: { _id: 0, category: 1, waterType: 1, stock: 1, price: 1 } },
      {
        $group: {
          _id: { category: '$category', waterType: '$waterType' },
          count: { $sum: 1 },
          totalStock: { $sum: { $ifNull: ['$stock', 0] } },
          totalInventoryValue: {
            $sum: {
              $multiply: [{ $ifNull: ['$price', 0] }, { $ifNull: ['$stock', 0] }],
            },
          },
          lowStockCount: {
            $sum: { $cond: [{ $lte: [{ $ifNull: ['$stock', 0] }, 5] }, 1, 0] },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $lte: [{ $ifNull: ['$stock', 0] }, 0] }, 1, 0] },
          },
        },
      },
    ]);

    const summary = {
      total: 0,
      all: 0,
      fish: 0,
      plant: 0,
      food: 0,
      accessory: 0,
      freshFish: 0,
      saltFish: 0,
      fishStock: 0,
      fishOutOfStock: 0,
      totalStock: 0,
      totalInventoryValue: 0,
      freshwaterCount: 0,
      saltwaterCount: 0,
      lowStockCount: 0,
    };

    for (const row of rows) {
      const cat = row._id?.category;
      const water = row._id?.waterType;
      const count = row.count || 0;
      const stock = row.totalStock || 0;
      const value = row.totalInventoryValue || 0;
      const low = row.lowStockCount || 0;
      const out = row.outOfStockCount || 0;

      summary.total += count;
      summary.all += count;
      summary.totalStock += stock;
      summary.totalInventoryValue += value;
      summary.lowStockCount += low;

      if (water === 'freshwater') summary.freshwaterCount += count;
      if (water === 'saltwater') summary.saltwaterCount += count;

      if (cat === 'fish') {
        summary.fish += count;
        summary.fishStock += stock;
        summary.fishOutOfStock += out;
        if (water === 'freshwater') summary.freshFish += count;
        if (water === 'saltwater') summary.saltFish += count;
      } else if (cat === 'plant') {
        summary.plant += count;
      } else if (cat === 'food') {
        summary.food += count;
      } else if (cat === 'tank' || cat === 'accessory') {
        summary.accessory += count;
      }
    }

    statsCache = { data: summary, timestamp: Date.now() };
    return summary;
  })();

  try {
    return await statsInFlight;
  } finally {
    statsInFlight = null;
  }
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

export const createProduct = async (productData) => {
  const data = { ...productData };
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
