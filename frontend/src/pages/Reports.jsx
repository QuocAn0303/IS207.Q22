import React, { useState } from "react";
import { Button, DatePicker, Space, message, Card } from "antd";
import axiosInstance from "../api/axios";

const { RangePicker } = DatePicker;

// Trang Reports: cho phép tải Excel doanh thu và tồn kho
// Ghi chú (VN): Người dùng chọn khoảng thời gian rồi nhấn nút để tải file .xlsx
export default function Reports() {
  const [range, setRange] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatRange = (r) => {
    if (!r || !r[0] || !r[1]) return {};
    return { from: r[0].format("YYYY-MM-DD"), to: r[1].format("YYYY-MM-DD") };
  };

  const download = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (type) => {
    setLoading(true);
    try {
      const params = formatRange(range);
      const path =
        type === "revenue"
          ? "/reports/revenue/export"
          : "/reports/inventory/export";
      const res = await axiosInstance.get(path, {
        params,
        responseType: "blob",
      });
      const disposition = res.headers["content-disposition"] || "";
      const filenameMatch = disposition.match(
        /filename\*=UTF-8''(.+)$|filename="?([^\";]+)"?/,
      );
      const filename =
        (filenameMatch && (filenameMatch[1] || filenameMatch[2])) ||
        `${type}-${Date.now()}.xlsx`;
      download(res.data, filename);
      message.success("Tải xuống thành công");
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Báo cáo</h2>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Space>
            <RangePicker value={range} onChange={(vals) => setRange(vals)} />
          </Space>

          <Button
            type="primary"
            loading={loading}
            onClick={() => handleExport("revenue")}
          >
            Tải Excel Doanh thu
          </Button>

          <Button loading={loading} onClick={() => handleExport("inventory")}>
            Tải Excel Tồn kho
          </Button>
        </div>
      </Card>

      <div style={{ color: "#f80101ff", fontSize: 13 }}>
        Ghi chú: Nếu không chọn khoảng thời gian, API sẽ dùng mặc định (ví dụ:
        tháng hiện tại).
      </div>
    </div>
  );
}
