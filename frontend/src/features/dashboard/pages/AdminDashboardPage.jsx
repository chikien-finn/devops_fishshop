import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Fish,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi.js';
import productService, { isRequestCanceled } from '../../products/services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

const DEFAULT_STATS = {
  revenue: {
    totalRevenue: 0,
    deliveredRevenue: 0,
    averageOrderValue: 0,
  },
  orders: {
    total: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    successRate: 0,
  },
  products: {
    total: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    fishCount: 0,
    plantCount: 0,
    foodCount: 0,
    accessoryCount: 0,
    freshwaterCount: 0,
    saltwaterCount: 0,
    lowStockCount: 0,
  },
  customers: {
    total: 0,
    customers: 0,
    admins: 0,
  },
  reviews: {
    total: 0,
    avgRating: 5.0,
  },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockTotal, setLowStockTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockPageSize, setLowStockPageSize] = useState(10);

  // Tải dữ liệu Dashboard từ các API chuyên biệt của Thành viên 4
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, ordersRes, topRes] = await Promise.all([
        dashboardApi.getStats().catch(() => DEFAULT_STATS),
        dashboardApi.getRecentOrders(5).catch(() => []),
        dashboardApi.getTopProducts(5).catch(() => []),
      ]);

      if (statsRes) {
        setStats(statsRes);
      }
      setRecentOrders(ordersRes || []);
      setTopProducts(topRes || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tải danh sách cá cảnh / sản phẩm sắp hết hàng
  const fetchLowStockData = useCallback(
    async ({ signal, useCache = true } = {}) => {
      try {
        const res = await productService.getProducts(
          {
            all: 'true',
            maxStock: 5,
            sort: 'stock-asc',
            page: lowStockPage,
            limit: lowStockPageSize,
          },
          { signal, useCache }
        );
        setLowStockItems(res.items || []);
        setLowStockTotal(res.pagination?.totalItems || 0);
      } catch (err) {
        if (!isRequestCanceled(err)) {
          console.error('Lỗi khi tải sản phẩm tồn ít:', err);
        }
      }
    },
    [lowStockPage, lowStockPageSize]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLowStockData({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchLowStockData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
    fetchLowStockData({ useCache: false });
  };

  // Helper render badge trạng thái đơn hàng
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 600 }}>
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'confirmed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> Đã xác nhận
          </span>
        );
      case 'shipping':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 600 }}>
            <Truck size={12} /> Đang giao
          </span>
        );
      case 'delivered':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> Đã giao
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
            <XCircle size={12} /> Đã hủy
          </span>
        );
      default:
        return <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
      {/* Header Dashboard */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Hệ Thống Thống Kê &amp; Báo Cáo (Admin Dashboard)
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem', margin: 0 }}>
            Theo dõi thời gian thực doanh thu bán hàng, tiến độ xử lý đơn, tồn kho cá cảnh và sản phẩm bán chạy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Đang cập nhật…' : 'Làm mới'}</span>
          </button>

          <Link
            to="/admin/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ShoppingBag size={16} />
            <span>Duyệt đơn hàng</span>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ Tổng Quan (Cards KPI) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Doanh thu */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng Doanh Thu
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {formatCurrency(stats.revenue?.totalRevenue || 0)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span>Đã giao thành công:</span>
            <strong>{formatCurrency(stats.revenue?.deliveredRevenue || 0)}</strong>
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng Đơn Hàng
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {(stats.orders?.total || 0).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>đơn</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span>Chờ duyệt: <strong style={{ color: '#b45309' }}>{stats.orders?.pending || 0}</strong></span>
            <span>Đã giao: <strong style={{ color: '#15803d' }}>{stats.orders?.delivered || 0}</strong></span>
          </div>
        </div>

        {/* Card 3: Sản phẩm cá cảnh */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Cá Cảnh &amp; Thủy Sinh
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Fish size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {(stats.products?.total || 0).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>mẫu cá</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span>Tổng tồn kho: <strong>{(stats.products?.totalStock || 0).toLocaleString()}</strong> con</span>
            <span>Cá cảnh: <strong>{stats.products?.fishCount || 0}</strong></span>
          </div>
        </div>

        {/* Card 4: Khách hàng & Người dùng */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Khách Hàng Thành Viên
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {(stats.customers?.total || 0).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>tài khoản</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span>Đánh giá: <strong>{stats.reviews?.total || 0}</strong> ({stats.reviews?.avgRating || 5.0}★)</span>
            <span>Quản trị: <strong>{stats.customers?.admins || 1}</strong></span>
          </div>
        </div>
      </div>

      {/* Biểu đồ Thống kê (Charts Row) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Biểu đồ 1: Phân bổ Đơn hàng theo trạng thái */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Tiến Độ Xử Lý &amp; Trạng Thái Đơn Hàng
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Tỷ lệ giao: {stats.orders?.successRate || 0}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Chờ duyệt', count: stats.orders?.pending || 0, color: '#f59e0b' },
              { label: 'Đã xác nhận', count: stats.orders?.confirmed || 0, color: '#0284c7' },
              { label: 'Đang vận chuyển', count: stats.orders?.shipping || 0, color: '#8b5cf6' },
              { label: 'Đã giao thành công', count: stats.orders?.delivered || 0, color: '#16a34a' },
              { label: 'Đã hủy', count: stats.orders?.cancelled || 0, color: '#ef4444' },
            ].map((item) => {
              const totalOrd = stats.orders?.total || 1;
              const pct = stats.orders?.total > 0 ? Math.round((item.count / totalOrd) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      {item.count} đơn ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 2: Cơ cấu phân bổ danh mục cá cảnh & phụ kiện */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Cơ Cấu Danh Mục Trong Kho
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Giá trị kho: <strong>{formatCurrency(stats.products?.totalInventoryValue || 0)}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: '🐠 Cá cảnh các loại', count: stats.products?.fishCount || 0, color: '#0284c7' },
              { label: '🌿 Cây thủy sinh', count: stats.products?.plantCount || 0, color: '#16a34a' },
              { label: '🥣 Thức ăn cá cảnh', count: stats.products?.foodCount || 0, color: '#f59e0b' },
              { label: '📦 Hồ kính & Phụ kiện', count: stats.products?.accessoryCount || 0, color: '#8b5cf6' },
            ].map((cat) => {
              const totalPrd = stats.products?.total || 1;
              const pct = stats.products?.total > 0 ? Math.round((cat.count / totalPrd) * 100) : 0;
              return (
                <div key={cat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{cat.label}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      {cat.count} loại ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2 Bảng Dữ Liệu Lớn: 5 Đơn Hàng Mới Nhất & Top Sản Phẩm Bán Chạy */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Bảng 1: 5 Đơn hàng mới nhất cần xử lý */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                5 Đơn Hàng Mới Nhất
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Đơn đặt gần đây cần duyệt &amp; đóng gói</span>
            </div>
            <Link
              to="/admin/orders"
              style={{ fontSize: '0.8125rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
            >
              Xem tất cả →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Chưa có đơn hàng nào được ghi nhận.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#0284c7' }}>{ord.orderCode}</strong>
                      <span style={{ fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                        {ord.customerName}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {ord.itemCount} sản phẩm • {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(ord.totalAmount)}
                      </div>
                      <div style={{ marginTop: '0.15rem' }}>{renderStatusBadge(ord.status)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bảng 2: Top 5 Sản phẩm bán chạy nhất */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Top 5 Cá Cảnh &amp; Thủy Sinh Bán Chạy
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Xếp hạng theo số lượng và doanh thu mang lại</span>
            </div>
            <Link
              to="/admin/products"
              style={{ fontSize: '0.8125rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
            >
              Quản lý kho →
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Chưa có dữ liệu bán chạy.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {topProducts.map((prod, idx) => (
                <div
                  key={prod._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {/* Badge Thứ hạng #1, #2... */}
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f1f5f9',
                        color: idx === 0 ? '#854d0e' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Đơn giá: {formatCurrency(prod.price)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>
                      Đã bán: {prod.soldQuantity || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Thu về: {formatCurrency(prod.totalRevenue || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bảng Cá cảnh & Sản phẩm cần lưu ý (Tồn kho ít) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Cảnh Báo Cá Cảnh &amp; Sản Phẩm Tồn Kho Ít (&le; 5 món)
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cần chuẩn bị kế hoạch dưỡng hoặc nhập đợt cá mới</span>
          </div>
          <Link
            to="/admin/products?maxStock=5"
            style={{ fontSize: '0.8125rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
          >
            Quản lý cá cảnh →
          </Link>
        </div>

        {lowStockTotal === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#16a34a', fontSize: '0.875rem' }}>
            ✓ Tất cả các dòng cá và sản phẩm đều đang duy trì mức tồn kho dồi dào!
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({item.origin || 'Đà Nẵng'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: item.stock === 0 ? '#fef2f2' : '#fffbeb',
                        color: item.stock === 0 ? '#dc2626' : '#b45309',
                      }}
                    >
                      Tồn: {item.stock}
                    </span>
                    <Link
                      to="/admin/products"
                      style={{
                        fontSize: '0.75rem',
                        color: '#0284c7',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Cập nhật
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <Pagination
                currentPage={lowStockPage}
                totalItems={lowStockTotal}
                pageSize={lowStockPageSize}
                onPageChange={setLowStockPage}
                onPageSizeChange={(size) => {
                  setLowStockPageSize(size);
                  setLowStockPage(1);
                }}
                itemLabel="sản phẩm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
