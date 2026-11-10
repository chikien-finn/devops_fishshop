import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import userService from '../services/userService.js';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import { formatDate } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

export default function AdminUserManagePage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal actions
  const [roleModal, setRoleModal] = useState({ open: false, user: null, targetRole: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const customerCount = users.filter((u) => u.role === 'user').length;
    const withPhoneCount = users.filter((u) => u.phone && u.phone.trim()).length;
    return { total, adminCount, customerCount, withPhoneCount };
  }, [users]);

  // Đổi role
  const handleConfirmRoleChange = async () => {
    if (!roleModal.user) return;
    try {
      setProcessing(true);
      const updated = await userService.updateUserRole(roleModal.user._id, roleModal.targetRole);
      setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
      setFeedback({
        type: 'success',
        message: `Đã đổi quyền của "${updated.name}" thành ${
          updated.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (User)'
        }.`,
      });
      setRoleModal({ open: false, user: null, targetRole: '' });
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật quyền'));
    } finally {
      setProcessing(false);
    }
  };

  // Xóa user
  const handleConfirmDelete = async () => {
    if (!deleteModal.user) return;
    try {
      setProcessing(true);
      const targetId = deleteModal.user._id;
      await userService.deleteUser(targetId);
      setUsers(users.filter((u) => u._id !== targetId));
      setFeedback({
        type: 'success',
        message: `Đã xóa tài khoản "${deleteModal.user.name}" khỏi hệ thống.`,
      });
      setDeleteModal({ open: false, user: null });
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa người dùng'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Feedback Banner */}
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

      {/* Header */}
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
            Quản Lý Khách Hàng & Người Dùng
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Xem danh sách tài khoản đã đăng ký, thông tin giao nhận và phân quyền quản trị.
          </p>
        </div>

        <button
          onClick={fetchUsers}
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
      </div>

      {/* KPI Cards Row - White Theme with Crisp Borders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Tổng số tài khoản
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>
            Đã đăng ký trong hệ thống
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Khách mua hàng
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
            {stats.customerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Quyền Khách hàng (User)
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Quản trị viên (Admin)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#9333ea', marginTop: '0.25rem' }}>
            {stats.adminCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Có toàn quyền quản trị
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Có số điện thoại
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {stats.withPhoneCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Sẵn sàng liên hệ giao cá
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
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
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all">Tất cả phân quyền</option>
            <option value="user">Khách hàng (User)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>

        {(searchTerm || roleFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
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

      {/* Users Data Table */}
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
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Họ tên & Email</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '140px' }}>Phân quyền</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '140px' }}>Số điện thoại</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Địa chỉ nhận hàng</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '130px' }}>Ngày tạo</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', width: '160px', textAlign: 'right' }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={24} className="animate-spin" color="#0284c7" />
                      <span>Đang nạp danh sách tài khoản...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={24} />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={32} color="#cbd5e1" />
                      <span>Không tìm thấy tài khoản nào khớp với bộ lọc.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isCurrentAdmin = u._id === currentAdmin?._id || u.email === currentAdmin?.email;
                  return (
                    <tr
                      key={u._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.1s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbfcfe')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '4px',
                              backgroundColor: u.role === 'admin' ? '#faf5ff' : '#eff6ff',
                              color: u.role === 'admin' ? '#9333ea' : '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              border: `1px solid ${u.role === 'admin' ? '#e9d5ff' : '#bfdbfe'}`,
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {u.name} {isCurrentAdmin && <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>(Bạn)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: u.role === 'admin' ? '#ecfdf5' : '#f8fafc',
                            color: u.role === 'admin' ? '#059669' : '#475569',
                            border: `1px solid ${u.role === 'admin' ? '#a7f3d0' : '#e2e8f0'}`,
                          }}
                        >
                          <Shield size={12} />
                          {u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </span>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '0.75rem 1rem', color: u.phone ? '#0f172a' : '#94a3b8' }}>
                        {u.phone || 'Chưa cập nhật'}
                      </td>

                      {/* Address */}
                      <td style={{ padding: '0.75rem 1rem', color: u.address ? '#334155' : '#94a3b8' }}>
                        <div
                          style={{
                            maxWidth: '260px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {u.address || 'Chưa cập nhật'}
                        </div>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {/* Đổi quyền */}
                          <button
                            disabled={isCurrentAdmin}
                            onClick={() =>
                              setRoleModal({
                                open: true,
                                user: u,
                                targetRole: u.role === 'admin' ? 'user' : 'admin',
                              })
                            }
                            title={
                              isCurrentAdmin
                                ? 'Không thể đổi quyền của chính mình'
                                : u.role === 'admin'
                                ? 'Hạ xuống Khách hàng (User)'
                                : 'Thăng lên Quản trị viên (Admin)'
                            }
                            style={{
                              padding: '0.375rem 0.625rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: isCurrentAdmin ? '#cbd5e1' : '#0284c7',
                              cursor: isCurrentAdmin ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {u.role === 'admin' ? 'Hạ User' : 'Lên Admin'}
                          </button>

                          {/* Xóa */}
                          <button
                            disabled={isCurrentAdmin}
                            onClick={() => setDeleteModal({ open: true, user: u })}
                            title={isCurrentAdmin ? 'Không thể xóa chính mình' : 'Xóa tài khoản'}
                            style={{
                              padding: '0.375rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              color: isCurrentAdmin ? '#cbd5e1' : '#ef4444',
                              cursor: isCurrentAdmin ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="tài khoản"
        />
      </div>

      {/* Modal Đổi Phân Quyền */}
      {roleModal.open && roleModal.user && (
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
          onClick={() => !processing && setRoleModal({ open: false, user: null, targetRole: '' })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Xác nhận thay đổi phân quyền
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Bạn có chắc chắn muốn chuyển quyền của người dùng <strong>{roleModal.user.name}</strong> ({roleModal.user.email}) thành{' '}
              <strong style={{ color: roleModal.targetRole === 'admin' ? '#9333ea' : '#16a34a' }}>
                {roleModal.targetRole === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (User)'}
              </strong>
              ?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={processing}
                onClick={() => setRoleModal({ open: false, user: null, targetRole: '' })}
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
                type="button"
                disabled={processing}
                onClick={handleConfirmRoleChange}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer',
                }}
              >
                {processing ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa Tài Khoản */}
      {deleteModal.open && deleteModal.user && (
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
          onClick={() => !processing && setDeleteModal({ open: false, user: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fecaca',
                }}
              >
                <Trash2 size={18} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Xóa tài khoản người dùng
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteModal.user.name}</strong> ({deleteModal.user.email})? Thao tác này sẽ xóa vĩnh viễn khỏi MongoDB và không thể phục hồi.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={processing}
                onClick={() => setDeleteModal({ open: false, user: null })}
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
                type="button"
                disabled={processing}
                onClick={handleConfirmDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer',
                }}
              >
                {processing ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

