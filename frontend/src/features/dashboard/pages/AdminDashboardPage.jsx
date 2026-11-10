import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Fish,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Droplets,
  RefreshCw,
  Plus,
} from 'lucide-react';
import productService, { isRequestCanceled } from '../../products/services/productService.js';
import orderService from '../../orders/services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

const EMPTY_STATS = {
  total: 0,
  fishCount: 0,
  plantCount: 0,
  foodCount: 0,
  otherCount: 0,
  totalStock: 0,
  totalInventoryValue: 0,
  freshwaterCount: 0,
  saltwaterCount: 0,
  lowStockCount: 0,
};

const EMPTY_ORDER_STATS = {
  totalOrders: 0,
  pendingCount: 0,
  confirmedCount: 0,
  shippingCount: 0,
  deliveredCount: 0,
  cancelledCount: 0,
  totalRevenue: 0,
  deliveredRevenue: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [orderStats, setOrderStats] = useState(EMPTY_ORDER_STATS);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockTotal, setLowStockTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockPageSize, setLowStockPageSize] = useState(10);

  const fetchStatsData = useCallback(async (signal) => {
    try {
      const [data, ordStats] = await Promise.all([
        productService.getProductStats({ signal }),
        orderService.getOrderStats({ signal }).catch(() => EMPTY_ORDER_STATS),
      ]);
      setStats({
        total: data.total || 0,
        fishCount: data.fish || 0,
        plantCount: data.plant || 0,
        foodCount: data.food || 0,
        otherCount: data.accessory || 0,
        totalStock: data.totalStock || 0,
        totalInventoryValue: data.totalInventoryValue || 0,
        freshwaterCount: data.freshwaterCount || 0,
        saltwaterCount: data.saltwaterCount || 0,
        lowStockCount: data.lowStockCount || 0,
      });
      setOrderStats({
        totalOrders: ordStats.totalOrders || 0,
        pendingCount: ordStats.pendingCount || 0,
        confirmedCount: ordStats.confirmedCount || 0,
        shippingCount: ordStats.shippingCount || 0,
        deliveredCount: ordStats.deliveredCount || 0,
        cancelledCount: ordStats.cancelledCount || 0,
        totalRevenue: ordStats.totalRevenue || 0,
        deliveredRevenue: ordStats.deliveredRevenue || 0,
      });
    } catch (err) {
      if (!isRequestCanceled(err)) {
        console.error('Error fetching dashboard stats:', err);
      }
    }
  }, []);

  const fetchLowStockData = useCallback(
    async ({ signal, useCache = true } = {}) => {
      try {
        setLoading(true);
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
        setLowStockItems(res.items);
        setLowStockTotal(res.pagination.totalItems);
        setLoading(false);
      } catch (err) {
        if (isRequestCanceled(err)) return;
        console.error('Error fetching low stock items:', err);
        setLoading(false);
      }
    },
    [lowStockPage, lowStockPageSize]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchStatsData(controller.signal);
    return () => controller.abort();
  }, [fetchStatsData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLowStockData({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchLowStockData]);

  const fetchDashboardData = () => {
    fetchStatsData();
    fetchLowStockData({ useCache: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            Bảng Điều Khiển Tổng Quan (Dashboard)
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Theo dõi tổng thể hệ thống AquaCraft, tồn kho các dòng cá cảnh, giá trị hàng hóa và đơn hàng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
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
            <span>Làm mới số liệu</span>
          </button>

          <Link
            to="/admin/products?category=fish"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Fish size={16} />
            <span>Xem quản lý cá cảnh</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row - White Theme with Crisp Borders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng loại cá cảnh
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Fish size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.fishCount} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>giống cá</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#0284c7', marginTop: '0.35rem' }}>
            Betta, Dĩa, Nemo, Neon...
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng số lượng tồn kho
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.totalStock} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>cá & món</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#16a34a', marginTop: '0.35rem' }}>
            Sẵn sàng giao cho khách
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Giá trị kho hàng ước tính
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {formatCurrency(stats.totalInventoryValue)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.35rem' }}>
            Tính theo đơn giá niêm yết
          </div>
        </div>

        {/* Card 4 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Cảnh báo tồn kho ít
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: stats.lowStockCount > 0 ? '#fef2f2' : '#f0fdf4',
                color: stats.lowStockCount > 0 ? '#dc2626' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: stats.lowStockCount > 0 ? '#dc2626' : '#16a34a',
              marginTop: '0.5rem',
            }}
          >
            {stats.lowStockCount}{' '}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>mục cần chú ý</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.35rem' }}>
            {stats.lowStockCount > 0 ? 'Cần nhập thêm đợt mới' : 'Kho hàng dồi dào'}
          </div>
        </div>
      </div>

      {/* Order & Revenue Overview Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} color="#0284c7" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Thống Kê Đơn Hàng & Doanh Thu
            </h2>
          </div>
          <Link
            to="/admin/orders"
            style={{ fontSize: '0.8125rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
          >
            Xem tất cả đơn hàng →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.875rem' }}>
          <div style={{ padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TỔNG ĐƠN HÀNG</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
              {orderStats.totalOrders.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.2rem' }}>
              Chờ duyệt: {orderStats.pendingCount.toLocaleString()} | Đang giao: {orderStats.shippingCount.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>ĐÃ GIAO THÀNH CÔNG</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
              {orderStats.deliveredCount.toLocaleString()} đơn
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.2rem' }}>
              Đã xác nhận: {orderStats.confirmedCount.toLocaleString()} đơn
            </div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>DOANH THU ĐÃ GIAO</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>
              {formatCurrency(orderStats.deliveredRevenue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
              Đơn hoàn thành
            </div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#faf5ff', borderRadius: '4px', border: '1px solid #e9d5ff' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8' }}>TỔNG GIÁ TRỊ ĐƠN (TRỪ HỦY)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9333ea', marginTop: '0.25rem' }}>
              {formatCurrency(orderStats.totalRevenue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Đơn đã hủy: {orderStats.cancelledCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Phân bố danh mục & Cảnh báo tồn */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Phân bố danh mục */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Phân Bố Cơ Cấu Danh Mục
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Fish */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>🐠 Cá cảnh các loại</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>
                    {stats.fishCount} mục ({stats.total > 0 ? Math.round((stats.fishCount / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.total > 0 ? (stats.fishCount / stats.total) * 100 : 0}%`,
                      backgroundColor: '#0284c7',
                    }}
                  />
                </div>
              </div>

              {/* Plants */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>🌿 Cây thủy sinh</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>
                    {stats.plantCount} mục ({stats.total > 0 ? Math.round((stats.plantCount / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.total > 0 ? (stats.plantCount / stats.total) * 100 : 0}%`,
                      backgroundColor: '#16a34a',
                    }}
                  />
                </div>
              </div>

              {/* Food */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>🥣 Thức ăn & Dinh dưỡng</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    {stats.foodCount} mục ({stats.total > 0 ? Math.round((stats.foodCount / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.total > 0 ? (stats.foodCount / stats.total) * 100 : 0}%`,
                      backgroundColor: '#f59e0b',
                    }}
                  />
                </div>
              </div>

              {/* Tanks & Accessories */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>📦 Hồ kính & Phụ kiện</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
                    {stats.otherCount} mục ({stats.total > 0 ? Math.round((stats.otherCount / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.total > 0 ? (stats.otherCount / stats.total) * 100 : 0}%`,
                      backgroundColor: '#8b5cf6',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Danh sách cần lưu ý */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Cá Cảnh & Sản Phẩm Cần Lưu Ý
              </h2>
              <Link
                to="/admin/products?category=fish"
                style={{ fontSize: '0.8125rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
              >
                Xem chi tiết →
              </Link>
            </div>

            {lowStockTotal === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Tất cả các dòng cá và sản phẩm đều đang duy trì mức tồn kho tốt!
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
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({item.origin})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
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
                <div style={{ marginTop: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
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

        {/* Right Column: Lối tắt & Thông số nước */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Lối tắt quản trị */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Lối Tắt Thao Tác Nhanh
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/admin/products?category=fish"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#0f172a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Fish size={18} color="#0284c7" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quản lý Cá cảnh</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chỉ hiển thị dữ liệu cá, lọc và giá bán</div>
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/admin/products?action=create"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#0f172a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Plus size={18} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Thêm cá cảnh mới</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Nhập giống cá, đặc tính và giá nhập/bán</div>
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/admin/orders"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#0f172a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ShoppingBag size={18} color="#d97706" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quản lý Đơn hàng</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Xử lý giao cá sống và thủy sinh</div>
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/admin/users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#0f172a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Users size={18} color="#6366f1" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Tài khoản & Khách hàng</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Xem danh sách tài khoản mua hàng</div>
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>
            </div>
          </div>

          {/* Card: Hệ sinh thái Nước ngọt vs Nước mặn */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Hệ Sinh Thái Môi Trường Nước
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Droplets size={14} />
                  <span>Nước ngọt</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14532d', marginTop: '0.25rem' }}>
                  {stats.freshwaterCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.2rem' }}>
                  Hồ thủy sinh & cá nước ngọt
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '4px',
                  border: '1px solid #bfdbfe',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1d4ed8', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Droplets size={14} />
                  <span>Nước mặn (Biển)</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  {stats.saltwaterCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.2rem' }}>
                  Cá hề, san hô & cá biển
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

