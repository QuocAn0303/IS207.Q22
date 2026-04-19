import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, Spin, List, Tag } from "antd";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/analytics/sales-insights");
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !data) return <Spin />;

  const chartData = data.daily.labels.map((l, i) => ({
    date: l,
    revenue: data.daily.values[i],
  }));

  return (
    <div>
      <h2>Sales Insights</h2>
      <Card title="Revenue (last 30 days)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top Trending Products" style={{ marginTop: 16 }}>
        <List
          dataSource={data.trending}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.product?.name || item.product.id}
                description={`Sold: ${item.qty}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Customer Segments" style={{ marginTop: 16 }}>
        <div>
          <h4>VIP</h4>
          {data.customerSegments.vip.map((c) => (
            <Tag key={c.customer.id}>{c.customer.name}</Tag>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <h4>At-risk</h4>
          {data.customerSegments.atRisk.map((c) => (
            <Tag key={c.customer.id}>{c.customer.name}</Tag>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <h4>New</h4>
          {data.customerSegments.newCustomers.map((c) => (
            <Tag key={c.customer.id}>{c.customer.name}</Tag>
          ))}
        </div>
      </Card>
    </div>
  );
}
