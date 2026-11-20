import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
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
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ProfilePage from '../features/users/pages/ProfilePage.jsx';
import AdminUserManagePage from '../features/users/pages/AdminUserManagePage.jsx';
import AdminOrdersPage from '../features/orders/pages/AdminOrdersPage.jsx';
import AdminReviewManagePage from '../features/reviews/pages/AdminReviewManagePage.jsx';
import MyOrdersPage from '../features/orders/pages/MyOrdersPage.jsx';
import TankModelsPage from '../features/content/pages/TankModelsPage.jsx';
import KnowledgePage from '../features/content/pages/KnowledgePage.jsx';
import AboutPage from '../features/content/pages/AboutPage.jsx';
import PromotionsPage from '../features/promotions/pages/PromotionsPage.jsx';

function CollectionRouteRedirect() {
  const { slug } = useParams();
  let sub = slug || 'ca-chuot';
  if (sub.includes('dia')) sub = 'ca-dia';
  else if (sub.includes('chuot')) sub = 'ca-chuot';
  else if (sub.includes('phuong-hoang')) sub = 'ca-phuong-hoang';
  else if (sub.includes('tep')) sub = 'tep';
  return <Navigate to={`/products?subCategory=${sub}`} replace />;
}

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
        element: <Navigate to="/products?subCategory=ca-chuot" replace />,
      },
      {
        path: 'ca-dia',
        element: <Navigate to="/products?subCategory=ca-dia" replace />,
      },
      {
        path: 'ca-dia-dong-ca-nhieu-mau-sac-nhat-hoa-van-tren-than-an-tuong',
        element: <Navigate to="/products?subCategory=ca-dia" replace />,
      },
      {
        path: 'ca-phuong-hoang',
        element: <Navigate to="/products?subCategory=ca-phuong-hoang" replace />,
      },
      {
        path: 'tep',
        element: <Navigate to="/products?subCategory=tep" replace />,
      },
      {
        path: 'tep-thuy-sinh',
        element: <Navigate to="/products?subCategory=tep" replace />,
      },
      {
        path: 'collections/:slug',
        element: <CollectionRouteRedirect />,
      },
      {
        path: 'promotions',
        element: <PromotionsPage />,
      },
      {
        path: 'khuyen-mai',
        element: <Navigate to="/promotions" replace />,
      },
      {
        path: 'uu-dai',
        element: <Navigate to="/promotions" replace />,
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
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'tank-models',
        element: <TankModelsPage />,
      },
      {
        path: 'knowledge',
        element: <KnowledgePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/:userId',
        element: <ProfilePage />,
      },
      {
        path: 'user/:userId',
        element: <ProfilePage />,
      },
      {
        path: 'orders',
        element: <ProfilePage defaultTab="orders" />,
      },
      {
        path: 'orders/:userId',
        element: <ProfilePage defaultTab="orders" />,
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
      {
        path: 'reviews',
        element: <AdminReviewManagePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

