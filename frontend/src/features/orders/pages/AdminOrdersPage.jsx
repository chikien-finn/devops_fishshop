import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, RefreshCw, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';
import orderService from '../services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#92400e', border: '#fde68a', icon: Clock },
  confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', icon: CheckCircle2 },
  shipping: { label: 'Đang giao', bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe', icon: Truck },
  delivered: { label: 'Đã giao', bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', icon: PackageCheck },
  cancelled: { label: 'Đã hủy', bg: '#fee2e2', color: '#991b1b', border: '#fecaca', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderService.getAllOrders({
        page: currentPage,
        limit: pageSize,
      });
      setOrders(res.items);
      setTotalItems(res.pagination.totalItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      const confirmed = window.confirm('Xác nhận HỦY đơn hàng này? Thao tác này sẽ cập nhật trạng thái đơn thành Đã Hủy.');
      if (!confirmed) return;
    }
    try {
      setError('');
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o))
      );
      setToast('Cập nhật trạng thái đơn hàng thành công!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || 'Thử lại sau'));
    }
  };

  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      const updated = await orderService.updatePaymentStatus(orderId, paymentStatus);
      setOrders((prev) => prev.map((order) => order._id === orderId ? { ...order, paymentStatus: updated.paymentStatus } : order));
    } catch (err) {
      alert('Lỗi cập nhật thanh toán: ' + (err.response?.data?.message || 'Vui lòng thử lại.'));
      fetchOrders();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={24} color="#0284c7" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Quản Lý Đơn Đặt Hàng ({totalItems})
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Theo dõi và cập nhật trạng thái đơn hàng từ khách hàng
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Đang tải dữ liệu đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Chưa có đơn hàng nào trong hệ thống.
          </div>
        ) : (
          <>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Mã Đơn</th>
                <th style={{ padding: '0.85rem 1rem' }}>Khách hàng</th>
                <th style={{ padding: '0.85rem 1rem' }}>Sản phẩm</th>
                <th style={{ padding: '0.85rem 1rem' }}>Tổng tiền</th>
                <th style={{ padding: '0.85rem 1rem' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                return (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      #{order._id.slice(-6).toUpperCase()}
                      <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{order.user?.name || 'Khách hàng'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{order.phoneNumber}</div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          maxWidth: '240px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.35,
                        }}
                        title={order.shippingAddress}
                      >
                        {order.shippingAddress}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                          • {item.name} <strong>x{item.quantity}</strong>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#dc2626' }}>
                      {formatCurrency(order.totalAmount)}
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                        {order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'COD'}
                      </div>
                      {order.paymentMethod === 'banking' && (
                        <select
                          aria-label="Trạng thái thanh toán"
                          value={order.paymentStatus || 'pending'}
                          onChange={(event) => handlePaymentStatusChange(order._id, event.target.value)}
                          style={{ marginTop: '0.35rem', maxWidth: '140px', padding: '0.3rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', background: '#fff' }}
                        >
                          <option value="pending">Chờ thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="failed">Thanh toán lỗi</option>
                          <option value="refunded">Đã hoàn tiền</option>
                          <option value="expired">Hết hạn thanh toán</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border || '#cbd5e1'}`,
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        title="Bấm để cập nhật trạng thái đơn hàng"
                      >
                        <option value="pending" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Chờ xác nhận</option>
                        <option value="confirmed" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Đã xác nhận</option>
                        <option value="shipping" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Đang giao</option>
                        <option value="delivered" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Đã giao</option>
                        <option value="cancelled" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Đã hủy</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="đơn hàng"
          />
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

