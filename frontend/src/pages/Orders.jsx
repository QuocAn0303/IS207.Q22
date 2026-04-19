import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import axiosInstance from "../api/axios";

const Orders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/orders");
        const orders = res.data?.data || [];
        setData(orders);
      } catch (err) {
        message.error(
          err.response?.data?.message || "Không thể tải danh sách đơn hàng",
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { title: "Mã đơn", dataIndex: "orderCode", key: "orderCode" },
    { title: "Khách hàng", dataIndex: ["customer", "name"], key: "customer" },
    {
      title: "Tổng",
      dataIndex: "total",
      key: "total",
      render: (v) => `${Number(v).toLocaleString()}₫`,
    },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => new Date(d).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2>Đơn hàng</h2>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
      />
    </div>
  );
};

export default Orders;
