import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../api/axios";

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users?page=${page}&limit=${limit}`);
      const { data, pagination: pag } = res.data;
      setUsers(data);
      if (pag) {
        setPagination({
          current: pag.page,
          pageSize: pag.limit,
          total: pag.total,
        });
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lấy danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTableChange = (paginationOpts) => {
    fetchUsers(paginationOpts.current, paginationOpts.pageSize);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      email: record.email,
      fullName: record.fullName,
      role: record.role,
      // Do not set password for edit unless they want to change it
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      message.success("Vô hiệu hóa tài khoản thành công");
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi vô hiệu hóa tài khoản");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // Update user
        await axiosInstance.put(`/users/${editingUser.id}`, values);
        message.success("Cập nhật tài khoản thành công");
      } else {
        // Create user
        await axiosInstance.post("/users", values);
        message.success("Tạo tài khoản thành công");
      }
      setIsModalVisible(false);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || "Có lỗi xảy ra");
      }
    }
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "blue";
        if (role === "ADMIN") color = "red";
        else if (role === "MANAGER") color = "gold";
        else if (role === "WAREHOUSE") color = "green";
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {record.isActive && (
            <Popconfirm
              title="Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
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
        <h2>Quản lý User</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu mới (để trống nếu không đổi)"
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Option value="ADMIN">Admin</Option>
              <Option value="MANAGER">Manager (Quản lý)</Option>
              <Option value="CASHIER">Cashier (Thu ngân)</Option>
              <Option value="WAREHOUSE">Warehouse (Kho)</Option>
            </Select>
          </Form.Item>
          {editingUser && (
            <Form.Item name="isActive" label="Trạng thái">
              <Select>
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Vô hiệu hóa</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
