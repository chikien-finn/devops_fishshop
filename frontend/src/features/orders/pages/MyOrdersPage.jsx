import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, RefreshCw, ShoppingBag, Truck, XCircle } from 'lucide-react';
import orderService from '../services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';
import { useAuth } from '../../auth/hooks/useAuth.jsx';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS = {
  pending: { label: 'Chờ xác nhận', icon: Clock3, color: '#a16207', background: '#fef9c3' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle2, color: '#1d4ed8', background: '#dbeafe' },
  shipping: { label: 'Đang giao', icon: Truck, color: '#6d28d9', background: '#ede9fe' },
  delivered: { label: 'Đã giao', icon: PackageCheck, color: '#047857', background: '#d1fae5' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: '#b91c1c', background: '#fee2e2' },
};
const PAYMENT_STATUS = { pending: 'Chờ bạn thanh toán', paid: 'Đã thanh toán', failed: 'Thanh toán chưa thành công', refunded: 'Đã hoàn tiền', unpaid: 'Chưa thanh toán', expired: 'Đã hết hạn thanh toán' };
const TRACKING_STEPS = [
  { value: 'pending', label: 'Đã đặt hàng' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
];

const formatOrderDate = (date) => date
  ? new Date(date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';
const formatDeliveryDate = (date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function MyOrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [cancelErrors, setCancelErrors] = useState({});
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentConfigError, setPaymentConfigError] = useState('');
  const [paymentConfigRequested, setPaymentConfigRequested] = useState(false);
  const [now, setNow] = useState(Date.now());
  const needsBankTransfer = orders.some((order) => order.paymentMethod === 'banking' && ['pending', 'failed'].includes(order.paymentStatus || 'pending'));

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const result = await orderService.getMyOrders({ page, limit: pageSize, status: filter });
      setOrders(result.items);
      setTotalItems(result.pagination.totalItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated, page, pageSize]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!needsBankTransfer || paymentConfigRequested) return;
    let active = true;
    setPaymentConfigRequested(true);
    orderService.getPaymentConfig()
      .then((config) => { if (active) { setPaymentConfig(config); setPaymentConfigError(''); } })
      .catch(() => { if (active) setPaymentConfigError('Không tải được thông tin chuyển khoản. Vui lòng tải lại trang.'); });
    return () => { active = false; };
  }, [needsBankTransfer, paymentConfigRequested]);

  const handleCancelOrder = async (order) => {
    const orderCode = order._id?.slice(-8).toUpperCase();
    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${orderCode}?`)) return;
    setCancellingOrderId(order._id);
    setCancelErrors((current) => ({ ...current, [order._id]: '' }));
    try {
      const updatedOrder = await orderService.cancelMyOrder(order._id);
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status: updatedOrder.status } : item));
      if (filter === 'pending') await loadOrders();
    } catch (err) {
      setCancelErrors((current) => ({
        ...current,
        [order._id]: err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng tải lại và thử lại.',
      }));
    } finally {
      setCancellingOrderId('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') loadOrders();
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [isAuthenticated, loadOrders]);

  if (authLoading) return <div className="my-orders-message">Đang kiểm tra tài khoản…</div>;
  if (!isAuthenticated) {
    return (
      <section className="my-orders-empty">
        <ShoppingBag size={42} />
        <h1>Đăng nhập để xem đơn hàng</h1>
        <p>Lịch sử mua hàng được lưu theo tài khoản của bạn.</p>
        <Link className="my-orders-primary" to="/login">Đăng nhập <ArrowRight size={16} /></Link>
      </section>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-heading">
        <div>
          <span className="my-orders-eyebrow">TÀI KHOẢN CỦA BẠN</span>
          <h1>Lịch sử đơn hàng</h1>
          <p>Theo dõi trạng thái và xem lại các đơn hàng bạn đã đặt. Trạng thái do cửa hàng cập nhật; trang tự làm mới mỗi 30 giây.</p>
        </div>
        <button className="my-orders-refresh" type="button" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'my-orders-spinning' : ''} /> Làm mới
        </button>
      </div>

      <div className="my-orders-tabs" role="tablist" aria-label="Lọc đơn hàng theo trạng thái">
        {FILTERS.map(({ value, label }) => (
          <button key={value} type="button" role="tab" aria-selected={filter === value}
            className={filter === value ? 'active' : ''}
            onClick={() => { setFilter(value); setPage(1); }}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="my-orders-error" role="alert"><span>{error}</span><button type="button" onClick={loadOrders}>Thử lại</button></div>}
      {loading ? <div className="my-orders-message">Đang tải đơn hàng…</div> : !error && orders.length === 0 ? (
        <section className="my-orders-empty">
          <ShoppingBag size={42} />
          <h2>{filter === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng ở trạng thái này'}</h2>
          <p>Đơn hàng của bạn sẽ được hiển thị tại đây sau khi đặt hàng.</p>
          <Link className="my-orders-primary" to="/products">Khám phá sản phẩm <ArrowRight size={16} /></Link>
        </section>
      ) : !error && (
        <>
          <div className="my-orders-list">
            {orders.map((order) => {
              const status = STATUS[order.status] || STATUS.pending;
              const StatusIcon = status.icon;
              const paymentDeadline = order.paymentMethod === 'banking' && order.paymentExpiresAt
                ? new Date(order.paymentExpiresAt)
                : null;
              const paymentTimeLeft = paymentDeadline ? paymentDeadline.getTime() - now : null;
              const paymentExpired = order.paymentStatus === 'expired'
                || (paymentDeadline && ['pending', 'failed'].includes(order.paymentStatus || 'pending') && paymentTimeLeft <= 0);
              const effectivePaymentStatus = paymentExpired ? 'expired' : (order.paymentStatus || 'pending');
              const deliveryEstimate = (() => {
                if (order.status === 'cancelled') return '';
                if (order.status === 'delivered') return 'Đơn hàng đã được giao.';
                if (order.paymentMethod === 'banking' && order.paymentStatus !== 'paid') return 'Dự kiến 24–48 giờ sau khi cửa hàng xác nhận thanh toán.';
                const baseDate = new Date(
                  (order.paymentMethod === 'banking' && order.paymentPaidAt)
                    || ((order.status === 'confirmed' || order.status === 'shipping') && order.statusUpdatedAt)
                    || order.createdAt
                );
                const startDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
                const endDate = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
                return `${formatOrderDate(startDate)} – ${formatOrderDate(endDate)}`;
              })();
              return (
                <article className="my-order-card" key={order._id}>
                  <header className="my-order-header">
                    <div><span className="my-order-label">MÃ ĐƠN HÀNG</span><strong>#{order._id?.slice(-8).toUpperCase()}</strong></div>
                    <span className="my-order-status" style={{ color: status.color, backgroundColor: status.background }}><StatusIcon size={15} />{status.label}</span>
                  </header>
                  <div className="my-order-meta">
                    <span>Đặt ngày {formatOrderDate(order.createdAt)}</span>
                    <span>{order.items?.length || 0} sản phẩm</span>
                    <span>{order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</span>
                  </div>
                  {order.paymentMethod === 'banking' && (
                    <section className={`my-order-payment my-order-payment-${effectivePaymentStatus}`} aria-label="Trạng thái thanh toán">
                      <div className="my-order-payment-copy">
                        <strong>{PAYMENT_STATUS[effectivePaymentStatus] || 'Chờ bạn thanh toán'}</strong>
                        {effectivePaymentStatus === 'paid' ? <span>Cửa hàng đã xác nhận giao dịch của bạn.</span>
                          : effectivePaymentStatus === 'refunded' ? <span>Khoản thanh toán đã được cửa hàng hoàn lại.</span>
                            : effectivePaymentStatus === 'expired' ? <span>Thời hạn 24 giờ đã kết thúc. Vui lòng liên hệ cửa hàng trước khi chuyển khoản; nếu đã chuyển, hãy gửi mã đơn để được đối soát.</span>
                              : effectivePaymentStatus === 'failed' ? <span>Hãy quét mã bên cạnh để chuyển khoản lại đúng số tiền và nội dung trước hạn.</span>
                                : <span>Hoàn tất chuyển khoản trước hạn để cửa hàng xác nhận đơn hàng.</span>}
                        {['pending', 'failed'].includes(effectivePaymentStatus) && (
                          <div className="my-order-payment-deadline">
                            {paymentDeadline ? <><span>Hạn thanh toán: <strong>{formatOrderDate(paymentDeadline)}</strong></span><span>{paymentTimeLeft > 0 ? `Còn ${Math.floor(paymentTimeLeft / 3_600_000)} giờ ${Math.floor((paymentTimeLeft % 3_600_000) / 60_000)} phút` : 'Đã hết thời hạn thanh toán'}</span></> : <span>Đơn này chưa lưu hạn thanh toán; vui lòng liên hệ cửa hàng.</span>}
                          </div>
                        )}
                      </div>
                      {['pending', 'failed'].includes(effectivePaymentStatus) && (
                        paymentConfig?.bankBin && paymentConfig?.accountNumber ? (
                          <div className="my-order-repayment">
                            <img
                              src={`https://img.vietqr.io/image/${encodeURIComponent(paymentConfig.bankBin)}-${encodeURIComponent(paymentConfig.accountNumber)}-compact2.svg?amount=${encodeURIComponent(order.totalAmount)}&addInfo=${encodeURIComponent(`AQUA${order._id?.slice(-8).toUpperCase()}`)}&accountName=${encodeURIComponent(paymentConfig.accountName || '')}`}
                              alt={`QR thanh toán lại qua ${paymentConfig.bankName || 'ngân hàng'}`}
                            />
                            <div><strong>{paymentConfig.bankName} · {paymentConfig.accountNumber}</strong><span>{paymentConfig.accountName}</span><span>Số tiền: {formatCurrency(order.totalAmount || 0)}</span><span>Nội dung: <b>{`AQUA${order._id?.slice(-8).toUpperCase()}`}</b></span></div>
                          </div>
                        ) : <span className="my-order-payment-error">{paymentConfigError || 'Đang tải thông tin thanh toán…'}</span>
                      )}
                    </section>
                  )}
                  {order.status === 'cancelled' ? (
                    <div className="my-order-cancelled"><XCircle size={17} /> Đơn hàng đã được hủy</div>
                  ) : (
                    <div className="my-order-tracking" aria-label={`Tiến trình đơn hàng: ${status.label}`}>
                      {TRACKING_STEPS.map((step, stepIndex) => {
                        const currentIndex = TRACKING_STEPS.findIndex((entry) => entry.value === order.status);
                        const done = stepIndex <= Math.max(0, currentIndex);
                        return (
                          <div className={`my-order-tracking-step${done ? ' is-done' : ''}`} key={step.value}>
                            <span className="my-order-tracking-dot">{done ? <CheckCircle2 size={16} /> : <span />}</span>
                            <span>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {deliveryEstimate && <div className="my-order-delivery-estimate"><Truck size={18} /><div><strong>Thời gian giao dự kiến</strong><span>{deliveryEstimate}</span></div></div>}
                  <div className="my-order-items">
                    {order.items?.map((item, index) => (
                      <div className="my-order-item" key={`${item.product || item.name}-${index}`}>
                        <div className="my-order-product-icon"><ShoppingBag size={18} /></div>
                        <div className="my-order-product-info"><strong>{item.name || 'Sản phẩm'}</strong><span>Số lượng: {item.quantity || 1}</span></div>
                        <strong className="my-order-item-price">{formatCurrency((item.price || 0) * (item.quantity || 1))}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="my-order-total"><span>Tổng thanh toán</span><strong>{formatCurrency(order.totalAmount || 0)}</strong></div>
                  <footer className="my-order-shipping">
                    <span>Địa chỉ: {order.shippingAddress}</span>
                    <span>Điện thoại: {order.phoneNumber}</span>
                    {order.status === 'pending' && (
                      <button className="my-order-cancel-button" type="button" disabled={cancellingOrderId === order._id} onClick={() => handleCancelOrder(order)}>
                        {cancellingOrderId === order._id ? 'Đang hủy…' : 'Hủy đơn hàng'}
                      </button>
                    )}
                    {cancelErrors[order._id] && <span className="my-order-cancel-error" role="alert">{cancelErrors[order._id]}</span>}
                  </footer>
                </article>
              );
            })}
          </div>
          <Pagination currentPage={page} totalItems={totalItems} pageSize={pageSize}
            onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="đơn hàng" />
        </>
      )}
    </div>
  );
}
