import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  const maxRevenue = Math.max(
    ...(revenue?.daily?.map((d) => d.revenue) ?? [1]),
    1,
  );

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>📊 Doanh Thu</h1>

      {/* Thẻ tổng quan */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card icon="📦" label="Sản phẩm" value={overview.totalProducts} />
        <Card icon="👥" label="Khách hàng" value={overview.totalCustomers} />
        <Card icon="🛒" label="Đơn hôm nay" value={overview.todayOrders} />
        <Card
          icon="💰"
          label="Doanh thu hôm nay"
          value={formatVND(overview.todayRevenue)}
        />
      </div>

      {/* Doanh thu tháng + trạng thái đơn */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <h3>💵 Doanh thu tháng này</h3>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#2f855a" }}>
            {formatVND(overview.monthRevenue)}
          </div>
        </div>

        <div style={cardStyle}>
          <h3>📋 Trạng thái đơn hàng</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[
              { key: "PENDING", label: "Chờ xử lý", color: "#d69e2e" },
              { key: "CONFIRMED", label: "Xác nhận", color: "#3182ce" },
              { key: "SHIPPING", label: "Đang giao", color: "#805ad5" },
              { key: "COMPLETED", label: "Hoàn thành", color: "#2f855a" },
              { key: "CANCELLED", label: "Đã huỷ", color: "#e53e3e" },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>
                  {overview.orderStatus?.[key] ?? 0}
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu 7 ngày bằng Recharts */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3>📈 Doanh thu 7 ngày gần nhất</h3>
        <div style={{ height: 300, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenue?.daily}
              margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => (date ? date.slice(5) : "")}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `${val / 1000}k`}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value) => [formatVND(value), "Doanh thu"]}
                labelFormatter={(label) => `Ngày: ${label}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3182ce"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3182ce", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            color: "#555",
            textAlign: "center",
          }}
        >
          Tổng doanh thu (7 ngày):{" "}
          <strong>{formatVND(revenue?.summary?.totalRevenue)}</strong>
          {" · "}
          <strong>{revenue?.summary?.totalOrders} đơn hàng</strong>
        </div>
      </div>

      {/* Sản phẩm sắp hết hàng */}
      {overview.lowStockProducts?.length > 0 && (
        <div style={cardStyle}>
          <h3>⚠️ Sản phẩm sắp hết hàng</h3>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "#f7f7f7" }}>
                <th style={thStyle}>Tên sản phẩm</th>
                <th style={thStyle}>SKU</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {overview.lowStockProducts.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.product?.name ?? "—"}</td>
                  <td style={tdStyle}>{item.product?.sku ?? "—"}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      color: "#e53e3e",
                      fontWeight: 700,
                    }}
                  >
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Sub-components & styles
const Card = ({ icon, label, value }) => (
  <div style={cardStyle}>
    <div style={{ fontSize: 26 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 700, margin: "4px 0" }}>
      {value}
    </div>
    <div style={{ fontSize: 13, color: "#888" }}>{label}</div>
  </div>
);

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: 20,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};
const thStyle = {
  padding: "8px 12px",
  textAlign: "left",
  fontWeight: 600,
  borderBottom: "1px solid #e2e8f0",
};
const tdStyle = { padding: "8px 12px", borderBottom: "1px solid #f0f0f0" };
