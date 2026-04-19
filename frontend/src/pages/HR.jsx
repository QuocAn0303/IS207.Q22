import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Table, Card, Spin, InputNumber, Button, message } from "antd";

export default function HR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/hr/employees");
        setData(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spin />;

  const columns = [
    {
      title: "Tên nhân viên",
      dataIndex: ["employee", "user", "fullName"],
      key: "name",
    },
    {
      title: "Lương cơ bản",
      dataIndex: ["employee", "baseSalary"],
      key: "base",
    },
    {
      title: "Tiền ca",
      dataIndex: ["preview", "shiftMoney"],
      key: "shiftMoney",
      render: (val, record) => (
        <InputNumber
          min={0}
          value={editValues[record.employee.id] ?? val}
          onChange={(v) =>
            setEditValues((prev) => ({ ...prev, [record.employee.id]: v }))
          }
        />
      ),
    },
    { title: "Số ca (tháng)", dataIndex: "shiftCount", key: "shifts" },
    {
      title: "Phạt",
      dataIndex: ["preview", "penalties"],
      key: "penalties",
      render: (val) => val || 0,
    },
    {
      title: "Dự tính nhận",
      dataIndex: ["preview", "finalSalary"],
      key: "final",
    },
    {
      title: "Hành động",
      key: "action",
      render: (val, record) => (
        <Button
          type="primary"
          onClick={async () => {
            const id = record.employee.id;
            const value = editValues[id];
            if (value === undefined) {
              message.info("Không có thay đổi");
              return;
            }
            try {
              await axios.patch(`/hr/employees/${id}`, {
                shiftMoney: Number(value),
              });
              message.success("Cập nhật tiền ca thành công");
              // reload
              const res = await axios.get("/hr/employees");
              setData(res.data.data || []);
            } catch (e) {
              message.error(e?.response?.data?.message || "Lỗi khi cập nhật");
            }
          }}
        >
          Lưu
        </Button>
      ),
    },
  ];

  const rows = data.map((r) => ({
    key: r.employee.id,
    employee: r.employee,
    shiftCount: r.shiftCount,
    preview: r.preview,
  }));

  return (
    <div>
      <h2>HR & Payroll</h2>
      <Card>
        <Table dataSource={rows} columns={columns} />
      </Card>
    </div>
  );
}
