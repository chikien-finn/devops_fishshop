import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Ticket,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  Copy,
  Check,
  TrendingUp,
  Percent,
  Coins,
} from 'lucide-react';
import couponService from '../services/couponService.js';
import { formatCurrency, formatDate } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expired

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null });
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    code: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    hasUsageLimit: true,
    usageLimit: '100',
    validFrom: new Date().toISOString().split('T')[0],
    hasValidUntil: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await couponService.listCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách voucher:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Copy code handler
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Modal Create
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialFormState);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      hasUsageLimit: coupon.usageLimit !== null && coupon.usageLimit !== undefined,
      usageLimit: coupon.usageLimit || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      hasValidUntil: !!coupon.validUntil,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      active: coupon.active !== undefined ? coupon.active : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Toggle active status
  const handleToggleActive = async (coupon) => {
    try {
      const newActive = !coupon.active;
      await couponService.updateCoupon(coupon._id, { active: newActive });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, active: newActive } : c))
      );
      showToast(newActive ? `Đã kích hoạt mã ${coupon.code}` : `Đã tạm dừng mã ${coupon.code}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = String(formData.code || '').trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Vui lòng nhập mã voucher');
      return;
    }
    const val = Number(formData.discountValue);
    if (!val || val <= 0) {
      setFormError('Mức giảm phải lớn hơn 0');
      return;
    }
    if (formData.discountType === 'percentage' && val > 100) {
      setFormError('Giảm theo phần trăm không được vượt quá 100%');
      return;
    }

    if (formData.hasValidUntil && formData.validFrom && formData.validUntil) {
      if (new Date(formData.validUntil) < new Date(formData.validFrom)) {
        setFormError('Ngày hết hạn phải sau ngày bắt đầu');
        return;
      }
    }

    const payload = {
      code: cleanCode,
      discountType: formData.discountType,
      discountValue: val,
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscount: formData.discountType === 'percentage' && formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.hasUsageLimit && formData.usageLimit ? Number(formData.usageLimit) : null,
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
      validUntil: formData.hasValidUntil && formData.validUntil ? new Date(formData.validUntil + 'T23:59:59.999Z').toISOString() : null,
      active: formData.active,
    };

    try {
      setSubmitting(true);
      if (editingCoupon) {
        const updated = await couponService.updateCoupon(editingCoupon._id, payload);
        setCoupons((prev) => prev.map((c) => (c._id === editingCoupon._id ? updated : c)));
        showToast(`Đã cập nhật mã voucher ${cleanCode} thành công!`);
      } else {
        const created = await couponService.createCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        showToast(`Đã thêm mã voucher ${cleanCode} thành công!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Lỗi lưu voucher:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu mã voucher');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Voucher
  const handleConfirmDelete = async () => {
    if (!deleteModal.coupon) return;
    try {
      setDeleting(true);
      await couponService.deleteCoupon(deleteModal.coupon._id);
      setCoupons((prev) => prev.filter((c) => c._id !== deleteModal.coupon._id));
      showToast(`Đã xóa mã voucher ${deleteModal.coupon.code}`);
      setDeleteModal({ open: false, coupon: null });
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa mã voucher', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Check voucher status helper
  const getVoucherValidity = (coupon) => {
    const now = new Date();
    if (!coupon.active) return { text: 'Tạm tắt', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { text: 'Chưa bắt đầu', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { text: 'Đã hết hạn', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { text: 'Đã hết lượt', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
    }
    return { text: 'Đang áp dụng', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' };
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((coupon) => {
      const matchSearch =
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (statusFilter === 'active') {
        const isExpired = coupon.validUntil && new Date(coupon.validUntil) < now;
        const isRunOut = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
        return coupon.active && !isExpired && !isRunOut;
      }
      if (statusFilter === 'inactive') {
        return !coupon.active;
      }
      if (statusFilter === 'expired') {
        const isExpired = coupon.validUntil && new Date(coupon.validUntil) < now;
        const isRunOut = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
        return isExpired || isRunOut;
      }
      return true;
    });
  }, [coupons, searchTerm, statusFilter]);

  // Paginated coupons
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    let total = coupons.length;
    let active = 0;
    let expired = 0;
    let totalUsed = 0;

    coupons.forEach((c) => {
      totalUsed += c.usedCount || 0;
      const isExpired = c.validUntil && new Date(c.validUntil) < now;
      const isRunOut = c.usageLimit && c.usedCount >= c.usageLimit;
      if (c.active && !isExpired && !isRunOut) {
        active++;
      } else {
        expired++;
      }
    });

    return { total, active, expired, totalUsed };
  }, [coupons]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#0284c7',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Action Button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Ticket size={20} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Quản Lý &amp; Thêm Mã Giảm Giá (Voucher)
            </h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Thiết lập mã khuyến mãi, ngày bắt đầu, ngày hết hạn, mức giảm giá và số lượng voucher phát hành.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchCoupons}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>+ Thêm Voucher Mới</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>TỔNG VOUCHER</span>
            <Ticket size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Toàn bộ mã đã tạo trong hệ thống</div>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>ĐANG HOẠT ĐỘNG</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.3rem' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Khách hàng có thể áp dụng mua hàng</div>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>HẾT HẠN / TẠM DỪNG</span>
            <Clock size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '0.3rem' }}>
            {stats.expired}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Đã qua ngày kết thúc hoặc hết lượt</div>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8b5cf6', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>LƯỢT ĐÃ SỬ DỤNG</span>
            <TrendingUp size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.3rem' }}>
            {stats.totalUsed.toLocaleString('vi-VN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Lượt mã voucher khách đã chốt đơn</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm theo mã voucher (VD: VIP, AQUA...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Đang hoạt động' },
            { id: 'inactive', label: 'Tạm tắt' },
            { id: 'expired', label: 'Hết hạn / Hết lượt' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: statusFilter === tab.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === tab.id ? '#e0f2fe' : '#ffffff',
                color: statusFilter === tab.id ? '#0369a1' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {loading && coupons.length === 0 ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#0284c7' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Đang tải danh sách voucher…</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
            <button
              onClick={fetchCoupons}
              style={{
                marginTop: '0.75rem',
                padding: '0.4rem 0.85rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Thử lại
            </button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <Ticket size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
              {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy voucher phù hợp' : 'Chưa có voucher nào'}
            </p>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc'
                : 'Bấm nút "+ Thêm Voucher Mới" để tạo chương trình khuyến mãi đầu tiên.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleOpenCreateModal}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                + Thêm Voucher Mới
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Mã Voucher</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Mức Giảm &amp; Điều Kiện</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Số Lượng &amp; Đã Dùng</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Thời Gian Hiệu Lực</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                {paginatedCoupons.map((coupon) => {
                  const validity = getVoucherValidity(coupon);
                  const isPct = coupon.discountType === 'percentage';
                  const usagePct = coupon.usageLimit
                    ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))
                    : null;

                  return (
                    <tr
                      key={coupon._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Code */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: '#0284c7',
                              backgroundColor: '#e0f2fe',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px dashed #0284c7',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Sao chép mã"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0.2rem',
                              cursor: 'pointer',
                              color: copiedCode === coupon.code ? '#16a34a' : '#94a3b8',
                            }}
                          >
                            {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Discount & Condition */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {isPct ? (
                              <>
                                <span style={{ color: '#0284c7' }}>Giảm {coupon.discountValue}%</span>
                                {coupon.maxDiscount && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                    (Tối đa {formatCurrency(coupon.maxDiscount)})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span style={{ color: '#059669' }}>Giảm {formatCurrency(coupon.discountValue)}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Đơn tối thiểu: <strong>{formatCurrency(coupon.minOrderAmount || 0)}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Quantity & Usage */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '130px' }}>
                          <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>
                            Đã dùng: <strong style={{ color: '#0284c7' }}>{coupon.usedCount || 0}</strong>
                            {' / '}
                            {coupon.usageLimit ? (
                              <span>{coupon.usageLimit} lượt</span>
                            ) : (
                              <span style={{ color: '#16a34a' }}>∞ Không giới hạn</span>
                            )}
                          </div>
                          {coupon.usageLimit && (
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${usagePct}%`,
                                  height: '100%',
                                  backgroundColor: usagePct >= 90 ? '#ef4444' : '#0284c7',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Time Validity */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#334155' }}>
                            <Calendar size={13} color="#94a3b8" />
                            <span>Bắt đầu: {coupon.validFrom ? formatDate(coupon.validFrom) : 'Ngay tạo'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#334155' }}>
                            <Clock size={13} color="#94a3b8" />
                            <span>
                              Hết hạn: <strong>{coupon.validUntil ? formatDate(coupon.validUntil) : 'Vô thời hạn'}</strong>
                            </span>
                          </div>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: validity.bg,
                                color: validity.color,
                                border: `1px solid ${validity.border}`,
                              }}
                            >
                              {validity.text}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          title={coupon.active ? 'Bấm để tạm dừng voucher' : 'Bấm để kích hoạt voucher'}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '9999px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: coupon.active ? '#dcfce7' : '#f1f5f9',
                            color: coupon.active ? '#15803d' : '#64748b',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {coupon.active ? '✓ Đang bật' : '✕ Đang tắt'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            title="Chỉnh sửa voucher"
                            style={{
                              padding: '0.4rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteModal({ open: true, coupon })}
                            title="Xóa voucher"
                            style={{
                              padding: '0.4rem',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCoupons.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              itemLabel="voucher"
            />
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA VOUCHER */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingCoupon ? 'Chỉnh Sửa Mã Voucher' : 'Thêm Mã Voucher Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
              {formError && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Mã voucher */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  MÃ VOUCHER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TET2026, AQUA50K, VIP10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: '#0284c7',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                  Khách hàng sẽ nhập mã này ở giỏ hàng để được giảm giá.
                </span>
              </div>

              {/* 2. Loại giảm giá & Mức giảm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    LOẠI GIẢM GIÁ *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="percentage">Giảm theo % (Phần trăm)</option>
                    <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    MỨC GIẢM * ({formData.discountType === 'percentage' ? '%' : 'VNĐ'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === 'percentage' ? 100 : 100000000}
                    placeholder={formData.discountType === 'percentage' ? 'VD: 15' : 'VD: 50000'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 3. Giảm tối đa & Đơn tối thiểu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    ĐƠN HÀNG TỐI THIỂU (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="VD: 150000 (0 nếu không áp dụng)"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    GIẢM TỐI ĐA (VNĐ) {formData.discountType === 'fixed' && '(Không cần)'}
                  </label>
                  <input
                    type="number"
                    disabled={formData.discountType === 'fixed'}
                    min={0}
                    step={1000}
                    placeholder={formData.discountType === 'percentage' ? 'VD: 50000 (để trống nếu không chặn)' : 'Áp dụng cho giảm %'}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: formData.discountType === 'fixed' ? '#f1f5f9' : '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 4. Số lượng voucher phát hành */}
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    SỐ LƯỢNG VOUCHER PHÁT HÀNH *
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!formData.hasUsageLimit}
                      onChange={(e) => setFormData({ ...formData, hasUsageLimit: !e.target.checked })}
                    />
                    <span>Không giới hạn số lượng</span>
                  </label>
                </div>
                {formData.hasUsageLimit ? (
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Nhập số lượt có thể dùng (VD: 100, 500...)"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    ✓ Bất kỳ khách hàng nào cũng có thể áp dụng mã này không giới hạn số lượt.
                  </div>
                )}
              </div>

              {/* 5. Ngày bắt đầu & Ngày hết hạn */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    NGÀY BẮT ĐẦU *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                      NGÀY HẾT HẠN
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#64748b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!formData.hasValidUntil}
                        onChange={(e) => setFormData({ ...formData, hasValidUntil: !e.target.checked })}
                      />
                      <span>Vô thời hạn</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={!formData.hasValidUntil}
                    required={formData.hasValidUntil}
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: !formData.hasValidUntil ? '#f1f5f9' : '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 6. Trạng thái kích hoạt */}
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="activeVoucher"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="activeVoucher" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Kích hoạt mã voucher ngay bây giờ
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {submitting ? 'Đang lưu…' : editingCoupon ? 'Cập Nhật Voucher' : 'Tạo Voucher Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP XÁC NHẬN XÓA VOUCHER */}
      {deleteModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Xóa mã voucher này?
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Mày có chắc chắn muốn xóa mã voucher{' '}
              <strong style={{ color: '#0284c7' }}>{deleteModal.coupon?.code}</strong>? Sau khi xóa, khách hàng sẽ không thể nhập mã này nữa.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteModal({ open: false, coupon: null })}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Đang xóa…' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
