import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, RefreshCw, ShoppingBag, Truck, User, XCircle, Star, RotateCcw, Package } from 'lucide-react';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderCode } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import { useCart } from '../../cart/hooks/useCart.jsx';

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
  const [reviewSelectOrder, setReviewSelectOrder] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart() || {};

  const handleReviewOrder = (order) => {
    if (!order.items || order.items.length === 0) return;
    if (order.items.length === 1) {
      const item = order.items[0];
      const targetSlug = item.product?.slug || item.slug || item.product?._id || item.product;
      navigate(`/products/${targetSlug}#customer-reviews`);
      return;
    }
    setReviewSelectOrder(order);
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      navigate('/products');
      return;
    }
    order.items.forEach((item) => {
      const prod = item.product && typeof item.product === 'object'
        ? item.product
        : {
            _id: item.product || item._id,
            name: item.name,
            price: item.price,
            images: item.image ? [item.image] : [],
          };
      if (addToCart) {
        addToCart(
          {
            _id: prod._id || item.product || item._id,
            name: item.name || prod.name,
            price: item.price || prod.price,
            images: prod.images || (item.image ? [item.image] : []),
            slug: prod.slug || item.slug || '',
          },
          item.quantity || 1
        );
      }
    });
    navigate('/cart');
  };

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
    const orderCode = formatOrderCode(order._id);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.85rem',
              border: '1px solid #dbe3eb',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <User size={16} /> Hồ sơ tài khoản
          </Link>
          <button className="my-orders-refresh" type="button" onClick={loadOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'my-orders-spinning' : ''} /> Làm mới
          </button>
        </div>
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
                    <div><span className="my-order-label">MÃ ĐƠN HÀNG</span><strong>#{formatOrderCode(order._id)}</strong></div>
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
                              : effectivePaymentStatus === 'failed' ? <span>Thanh toán trong 24h nếu không sẽ hủy đơn. Hãy quét mã bên cạnh để chuyển khoản lại đúng số tiền và nội dung trước hạn.</span>
                                : <span style={{ color: '#b45309', fontWeight: 600 }}>⚠️ Thanh toán trong 24h nếu không sẽ hủy đơn. Hoàn tất chuyển khoản trước hạn để cửa hàng xác nhận đơn hàng.</span>}
                        {['pending', 'failed'].includes(effectivePaymentStatus) && (
                          <div className="my-order-payment-deadline">
                            <span style={{ color: '#d97706', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                              ⚠️ Thanh toán trong 24h nếu không sẽ hủy đơn
                            </span>
                            {paymentDeadline ? <><span>Hạn thanh toán: <strong>{formatOrderDate(paymentDeadline)}</strong></span><span>{paymentTimeLeft > 0 ? `Còn ${Math.floor(paymentTimeLeft / 3_600_000)} giờ ${Math.floor((paymentTimeLeft % 3_600_000) / 60_000)} phút` : 'Đã hết thời hạn thanh toán'}</span></> : <span>Đơn này chưa lưu hạn thanh toán; vui lòng liên hệ cửa hàng.</span>}
                          </div>
                        )}
                      </div>
                      {['pending', 'failed'].includes(effectivePaymentStatus) && (
                        paymentConfig?.bankBin && paymentConfig?.accountNumber ? (
                          <div className="my-order-repayment">
                            <img
                              src={`https://img.vietqr.io/image/${encodeURIComponent(paymentConfig.bankBin)}-${encodeURIComponent(paymentConfig.accountNumber)}-compact2.svg?amount=${encodeURIComponent(order.totalAmount)}&addInfo=${encodeURIComponent(`AQUA${formatOrderCode(order._id)}`)}&accountName=${encodeURIComponent(paymentConfig.accountName || '')}`}
                              alt={`QR thanh toán lại qua ${paymentConfig.bankName || 'ngân hàng'}`}
                            />
                            <div><strong>{paymentConfig.bankName} · {paymentConfig.accountNumber}</strong><span>{paymentConfig.accountName}</span><span>Số tiền: {formatCurrency(order.totalAmount || 0)}</span><span>Nội dung: <b>{`AQUA${formatOrderCode(order._id)}`}</b></span></div>
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
                    {order.items?.map((item, index) => {
                      const itemImg = item.image || item.product?.images?.[0] || item.product?.image;
                      return (
                        <div className="my-order-item" key={`${item.product || item.name}-${index}`}>
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={item.name}
                              style={{
                                width: '42px',
                                height: '42px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="my-order-product-icon"><ShoppingBag size={18} /></div>
                          )}
                          <div className="my-order-product-info">
                            <strong>{item.name || 'Sản phẩm'}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2px' }}>
                              <span>Số lượng: {item.quantity || 1}</span>
                              {order.status === 'delivered' && (
                                <Link
                                  to={`/products/${item.product?.slug || item.slug || item.product?._id || item.product}#customer-reviews`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#b45309',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Star size={11} fill="#eab308" color="#ca8a04" />
                                  Đánh giá
                                </Link>
                              )}
                            </div>
                          </div>
                          <strong className="my-order-item-price">{formatCurrency((item.price || 0) * (item.quantity || 1))}</strong>
                        </div>
                      );
                    })}
                  </div>
                  <div className="my-order-total"><span>Tổng thanh toán</span><strong>{formatCurrency(order.totalAmount || 0)}</strong></div>
                  <footer className="my-order-shipping" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span>Địa chỉ: {order.shippingAddress}</span>
                      <span>Điện thoại: {order.phoneNumber}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {order.status === 'pending' && (
                        <button className="my-order-cancel-button" type="button" disabled={cancellingOrderId === order._id} onClick={() => handleCancelOrder(order)}>
                          {cancellingOrderId === order._id ? 'Đang hủy…' : 'Hủy đơn hàng'}
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          type="button"
                          onClick={() => handleReviewOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#854d0e',
                            backgroundColor: '#fef9c3',
                            border: '1px solid #fde047',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Star size={14} fill="#eab308" color="#ca8a04" />
                          Đánh giá
                        </button>
                      )}

                      {order.status === 'delivered' ? (
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#0284c7',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={14} />
                          Mua lại
                        </button>
                      ) : order.status !== 'pending' && (
                        <Link
                          to="/products"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#0284c7',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          Mua thêm
                        </Link>
                      )}
                    </div>
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

      {/* Modal chọn sản phẩm để đánh giá khi đơn hàng có nhiều sản phẩm */}
      {reviewSelectOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setReviewSelectOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Chọn sản phẩm bạn muốn đánh giá
              </h3>
              <button
                type="button"
                onClick={() => setReviewSelectOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {reviewSelectOrder.items?.map((item, idx) => {
                const itemSlug = item.product?.slug || item.slug || item.product?._id || item.product;
                const itemImg = item.image || item.product?.images?.[0] || item.product?.image;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ width: '42px', height: '42px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="#94a3b8" />
                        </div>
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSelectOrder(null);
                        navigate(`/products/${itemSlug}#customer-reviews`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#854d0e',
                        backgroundColor: '#fef9c3',
                        border: '1px solid #fde047',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Star size={13} fill="#eab308" color="#ca8a04" />
                      Đánh giá
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
