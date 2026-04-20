import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Pos from "./pages/Pos";
import ProductEdit from "./pages/ProductEdit";
import Analytics from "./pages/Analytics";
import HR from "./pages/HR";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Các trang yêu cầu đăng nhập và có Sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<ProductEdit />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/users" element={<Users />} />
          {/* Thêm các route khác ở đây */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
