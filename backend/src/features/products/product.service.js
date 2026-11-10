import mongoose from 'mongoose';
import Product from './product.model.js';
import { ApiError } from '../../utils/apiError.js';

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

  if (filters.search) {
    const terms = String(filters.search)
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
      return { createdAt: -1, _id: 1 };
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
    Product.countDocuments(query),
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
  const entries = await Promise.all(
    Object.entries(HOME_SECTION_CONFIG).map(async ([key, cfg]) => {
      const query = {
        isActive: true,
        $or: [{ homeSections: cfg.homeSection }, { subCategory: cfg.subCategory }],
      };

      const [rawItems, totalItems] = await Promise.all([
        Product.find(query)
          .select(LIST_PROJECTION)
          .sort({ createdAt: -1, _id: 1 })
          .limit(cfg.initialLimit)
          .lean(),
        Product.countDocuments(query),
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

  return Object.fromEntries(entries);
};

export const getProductStats = async () => {
  const [facetResult] = await Product.aggregate([
    {
      $facet: {
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
        ],
        overall: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalStock: { $sum: { $ifNull: ['$stock', 0] } },
              totalInventoryValue: {
                $sum: {
                  $multiply: [{ $ifNull: ['$price', 0] }, { $ifNull: ['$stock', 0] }],
                },
              },
              freshwaterCount: {
                $sum: { $cond: [{ $eq: ['$waterType', 'freshwater'] }, 1, 0] },
              },
              saltwaterCount: {
                $sum: { $cond: [{ $eq: ['$waterType', 'saltwater'] }, 1, 0] },
              },
              lowStockCount: {
                $sum: { $cond: [{ $lte: [{ $ifNull: ['$stock', 0] }, 5] }, 1, 0] },
              },
            },
          },
        ],
        fishStats: [
          { $match: { category: 'fish' } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              freshFish: {
                $sum: { $cond: [{ $eq: ['$waterType', 'freshwater'] }, 1, 0] },
              },
              saltFish: {
                $sum: { $cond: [{ $eq: ['$waterType', 'saltwater'] }, 1, 0] },
              },
              fishStock: { $sum: { $ifNull: ['$stock', 0] } },
              fishOutOfStock: {
                $sum: { $cond: [{ $lte: [{ $ifNull: ['$stock', 0] }, 0] }, 1, 0] },
              },
            },
          },
        ],
      },
    },
  ]);

  const catMap = {};
  for (const row of facetResult?.byCategory || []) {
    catMap[row._id] = row.count;
  }

  const overall = facetResult?.overall?.[0] || {};
  const fishStats = facetResult?.fishStats?.[0] || {};

  const fish = catMap.fish || 0;
  const plant = catMap.plant || 0;
  const food = catMap.food || 0;
  const accessory = (catMap.tank || 0) + (catMap.accessory || 0);

  return {
    total: overall.total || 0,
    all: overall.total || 0,
    fish,
    plant,
    food,
    accessory,
    freshFish: fishStats.freshFish || 0,
    saltFish: fishStats.saltFish || 0,
    fishStock: fishStats.fishStock || 0,
    fishOutOfStock: fishStats.fishOutOfStock || 0,
    totalStock: overall.totalStock || 0,
    totalInventoryValue: overall.totalInventoryValue || 0,
    freshwaterCount: overall.freshwaterCount || 0,
    saltwaterCount: overall.saltwaterCount || 0,
    lowStockCount: overall.lowStockCount || 0,
  };
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
  return await Product.create(data);
};

export const updateProduct = async (id, updateData) => {
  const data = { ...updateData };
  if (data.stock !== undefined && data.soldOut === undefined) {
    data.soldOut = Number(data.stock) <= 0;
  }
  const product = await Product.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
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
  return product;
};
