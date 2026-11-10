import { formatCurrency } from '../../../utils/formatters.js';

export const FISH_SUBCATEGORIES = [
  { value: 'ca-neon', label: 'Cá Neon & Tetra', menuLabel: 'Cá Neon' },
  { value: 'ca-dia', label: 'Cá Dĩa', menuLabel: 'Cá Dĩa', route: '/ca-dia' },
  { value: 'ca-than-tien', label: 'Cá Thần Tiên', menuLabel: 'Cá Thần Tiên' },
  { value: 'ca-chuot', label: 'Cá Chuột Vệ Sinh Hồ', menuLabel: 'Cá Chuột', route: '/ca-chuot' },
  { value: 'ca-phuong-hoang', label: 'Cá Phượng Hoàng', menuLabel: 'Cá Phượng Hoàng', route: '/ca-phuong-hoang' },
  { value: 'ca-ali', label: 'Cá Ali Thái (Cichlid)', menuLabel: 'Cá Ali Thái' },
  { value: 'ca-molly', label: 'Cá Molly, Bình Tích & Mún', menuLabel: 'Cá Molly, Bình Tích & Mún' },
  { value: 'ca-betta', label: 'Cá Betta', menuLabel: 'Cá Betta' },
  { value: 'ca-bay-mau', label: 'Cá Bảy Màu (Guppy)', menuLabel: 'Cá Bảy Màu (Guppy)' },
  { value: 'ca-cau-vong', label: 'Cá Cầu Vồng', menuLabel: 'Cá Cầu Vồng' },
  { value: 'tep', label: 'Tép Thủy Sinh', menuLabel: 'Tép Thủy Sinh', route: '/tep' },
  { value: 'lau-kieng', label: 'Cá Lau Kiếng & Vệ Sinh Hồ', menuLabel: 'Lau Kiếng, Vệ Sinh Hồ' },
  { value: 'ca-thuy-sinh', label: 'Cá Thủy Sinh Bơi Đàn', menuLabel: 'Cá Thủy Sinh Bơi Đàn' },
  { value: 'ca-koi', label: 'Cá Koi Đà Nẵng', menuLabel: 'Cá Koi Đà Nẵng' },
  { value: 'ca-vang', label: 'Cá Vàng', menuLabel: 'Cá Vàng' },
  { value: 'ca-la-han', label: 'Cá La Hán & Hồng Két', menuLabel: 'Cá La Hán & Hồng Két' },
  { value: 'ca-rong', label: 'Cá Rồng & Cá Cảnh Lớn', menuLabel: 'Cá Rồng & Cá Lớn' },
  { value: 'ca-bien', label: 'Cá Cảnh Nước Mặn', menuLabel: 'Cá Cảnh Biển' },
  { value: 'ca-canh', label: 'Cá Cảnh Khác', menuLabel: 'Cá Cảnh Khác' },
];

export function getSubCategoryLabel(subCategory) {
  return FISH_SUBCATEGORIES.find((item) => item.value === subCategory)?.label || 'Cá Cảnh';
}

export function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatCatalogProduct(p) {
  if (!p) return null;

  const id = p._id || p.id;
  const images =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : Array.isArray(p.gallery) && p.gallery.length > 0
      ? p.gallery
      : p.image
      ? [p.image]
      : ['/logo.png'];

  const price = Number(p.price) || 0;
  const oldPrice = p.oldPrice ? Number(p.oldPrice) : null;
  const isSoldOut =
    typeof p.stock === 'number'
      ? p.stock <= 0 || Boolean(p.soldOut)
      : Boolean(p.soldOut);

  return {
    ...p,
    _id: id,
    id,
    slug: p.slug || id,
    image: images[0],
    gallery: images,
    price,
    priceFormatted: p.priceFormatted || formatCurrency(price),
    oldPrice,
    oldPriceFormatted: oldPrice ? formatCurrency(oldPrice) : null,
    discount: p.discount || '',
    soldOut: isSoldOut,
    stock: typeof p.stock === 'number' ? p.stock : isSoldOut ? 0 : 25,
    actionText: p.actionText || 'TÙY CHỌN',
    sizes:
      Array.isArray(p.sizes) && p.sizes.length > 0
        ? p.sizes
        : ['Tiêu chuẩn'],
    specs: p.specs || {
      ph: '6.5 - 7.5',
      temp: '26 - 28°C',
      food: 'Cám, trùn chỉ, bobo...',
      habit: 'Hiền lành, bơi theo đàn',
    },
    categoryName: p.categoryName || 'Cá Cảnh Thủy Sinh',
    subCategory: p.subCategory || '',
    homeSections: Array.isArray(p.homeSections) ? p.homeSections : [],
  };
}
