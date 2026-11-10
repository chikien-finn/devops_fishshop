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
import AdminOrdersPage from '../features/orders/pages/AdminOrdersPage.jsx';

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
        element: <AdminOrdersPage />,
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

