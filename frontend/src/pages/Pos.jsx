import React, { useEffect, useState } from "react";
import { Select, InputNumber, Button, Table, Form, message } from "antd";
import axiosInstance from "../api/axios";

const Pos = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/products");
        setProducts(res.data?.data || []);
      } catch (e) {
        message.error("Không thể tải sản phẩm cho POS");
      }
    };
    load();
  }, []);

  const addItem = (id) => {
    setSelected((s) => [...s, { productId: id, quantity: 1 }]);
  };

  const updateQty = (idx, q) => {
    setSelected((s) =>
      s.map((it, i) => (i === idx ? { ...it, quantity: q } : it)),
    );
  };

  const submit = async () => {
    if (selected.length === 0) return message.warn("Chọn ít nhất 1 sản phẩm");
    try {
      setLoading(true);
      await axiosInstance.post("/orders", { items: selected });
      message.success("Tạo đơn thành công");
      setSelected([]);
    } catch (e) {
      message.error(e.response?.data?.message || "Lỗi tạo đơn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>POS - Bán hàng</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Select
          style={{ width: 360 }}
          placeholder="Chọn sản phẩm để thêm"
          onSelect={addItem}
        >
          {products.map((p) => (
            <Select.Option
              key={p.id}
              value={p.id}
            >{`${p.name} — ${p.sku}`}</Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={submit} loading={loading}>
          Tạo đơn
        </Button>
      </div>

      <Table dataSource={selected} rowKey={(r, i) => i} pagination={false}>
        <Table.Column title="#" render={(_, __, idx) => idx + 1} />
        <Table.Column
          title="Sản phẩm"
          render={(val, row) => {
            const p = products.find((x) => x.id === row.productId);
            return p ? p.name : "-";
          }}
        />
        <Table.Column
          title="Số lượng"
          render={(val, row, idx) => (
            <InputNumber
              min={1}
              defaultValue={row.quantity}
              onChange={(v) => updateQty(idx, v)}
            />
          )}
        />
      </Table>
    </div>
  );
};

export default Pos;
