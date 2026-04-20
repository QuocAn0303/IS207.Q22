import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount ?? 0,
  );

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [ovRes, revRes] = await Promise.all([
          axiosInstance.get("/dashboard/overview"),
          axiosInstance.get("/dashboard/revenue"),
        ]);
        setOverview(ovRes.data.data);
        setRevenue(revRes.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải dữ liệu dashboard",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 32 }}>⏳ Đang tải...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>❌ {error}</div>;

  // Prepare data for Sales AreaChart
  const salesData = revenue?.daily?.map(d => ({
    name: d.date.slice(5), // MM-DD
    sales: d.revenue
  })) || [];

  // Prepare data for Orders BarChart
  // We mock the orders data slightly if the API only provides revenue
  const ordersData = revenue?.daily?.map((d, index) => ({
    name: d.date.slice(5),
    orders: Math.floor(d.revenue / 50000) + Math.floor(Math.random() * 10) // Mocking order count based on revenue for display
  })) || [];

  // Prepare data for Product Performance PieChart
  const pieData = overview?.productPerformance || [];
  const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];

  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
        background: "#f4f7fe",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, color: "#2b3674", fontWeight: 700 }}>
          ERP Dashboard
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 24 }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* 1. Top KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <KPICard title="Doanh thu hôm nay" value={formatVND(overview.todayRevenue)} icon="💰" color="#05CD99" bg="#e6fbf5" />
            <KPICard title="Đơn hàng hôm nay" value={overview.todayOrders} icon="🛒" color="#4318FF" bg="#f4f7fe" />
            <KPICard title="Tổng khách hàng" value={overview.totalCustomers} icon="👥" color="#FFB547" bg="#fff8ec" />
            <KPICard title="Cảnh báo tồn kho" value={overview.lowStockProducts?.length || 0} icon="⚠️" color="#EE5D50" bg="#fceceb" />
          </div>

          {/* 2. Sales Chart */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Biểu đồ doanh thu (7 ngày)</h3>
            <div style={{ height: 240, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e5f2" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3aed1" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3aed1" }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [formatVND(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Order Status */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Trạng thái đơn hàng</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 16 }}>
              {[
                { key: "PENDING", label: "Chờ xử lý", color: "#FFB547", icon: "⏳" },
                { key: "CONFIRMED", label: "Đã duyệt", color: "#3965FF", icon: "📋" },
                { key: "SHIPPING", label: "Đang giao", color: "#8B50FF", icon: "🚚" },
                { key: "COMPLETED", label: "Hoàn thành", color: "#05CD99", icon: "✅" },
                { key: "CANCELLED", label: "Đã hủy", color: "#EE5D50", icon: "❌" },
              ].map(({ key, label, color, icon }) => (
                <div key={key} style={{ textAlign: "center", padding: "12px", background: "#f8f9fc", borderRadius: 12 }}>
                  <div style={{ fontSize: 20 }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: color, margin: "8px 0" }}>
                    {overview.orderStatus?.[key] ?? 0}
                  </div>
                  <div style={{ fontSize: 13, color: "#a3aed1", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* 4. Product Performance */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Cơ cấu bán ra</h3>
            <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 13, color: "#2b3674", paddingTop: "5px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ ...cardStyle, flex: 1 }}>
            <h3 style={cardTitleStyle}>Cảnh báo kho ({overview.lowStockProducts?.length || 0})</h3>
            <div style={{ marginTop: 16 }}>
              {overview.lowStockProducts?.length > 0 ? (
                overview.lowStockProducts.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#2b3674", marginBottom: 4 }}>{item.product?.name}</div>
                      <div style={{ fontSize: 12, color: "#a3aed1" }}>SKU: {item.product?.sku}</div>
                    </div>
                    <div style={{ background: "#fceceb", color: "#EE5D50", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, height: "fit-content" }}>
                      Còn {item.quantity}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 14, color: "#a3aed1", textAlign: "center", padding: "20px 0" }}>Kho hàng ổn định</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components
const KPICard = ({ title, value, icon, color, bg }) => (
  <div style={{ ...cardStyle, padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 24, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, color: "#a3aed1", fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 20, color: "#2b3674", fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  border: "none",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#2b3674",
};
