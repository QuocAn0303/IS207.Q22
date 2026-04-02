import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [ovRes, revRes] = await Promise.all([
          axiosInstance.get('/dashboard/overview'),
          axiosInstance.get('/dashboard/revenue'),
        ]);
        setOverview(ovRes.data.data);
        setRevenue(revRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 32 }}>⏳ Đang tải...</div>;
  if (error)   return <div style={{ padding: 32, color: 'red' }}>❌ {error}</div>;

  const maxRevenue = Math.max(...(revenue?.daily?.map((d) => d.revenue) ?? [1]), 1);

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>📊 Dashboard</h1>

      {/* Thẻ tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card icon="📦" label="Sản phẩm"          value={overview.totalProducts} />
        <Card icon="👥" label="Khách hàng"         value={overview.totalCustomers} />
        <Card icon="🛒" label="Đơn hôm nay"        value={overview.todayOrders} />
        <Card icon="💰" label="Doanh thu hôm nay"  value={formatVND(overview.todayRevenue)} />
      </div>

      {/* Doanh thu tháng + trạng thái đơn */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h3>💵 Doanh thu tháng này</h3>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#2f855a' }}>
            {formatVND(overview.monthRevenue)}
          </div>
        </div>

        <div style={cardStyle}>
          <h3>📋 Trạng thái đơn hàng</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[
              { key: 'PENDING',   label: 'Chờ xử lý',  color: '#d69e2e' },
              { key: 'CONFIRMED', label: 'Xác nhận',    color: '#3182ce' },
              { key: 'SHIPPING',  label: 'Đang giao',   color: '#805ad5' },
              { key: 'COMPLETED', label: 'Hoàn thành',  color: '#2f855a' },
              { key: 'CANCELLED', label: 'Đã huỷ',      color: '#e53e3e' },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>
                  {overview.orderStatus?.[key] ?? 0}
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu 7 ngày */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3>📈 Doanh thu 7 ngày gần nhất</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {revenue?.daily?.map((d) => (
            <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#888', marginBottom: 2 }}>
                {formatVND(d.revenue)}
              </div>
              <div
                title={`${d.date} — ${d.orders} đơn`}
                style={{
                  height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%`,
                  background: '#3182ce',
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                {d.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: '#555' }}>
          Tổng: <strong>{formatVND(revenue?.summary?.totalRevenue)}</strong>
          {' · '}
          <strong>{revenue?.summary?.totalOrders} đơn</strong>
        </div>
      </div>

      {/* Sản phẩm sắp hết hàng */}
      {overview.lowStockProducts?.length > 0 && (
        <div style={cardStyle}>
          <h3>⚠️ Sản phẩm sắp hết hàng</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={thStyle}>Tên sản phẩm</th>
                <th style={thStyle}>SKU</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {overview.lowStockProducts.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.product?.name ?? '—'}</td>
                  <td style={tdStyle}>{item.product?.sku ?? '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#e53e3e', fontWeight: 700 }}>
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
    <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
  </div>
);

const cardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f0f0f0' };