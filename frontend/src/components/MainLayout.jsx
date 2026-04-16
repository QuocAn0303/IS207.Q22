import React, { useState } from "react";
import { Layout, Menu, Button, theme, Typography } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Định nghĩa các mục Menu dựa trên tài liệu Guide Dev D [cite: 7-16]
  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/products", icon: <ShoppingOutlined />, label: "Sản phẩm" },
    { key: "/inventory", icon: <DatabaseOutlined />, label: "Kho hàng" },
    { key: "/reports", icon: <FileTextOutlined />, label: "Báo cáo" },
    { key: "/pos", icon: <ShoppingCartOutlined />, label: "Bán hàng (POS)" },
    { key: "/orders", icon: <FileTextOutlined />, label: "Đơn hàng" },
    { key: "/customers", icon: <UserOutlined />, label: "Khách hàng" },
  ];

  // Nếu là ADMIN thì thêm mục Quản lý User
  if (user?.role === "ADMIN") {
    menuItems.push({
      key: "/users",
      icon: <UserOutlined />,
      label: "Quản lý User",
    });
    menuItems.push({
      key: "/audit",
      icon: <FileTextOutlined />,
      label: "Audit",
    });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: 6,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {!collapsed ? "ERP SYSTEM" : "ERP"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Hệ thống quản lý Texas Chicken
          </Title>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              type="link"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL || ""}/api-docs`,
                  "_blank",
                )
              }
            >
              API Docs
            </Button>
            <span>
              Chào, <strong>{user?.fullName || "Admin"}</strong>
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: "initial",
          }}
        >
          <Outlet /> {/* Nơi hiển thị nội dung của từng trang con */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
