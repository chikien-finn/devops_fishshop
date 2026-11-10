import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import HomePage from '../features/products/pages/HomePage.jsx';
import ProductListPage from '../features/products/pages/ProductListPage.jsx';
import ProductDetailPage from '../features/products/pages/ProductDetailPage.jsx';
import CollectionPage from '../features/products/pages/CollectionPage.jsx';
import AdminProductsPage from '../features/products/pages/AdminProductsPage.jsx';
import AdminDashboardPage from '../features/dashboard/pages/AdminDashboardPage.jsx';
import CartPage from '../features/cart/pages/CartPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import ProfilePage from '../features/users/pages/ProfilePage.jsx';
import AdminUserManagePage from '../features/users/pages/AdminUserManagePage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'product/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'ca-chuot',
        element: <CollectionPage />,
      },
      {
        path: 'ca-dia',
        element: <CollectionPage />,
      },
      {
        path: 'ca-dia-dong-ca-nhieu-mau-sac-nhat-hoa-van-tren-than-an-tuong',
        element: <CollectionPage />,
      },
      {
        path: 'ca-phuong-hoang',
        element: <CollectionPage />,
      },
      {
        path: 'tep',
        element: <CollectionPage />,
      },
      {
        path: 'tep-thuy-sinh',
        element: <CollectionPage />,
      },
      {
        path: 'collections/:slug',
        element: <CollectionPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'orders',
        element: (
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>Quản lý đơn hàng</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.875rem' }}>Tính năng theo dõi và xử lý đơn hàng đang được kết nối.</p>
          </div>
        ),
      },
      {
        path: 'users',
        element: <AdminUserManagePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

