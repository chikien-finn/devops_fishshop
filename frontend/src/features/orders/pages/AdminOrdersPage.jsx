import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, RefreshCw, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';
import orderService from '../services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#92400e', icon: Clock },
  confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1e40af', icon: CheckCircle2 },
  shipping: { label: 'Đang giao', bg: '#e0e7ff', color: '#3730a3', icon: Truck },
  delivered: { label: 'Đã giao', bg: '#d1fae5', color: '#065f46', icon: PackageCheck },
  cancelled: { label: 'Đã hủy', bg: '#fee2e2', color: '#991b1b', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || 'Thử lại sau'));
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
                <th style={{ padding: '0.85rem 1rem' }}>Cập nhật</th>
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
                      <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '220px' }}>{order.shippingAddress}</div>
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
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.5rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
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
    </div>
  );
}

