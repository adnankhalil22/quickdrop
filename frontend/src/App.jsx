import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import RestaurantListing from './pages/RestaurantListing';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/customer/Profile';
import Addresses from './pages/customer/Addresses';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetail from './pages/customer/OrderDetail';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerRestaurant from './pages/manager/ManagerRestaurant';
import ManagerCategories from './pages/manager/ManagerCategories';
import ManagerMenuItems from './pages/manager/ManagerMenuItems';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="restaurants" element={<RestaurantListing />} />
            <Route path="restaurants/:id" element={<RestaurantDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route element={<ProtectedRoute roles={['customer']} />}>
              <Route path="profile" element={<Profile />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="orders/:id" element={<OrderDetail />} />
            </Route>

            <Route element={<ProtectedRoute roles={['manager']} />}>
              <Route path="manager" element={<ManagerDashboard />} />
              <Route path="manager/restaurant" element={<ManagerRestaurant />} />
              <Route path="manager/categories" element={<ManagerCategories />} />
              <Route path="manager/menu-items" element={<ManagerMenuItems />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
