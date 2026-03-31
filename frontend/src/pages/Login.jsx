import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Space } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  InfoCircleFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  AppstoreFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// Giả định bạn đã có các file này trong project
// import axiosInstance from '../api/axios';
// import useAuthStore from '../stores/authStore';

const { Title, Text, Link } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const loginStore = useAuthStore((state) => state.login);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Logic gọi API của bạn
      console.log('Success:', values);
      // const response = await axiosInstance.post('/api/auth/login', values);
      // loginStore(response.data.user, response.data.token);
      message.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)',
      fontFamily: "'Manrope', sans-serif",
      padding: '20px'
    }}>
      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex',
          padding: 16,
          borderRadius: 16,
          background: '#1677ff',
          boxShadow: '0 8px 16px rgba(22, 119, 255, 0.25)',
          marginBottom: 16
        }}>
          <AppstoreFilled style={{ fontSize: 32, color: 'white' }} />
        </div>
        <Title level={1} style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#1d1d1f'
        }}>
          MONOLITH ERP
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Chào mừng quay trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
        </Text>
      </div>

      {/* Main Login Card */}
      <Card
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <Form
          name="erp_login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            label={<Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b' }}>Email Address</Text>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="name@company.com"
              style={{ borderRadius: 8, padding: '10px 14px' }}
            />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b' }}>Password</Text>
                <Link href="#" style={{ fontSize: 12, fontWeight: 600 }}>Forgot Password?</Link>
              </div>
            }
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="••••••••"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: 8, padding: '10px 14px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              style={{
                height: 52,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Don't have access? </Text>
            <Link strong>Request access</Link>
          </div>
        </Form>
      </Card>

      {/* Security Notice Section */}
      <Card
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 440,
          marginTop: 24,
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Space align="start">
          <InfoCircleFilled style={{ color: '#1677ff', fontSize: 20, marginTop: 4 }} />
          <div>
            <Text strong style={{ display: 'block' }}>System Security Notice</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Multi-factor authentication (MFA) is mandatory for all administrative accounts starting Dec 1st.
            </Text>
          </div>
        </Space>
      </Card>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 60, textAlign: 'center', paddingBottom: 20 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
          © 2024 Intelligent Monolith Systems. All rights reserved.
        </Text>
        <Space split={<Divider type="vertical" />}>
          <Link type="secondary" style={{ fontSize: 12 }}>Privacy Policy</Link>
          <Link type="secondary" style={{ fontSize: 12 }}>Terms of Service</Link>
          <Link type="secondary" style={{ fontSize: 12 }}>Security</Link>
        </Space>
      </div>

      {/* Import Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .ant-form-item-label > label { height: auto !important; }
      `}</style>
    </div>
  );
};

export default LoginPage;
