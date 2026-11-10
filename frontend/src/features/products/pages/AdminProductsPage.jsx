import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Droplets,
  RotateCcw,
  Fish,
  Upload,
} from 'lucide-react';
import productService, { isRequestCanceled } from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { FISH_SUBCATEGORIES, stripHtml, getSubCategoryLabel } from '../utils/productMapper.js';
import Pagination from '../../../components/common/Pagination.jsx';

// Các tab danh mục phân loại rõ ràng
const CATEGORY_TABS = [
  { value: 'fish', label: 'Cá cảnh', icon: '🐠' },
  { value: 'plant', label: 'Cây thủy sinh', icon: '🌿' },
  { value: 'food', label: 'Thức ăn & Cám', icon: '🥣' },
  { value: 'accessory', label: 'Bể & Phụ kiện', icon: '📦' },
  { value: 'all', label: 'Tất cả sản phẩm', icon: '🌐' },
];

const WATER_TYPES = [
  { value: 'all', label: 'Tất cả hệ nước' },
  { value: 'freshwater', label: 'Nước ngọt' },
  { value: 'saltwater', label: 'Nước mặn (Biển)' },
];

const DEFAULT_FORM_DATA = {
  name: '',
  description: '',
  price: '',
  category: 'fish',
  subCategory: 'ca-chuot',
  waterType: 'freshwater',
  stock: 10,
  origin: 'Việt Nam',
  imageUrl: '',
  isActive: true,
};

export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlAction = searchParams.get('action');

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [counts, setCounts] = useState({
    fish: 0,
    plant: 0,
    food: 0,
    accessory: 0,
    all: 0,
    freshFish: 0,
    saltFish: 0,
    fishStock: 0,
    fishOutOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Mặc định tab Cá cảnh (fish) để "bên cá chỉ hiển thị cá"
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'fish');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedWaterType, setSelectedWaterType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Modal Xóa
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const detailRequestRef = useRef(0);

  // Đồng bộ khi URL param thay đổi
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
      setCurrentPage(1);
    }
  }, [urlCategory]);

  useEffect(() => {
    if (urlAction === 'create') {
      handleOpenCreate();
    }
  }, [urlAction]);

  // Debounce ô tìm kiếm 350ms để không spam request mỗi lần gõ phím
  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const fetchStats = useCallback(async (signal) => {
    try {
      const stats = await productService.getProductStats({ signal });
      setCounts((prev) => ({
        ...prev,
        fish: stats.fish || 0,
        plant: stats.plant || 0,
        food: stats.food || 0,
        accessory: stats.accessory || 0,
        all: stats.all || 0,
        freshFish: stats.freshFish || 0,
        saltFish: stats.saltFish || 0,
        fishStock: stats.fishStock || 0,
        fishOutOfStock: stats.fishOutOfStock || 0,
      }));
    } catch (err) {
      if (!isRequestCanceled(err)) {
        console.error('Error fetching product stats:', err);
      }
    }
  }, []);

  const fetchProducts = useCallback(
    async ({ signal, useCache = true } = {}) => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page: currentPage,
          limit: pageSize,
          all: 'true',
        };
        if (selectedCategory === 'accessory') {
          params.categories = 'accessory,tank';
        } else if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (selectedWaterType !== 'all') {
          params.waterType = selectedWaterType;
        }
        if (selectedStatus === 'active') {
          params.isActive = 'true';
        } else if (selectedStatus === 'inactive') {
          params.isActive = 'false';
        }

        const res = await productService.getProducts(params, { signal, useCache });
        if (currentPage > res.pagination.totalPages) {
          setCurrentPage(res.pagination.totalPages);
          return;
        }
        setProducts(res.items);
        setTotalItems(res.pagination.totalItems);
        setLoading(false);
      } catch (err) {
        if (isRequestCanceled(err)) return;
        console.error(err);
        setError(err.response?.data?.message || 'Không thể tải danh sách dữ liệu.');
        setLoading(false);
      }
    },
    [currentPage, pageSize, selectedCategory, debouncedSearch, selectedWaterType, selectedStatus]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchProducts]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleTabChange = (catValue) => {
    setSelectedCategory(catValue);
    setCurrentPage(1);
    setSearchParams(catValue === 'all' ? {} : { category: catValue });
  };

  // Mở modal Thêm mới
  const handleOpenCreate = () => {
    detailRequestRef.current += 1;
    setLoadingDetail(false);
    setModalMode('create');
    setFormData({
      ...DEFAULT_FORM_DATA,
      category: selectedCategory !== 'all' && selectedCategory !== 'accessory' ? selectedCategory : 'fish',
    });
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const toModalFormData = (product) => ({
    name: product.name || '',
    description: product.description || '',
    price: product.price ?? '',
    category: product.category || 'fish',
    subCategory: product.subCategory || 'ca-chuot',
    waterType: product.waterType || 'freshwater',
    stock: product.stock ?? 0,
    origin: product.origin || 'Việt Nam',
    imageUrl: product.images && product.images[0] ? product.images[0] : '',
    isActive: product.isActive !== undefined ? product.isActive : true,
  });

  const openProductModalWithFullDetail = async (product, mode) => {
    const reqId = ++detailRequestRef.current;
    setModalMode(mode);
    setCurrentId(product._id);
    setFormData(toModalFormData(product));
    setLoadingDetail(true);
    setIsModalOpen(true);

    try {
      const fullProduct = await productService.getProductById(product._id);
      if (detailRequestRef.current === reqId && fullProduct) {
        setFormData(toModalFormData(fullProduct));
      }
    } catch (err) {
      console.error('Error loading full product detail:', err);
    } finally {
      if (detailRequestRef.current === reqId) {
        setLoadingDetail(false);
      }
    }
  };

  // Mở modal Chỉnh sửa
  const handleOpenEdit = (product) => {
    openProductModalWithFullDetail(product, 'edit');
  };

  // Mở modal Xem chi tiết
  const handleOpenView = (product) => {
    openProductModalWithFullDetail(product, 'view');
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const result = await productService.uploadImage(file);
      if (result?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      }
    } catch (err) {
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || 'Không thể tải ảnh lên'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Lưu sản phẩm (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingDetail) return;
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm / cá cảnh');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      alert('Vui lòng nhập giá bán hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      const stockNum = Number(formData.stock) || 0;
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        subCategory: formData.category === 'fish' ? formData.subCategory : '',
        categoryName: formData.category === 'fish' ? getSubCategoryLabel(formData.subCategory) : '',
        waterType: formData.waterType,
        stock: stockNum,
        soldOut: stockNum <= 0,
        origin: formData.origin.trim() || 'Việt Nam',
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        isActive: formData.isActive,
      };

      if (modalMode === 'create') {
        const created = await productService.createProduct(payload);
        setFeedback({ type: 'success', message: `Đã thêm cá/sản phẩm "${created.name}" thành công!` });
      } else if (modalMode === 'edit') {
        const updated = await productService.updateProduct(currentId, payload);
        setFeedback({ type: 'success', message: `Đã cập nhật "${updated.name}" thành công!` });
      }

      setIsModalOpen(false);
      fetchProducts({ useCache: false });
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Có lỗi xảy ra khi lưu'));
    } finally {
      setSubmitting(false);
    }
  };

  // Thực hiện Xóa
  const handleConfirmDelete = async (hard = false) => {
    if (!deleteModal.product) return;

    try {
      setDeleting(true);
      const targetId = deleteModal.product._id;
      await productService.deleteProduct(targetId, hard);

      if (hard) {
        setFeedback({
          type: 'success',
          message: `Đã xóa vĩnh viễn "${deleteModal.product.name}".`,
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Đã tạm ẩn "${deleteModal.product.name}" khỏi gian hàng.`,
        });
      }

      setDeleteModal({ open: false, product: null });
      fetchProducts({ useCache: false });
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || 'Không thể thực hiện'));
    } finally {
      setDeleting(false);
    }
  };

  // Khôi phục
  const handleRestore = async (product) => {
    try {
      const updated = await productService.updateProduct(product._id, { isActive: true });
      setFeedback({
        type: 'success',
        message: `Đã mở bán lại "${updated.name}".`,
      });
      fetchProducts({ useCache: false });
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể phục hồi'));
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'fish':
        return { label: 'Cá cảnh', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'plant':
        return { label: 'Cây thủy sinh', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'tank':
        return { label: 'Hồ kính', bg: '#fdf4ff', color: '#a21caf', border: '#f5d0fe' };
      case 'food':
        return { label: 'Thức ăn / Cám', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'accessory':
        return { label: 'Phụ kiện', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
      default:
        return { label: category, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  const getTabCount = (tabValue) => {
    switch (tabValue) {
      case 'fish':
        return counts.fish;
      case 'plant':
        return counts.plant;
      case 'food':
        return counts.food;
      case 'accessory':
        return counts.accessory;
      case 'all':
      default:
        return counts.all;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header và Nút Tạo Mới */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {selectedCategory === 'fish'
              ? 'Quản Lý Cá Cảnh & Sinh Vật'
              : selectedCategory === 'plant'
              ? 'Quản Lý Cây Thủy Sinh'
              : selectedCategory === 'food'
              ? 'Quản Lý Thức Ăn & Cám Cá'
              : selectedCategory === 'accessory'
              ? 'Quản Lý Bể Kính & Phụ Kiện'
              : 'Dữ Liệu Toàn Bộ Sản Phẩm'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {selectedCategory === 'fish'
              ? 'Danh sách các loài cá cảnh nước ngọt và nước mặn, giá bán và số lượng tồn bể.'
              : 'Xem dữ liệu chi tiết, phân loại và thực hiện thêm, sửa, xóa.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              fetchProducts({ useCache: false });
              fetchStats();
            }}
            title="Làm mới danh sách"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Tải lại</span>
          </button>

          <button
            onClick={handleOpenCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Plus size={16} />
            <span>{selectedCategory === 'fish' ? 'Thêm cá cảnh mới' : 'Thêm sản phẩm mới'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row - Thay đổi linh hoạt theo ngữ cảnh */}
      {selectedCategory === 'fish' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng dòng cá cảnh
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>
              {counts.fish} loài
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Đang quản lý trong kho
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Cá Nước Ngọt
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
              {counts.freshFish} dòng
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Betta, Dĩa, Neon, Thủy sinh...
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Cá Nước Mặn (Biển)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>
              {counts.saltFish} dòng
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Cá hề Nemo, san hô...
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng số lượng cá trong bể
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
              {counts.fishStock} con
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Số lượng cá sẵn sàng giao
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Hết hàng / Tồn 0
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: counts.fishOutOfStock > 0 ? '#ef4444' : '#10b981',
                marginTop: '0.25rem',
              }}
            >
              {counts.fishOutOfStock}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              {counts.fishOutOfStock > 0 ? 'Cần nhập thêm đợt cá mới' : 'Kho cá đầy đủ'}
            </div>
          </div>
        </div>
      ) : null}

      {/* Thanh Tabs danh mục để tách biệt Cá, Cây, Thức ăn/Cám, Phụ kiện */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.value;
          const count = getTabCount(tab.value);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                border: '1px solid',
                borderColor: isActive ? '#cbd5e1' : '#e2e8f0',
                borderBottom: isActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                borderRadius: '4px 4px 0 0',
                color: isActive ? '#0284c7' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#e0f2fe' : '#e2e8f0',
                  color: isActive ? '#0369a1' : '#64748b',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar - Nền trắng, viền thanh mảnh */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder={selectedCategory === 'fish' ? 'Tìm theo tên cá cảnh, xuất xứ...' : 'Tìm kiếm theo tên...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          {/* Lọc hệ sinh thái nước */}
          <select
            value={selectedWaterType}
            onChange={(e) => {
              setSelectedWaterType(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {WATER_TYPES.map((wt) => (
              <option key={wt.value} value={wt.value}>
                {wt.label}
              </option>
            ))}
          </select>

          {/* Lọc trạng thái kinh doanh */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang mở bán</option>
            <option value="inactive">Đã tạm ẩn</option>
          </select>
        </div>

        {/* Nút reset filter */}
        {(searchTerm || selectedWaterType !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDebouncedSearch('');
              setSelectedWaterType('all');
              setSelectedStatus('all');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Bỏ lọc
          </button>
        )}
      </div>

      {/* Data Table Container - Tông màu trắng thanh lịch */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '70px' }}>Ảnh</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
                  {selectedCategory === 'fish' ? 'Tên cá cảnh & Xuất xứ' : 'Tên sản phẩm & Xuất xứ'}
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '130px' }}>Phân loại</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '120px' }}>Môi trường</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '130px' }}>Giá bán</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '90px' }}>Tồn kho</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '110px' }}>Trạng thái</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '140px', textAlign: 'right' }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={24} className="animate-spin" color="#0284c7" />
                      <span>Đang nạp dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={24} />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={32} color="#cbd5e1" />
                      <span>Không có dữ liệu nào khớp với bộ lọc hiện tại.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const catBadge = getCategoryBadge(product.category);
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease',
                        opacity: product.isActive ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfcfe')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Cột Ảnh */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Fish size={20} color="#94a3b8" />
                          )}
                        </div>
                      </td>

                      {/* Cột Tên & Chi tiết */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>
                          {product.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>Xuất xứ: {product.origin || 'Việt Nam'}</span>
                          {product.description && (
                            <>
                              <span>•</span>
                              <span
                                style={{
                                  maxWidth: '280px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {stripHtml(product.description)}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Cột Phân loại */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '3px',
                            backgroundColor: catBadge.bg,
                            color: catBadge.color,
                            border: `1px solid ${catBadge.border}`,
                          }}
                        >
                          {catBadge.label}
                        </span>
                      </td>

                      {/* Cột Môi trường nước */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                          <Droplets
                            size={14}
                            color={product.waterType === 'saltwater' ? '#2563eb' : '#059669'}
                          />
                          <span style={{ color: '#334155' }}>
                            {product.waterType === 'saltwater' ? 'Nước mặn' : 'Nước ngọt'}
                          </span>
                        </div>
                      </td>

                      {/* Cột Giá */}
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency(product.price)}
                      </td>

                      {/* Cột Tồn kho */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '3px',
                            backgroundColor: isOutOfStock
                              ? '#fef2f2'
                              : isLowStock
                              ? '#fffbeb'
                              : '#f0fdf4',
                            color: isOutOfStock
                              ? '#dc2626'
                              : isLowStock
                              ? '#b45309'
                              : '#15803d',
                            border: `1px solid ${
                              isOutOfStock
                                ? '#fecaca'
                                : isLowStock
                                ? '#fde68a'
                                : '#bbf7d0'
                            }`,
                          }}
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Cột Trạng thái */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {product.isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: '#16a34a',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#16a34a',
                              }}
                            />
                            Đang bán
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: '#94a3b8',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#94a3b8',
                              }}
                            />
                            Đã tạm ẩn
                          </span>
                        )}
                      </td>

                      {/* Cột Hành động */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenView(product)}
                            title="Xem chi tiết"
                            style={{
                              padding: '0.375rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              color: '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(product)}
                            title="Chỉnh sửa sản phẩm"
                            style={{
                              padding: '0.375rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              color: '#0284c7',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          {!product.isActive ? (
                            <button
                              onClick={() => handleRestore(product)}
                              title="Khôi phục / Mở bán lại"
                              style={{
                                padding: '0.375rem',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '4px',
                                color: '#16a34a',
                                cursor: 'pointer',
                              }}
                            >
                              <RotateCcw size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteModal({ open: true, product })}
                              title="Xóa / Ẩn sản phẩm"
                              style={{
                                padding: '0.375rem',
                                backgroundColor: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                color: '#ef4444',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer phân trang bảng dữ liệu */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="sản phẩm"
        />
      </div>

      {/* Modal Thêm Mới / Sửa / Chi Tiết */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {modalMode === 'create'
                    ? selectedCategory === 'fish'
                      ? 'Thêm Cá Cảnh Mới'
                      : 'Thêm Sản Phẩm Mới'
                    : modalMode === 'edit'
                    ? `Chỉnh Sửa: ${formData.name}`
                    : `Chi Tiết Sản Phẩm`}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {modalMode === 'view'
                    ? 'Xem toàn bộ thông số kỹ thuật và hình ảnh.'
                    : 'Điền đầy đủ thông tin bên dưới và bấm Lưu.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {modalMode === 'view' ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt={formData.name}
                      style={{
                        width: '160px',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '160px',
                        height: '160px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      <Fish size={40} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                      {formData.name}
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.75rem' }}>
                      {formatCurrency(Number(formData.price))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Phân loại:</span>{' '}
                        <strong>{getCategoryBadge(formData.category).label}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Hệ nước:</span>{' '}
                        <strong>{formData.waterType === 'saltwater' ? 'Nước mặn' : 'Nước ngọt'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Xuất xứ:</span>{' '}
                        <strong>{formData.origin || 'Việt Nam'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Tồn kho:</span>{' '}
                        <strong>{formData.stock}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Mô tả đặc tính & Chăm sóc
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {stripHtml(formData.description) || 'Chưa có thông tin mô tả chi tiết.'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setModalMode('edit')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Chuyển sang Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Tên cá cảnh / Sinh vật / Sản phẩm <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cá Betta Halfmoon Xanh, Cá Dĩa Bồ Câu..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Phân loại
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="fish">Cá cảnh</option>
                      <option value="plant">Cây thủy sinh</option>
                      <option value="tank">Bể & Hồ kính</option>
                      <option value="accessory">Phụ kiện lọc, đèn</option>
                      <option value="food">Thức ăn / Cám cho cá</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Môi trường nước
                    </label>
                    <select
                      value={formData.waterType}
                      onChange={(e) => setFormData({ ...formData, waterType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="freshwater">Nước ngọt</option>
                      <option value="saltwater">Nước mặn (Biển)</option>
                    </select>
                  </div>
                </div>

                {formData.category === 'fish' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Nhóm cá hiển thị trên Trang chủ & Bộ sưu tập
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {FISH_SUBCATEGORIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Giá bán (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="150000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Tồn kho
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Xuất xứ
                    </label>
                    <input
                      type="text"
                      placeholder="Việt Nam, Thái Lan..."
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Hình ảnh sản phẩm (Tải file hoặc nhập URL)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="https://... hoặc /uploads/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.875rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#0284c7',
                        cursor: uploadingImage ? 'wait' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Upload size={15} />
                      <span>{uploadingImage ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Xem trước ảnh sản phẩm</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Mô tả đặc tính & Cách chăm sóc
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả tập tính, kích thước tối đa, nhiệt độ và độ pH thích hợp..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="isActiveToggle" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                    Kích hoạt hiển thị và mở bán ngay trên gian hàng
                  </label>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || loadingDetail}
                    style={{
                      padding: '0.5rem 1.25rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: submitting || loadingDetail ? 'not-allowed' : 'pointer',
                      opacity: loadingDetail ? 0.7 : 1,
                    }}
                  >
                    {loadingDetail
                      ? 'Đang tải chi tiết...'
                      : submitting
                      ? 'Đang lưu...'
                      : modalMode === 'create'
                      ? 'Tạo sản phẩm'
                      : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deleteModal.open && deleteModal.product && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem',
          }}
          onClick={() => !deleting && setDeleteModal({ open: false, product: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fecaca',
                }}
              >
                <Trash2 size={20} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Xác nhận xử lý sản phẩm
                </h3>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {deleteModal.product.name}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Bạn có thể chọn <strong>Tạm ẩn</strong> (người mua không thấy, có thể mở lại bất cứ lúc nào) hoặc{' '}
              <strong>Xóa vĩnh viễn</strong> hoàn toàn khỏi cơ sở dữ liệu.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleConfirmDelete(false)}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                1. Tạm ẩn khỏi gian hàng (Khuyên dùng)
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => handleConfirmDelete(true)}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                2. Xóa vĩnh viễn khỏi hệ thống
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal({ open: false, product: null })}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Hủy thao tác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
