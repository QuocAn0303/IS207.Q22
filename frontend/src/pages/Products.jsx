import React, { useEffect, useState } from "react";
import { Table, message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const Products = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/products");
        // paginated response: res.data.data
        const products = res.data?.data || [];
        setData(products);
      } catch (err) {
        message.error(
          err.response?.data?.message || "Không thể tải danh sách sản phẩm",
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (v) => `${Number(v).toLocaleString()}₫`,
    },
    {
      title: "Tồn kho",
      key: "stock",
      render: (_, r) => r.inventory?.quantity ?? "-",
    },
    { title: "Danh mục", dataIndex: ["category", "name"], key: "category" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Trang Sản phẩm</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/products/create")}
        >
          Thêm sản phẩm
        </Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
      />
    </div>
  );
};

export default Products;
