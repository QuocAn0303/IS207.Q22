import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import useAuthStore from '../stores/authStore';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API POST /api/auth/login theo đúng tài liệu 
      const response = await axiosInstance.post('/auth/login', values);

      const { user, token } = response.data.data;

      // Lưu vào Zustand store 
      loginStore(user, token);

      message.success('Đăng nhập thành công!');

      // Chuyển hướng sang Dashboard 
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>ERP System</Title>
          <Typography.Text type="secondary">Đăng nhập để bắt đầu làm việc</Typography.Text>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;