import React, { useEffect, useState } from "react";
import { Table, Tag, Space, message } from "antd";
import axiosInstance from "../api/axios";
import useAuthStore from "../stores/authStore";

// Trang Audit: chỉ hiển thị cho ADMIN
// Ghi chú (VN): Trang này lấy danh sách activity từ backend (/api/audit)
export default function Audit() {
  const { user } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchData(pagination.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (page = 1) => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/audit", {
        params: { page, limit: pagination.pageSize },
      });
      // API trả về { success, data: [...], pagination: { page, limit, total, totalPages } }
      const items = res.data.data || [];
      const pag = res.data.pagination || {};
      setData(items);
      setPagination((p) => ({
        ...p,
        total: pag.total || items.length,
        current: page,
      }));
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || "Không thể tải audit logs");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Hành động", dataIndex: "action", key: "action" },
    { title: "Đối tượng", dataIndex: "entity", key: "entity" },
    { title: "Entity ID", dataIndex: "entityId", key: "entityId" },
    { title: "Người thực hiện", dataIndex: ["user", "fullName"], key: "user" },
    {
      title: "Trạng thái trước",
      dataIndex: "before",
      key: "before",
      render: (v) => (
        <pre
          style={{ whiteSpace: "pre-wrap", maxHeight: 80, overflow: "auto" }}
        >
          {JSON.stringify(v)}
        </pre>
      ),
    },
    {
      title: "Trạng thái sau",
      dataIndex: "after",
      key: "after",
      render: (v) => (
        <pre
          style={{ whiteSpace: "pre-wrap", maxHeight: 80, overflow: "auto" }}
        >
          {JSON.stringify(v)}
        </pre>
      ),
    },
    { title: "Thời gian", dataIndex: "createdAt", key: "createdAt" },
  ];

  if (!user)
    return (
      <div style={{ padding: 24 }}>Vui lòng đăng nhập để xem trang Audit.</div>
    );
  if (user.role !== "ADMIN")
    return (
      <div style={{ padding: 24 }}>Bạn không có quyền truy cập trang này.</div>
    );

  return (
    <div style={{ padding: 24 }}>
      <h2>📝 Activity Logs (Audit)</h2>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchData(page),
        }}
      />
    </div>
  );
}
