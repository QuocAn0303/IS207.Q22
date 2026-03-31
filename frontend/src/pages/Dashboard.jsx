import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Typography,
    Badge,
    Avatar,
    Card,
    Row,
    Col,
    Statistic,
    List,
    Button,
    Space,
    Tag
} from 'antd';
import {
    MenuOutlined,
    BellOutlined,
    DashboardOutlined,
    LineChartOutlined,
    InboxOutlined,
    FileTextOutlined,
    SettingOutlined,
    RiseOutlined,
    WalletOutlined,
    ShoppingCartOutlined,
    ProjectOutlined,
    WarningOutlined,
    PlusOutlined,
    CheckCircleFilled,
    SyncOutlined,
    UserAddOutlined,
    AlertFilled,
    HomeOutlined,
    BarChartOutlined,
    HistoryOutlined,
    UserOutlined
} from '@ant-design/icons';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

const DashboardPage = () => {
    const [collapsed, setCollapsed] = useState(false);

    // Dữ liệu mẫu cho Recent Activity
    const activities = [
        {
            id: 1,
            title: 'Invoice #402 paid',
            desc: 'Incoming wire transfer confirmed',
            time: '2 mins ago',
            icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
            bg: '#f6ffed'
        },
        {
            id: 2,
            title: 'Inventory stock updated',
            desc: 'Warehouse-B replenishment complete',
            time: '45 mins ago',
            icon: <SyncOutlined style={{ color: '#1677ff' }} />,
            bg: '#e6f4ff'
        },
        {
            id: 3,
            title: 'New user registered',
            desc: 'Sarah Jenkins joined Logistics team',
            time: '3 hours ago',
            icon: <UserAddOutlined style={{ color: '#722ed1' }} />,
            bg: '#f9f0ff'
        },
        {
            id: 4,
            title: 'System alert triggered',
            desc: 'High latency detected in Tokyo node',
            time: '5 hours ago',
            icon: <AlertFilled style={{ color: '#faad14' }} />,
            bg: '#fff7e6'
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Manrope', sans-serif" }}>
            {/* Desktop Sidebar (Ẩn trên Mobile trong demo này) */}
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                theme="light"
                style={{
                    borderRight: 'none',
                    boxShadow: '0 0 20px rgba(0,0,0,0.02)',
                    zIndex: 100
                }}
            >
                <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                    <Text strong style={{ fontSize: 18, color: '#1677ff', letterSpacing: '-1px' }}>MONOLITH</Text>
                </div>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ borderRight: 0 }}
                    items={[
                        { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
                        { key: '2', icon: <LineChartOutlined />, label: 'Analytics' },
                        { key: '3', icon: <InboxOutlined />, label: 'Inventory' },
                        { key: '4', icon: <FileTextOutlined />, label: 'Reports' },
                        { key: '5', icon: <SettingOutlined />, label: 'Settings' },
                    ]}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                    <Space>
                        <Button type="text" icon={<MenuOutlined />} className="mobile-only" />
                        <Title level={4} style={{ margin: 0, fontSize: 18 }}>Enterprise Intelligence</Title>
                    </Space>
                    <Space size="large">
                        <Badge dot color="#ff4d4f">
                            <BellOutlined style={{ fontSize: 20 }} />
                        </Badge>
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                    </Space>
                </Header>

                <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                    {/* Welcome Text */}
                    <div style={{ marginBottom: 32 }}>
                        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Good morning, Alex.</Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Your enterprise overview for today includes a significant boost in revenue.
                        </Text>
                    </div>

                    {/* Stats Cards */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} style={{ borderRadius: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ background: '#e6f4ff', padding: 12, borderRadius: 12 }}>
                                            <WalletOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                                        </div>
                                        <Tag color="success" icon={<RiseOutlined />}>+12.5%</Tag>
                                    </div>
                                    <Statistic title="Total Revenue" value={124000} prefix="$" valueStyle={{ fontWeight: 800 }} />
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} style={{ borderRadius: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ background: '#f0f5ff', padding: 12, borderRadius: 12 }}>
                                            <ShoppingCartOutlined style={{ fontSize: 20, color: '#2f54eb' }} />
                                        </div>
                                        <Tag color="success" icon={<RiseOutlined />}>+5.2%</Tag>
                                    </div>
                                    <Statistic title="New Orders" value={482} valueStyle={{ fontWeight: 800 }} />
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} style={{ borderRadius: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ background: '#fff2e8', padding: 12, borderRadius: 12 }}>
                                            <ProjectOutlined style={{ fontSize: 20, color: '#fa541c' }} />
                                        </div>
                                        <Tag>ONGOING</Tag>
                                    </div>
                                    <Statistic title="Active Projects" value={12} valueStyle={{ fontWeight: 800 }} />
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} style={{ borderRadius: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ background: '#fff1f0', padding: 12, borderRadius: 12 }}>
                                            <WarningOutlined style={{ fontSize: 20, color: '#f5222d' }} />
                                        </div>
                                        <Tag color="error">CRITICAL</Tag>
                                    </div>
                                    <Statistic title="Pending Tasks" value={8} valueStyle={{ fontWeight: 800 }} />
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    {/* Activity Section */}
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        <Col xs={24} lg={16}>
                            <Card
                                title={<Title level={4} style={{ margin: 0 }}>Recent Activity</Title>}
                                bordered={false}
                                style={{ borderRadius: 24 }}
                                extra={<Button type="text" icon={<SettingOutlined />} />}
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={activities}
                                    renderItem={(item) => (
                                        <List.Item style={{ padding: '16px 0' }}>
                                            <List.Item.Meta
                                                avatar={
                                                    <div style={{
                                                        background: item.bg,
                                                        padding: 10,
                                                        borderRadius: 12,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {item.icon}
                                                    </div>
                                                }
                                                title={<Text strong>{item.title}</Text>}
                                                description={item.desc}
                                            />
                                            <div style={{ textAlign: 'right' }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                                <Button block size="large" style={{ marginTop: 16, borderRadius: 12 }}>View Full Audit Log</Button>
                            </Card>
                        </Col>
                    </Row>
                </Content>

                {/* Mobile Bottom Navigation */}
                <div className="mobile-nav" style={{
                    position: 'fixed',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '12px 0 24px 0',
                    zIndex: 1000
                }}>
                    <div style={{ textAlign: 'center', color: '#1677ff' }}><HomeOutlined style={{ fontSize: 20 }} /><div style={{ fontSize: 10, marginTop: 4 }}>HOME</div></div>
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}><BarChartOutlined style={{ fontSize: 20 }} /><div style={{ fontSize: 10, marginTop: 4 }}>CHARTS</div></div>
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}><HistoryOutlined style={{ fontSize: 20 }} /><div style={{ fontSize: 10, marginTop: 4 }}>ACTIVITY</div></div>
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}><UserOutlined style={{ fontSize: 20 }} /><div style={{ fontSize: 10, marginTop: 4 }}>PROFILE</div></div>
                </div>

                {/* Floating Action Button */}
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                        position: 'fixed',
                        bottom: 100,
                        right: 24,
                        width: 56,
                        height: 56,
                        boxShadow: '0 8px 16px rgba(22, 119, 255, 0.3)'
                    }}
                />

            </Layout>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .mobile-only { display: block; }
          .ant-layout-sider { display: none; }
          .mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
        </Layout>
    );
};

export default DashboardPage;