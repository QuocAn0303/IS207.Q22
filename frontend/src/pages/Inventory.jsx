import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axios';

const Inventory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/inventory/transactions');
            // axios trả về res.data, trong đó có data và pagination từ utils/response.js
            setTransactions(res.data.data.transactions || []);
        } catch (error) {
            message.error('Lỗi khi tải lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleImport = async (values) => {
        try {
            await axiosInstance.post('/inventory/import', values);
            message.success('Nhập kho thành công');
            setIsModalVisible(false);
            form.resetFields();
            fetchTransactions(); // Refresh data
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi nhập kho');
        }
    };

    const columns = [
        {
            title: 'Sản phẩm (SKU)',
            key: 'product',
            render: (_, record) => `${record.inventory?.product?.name} (${record.inventory?.product?.sku})`,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const colorMap = { IMPORT: 'green', EXPORT: 'blue', ADJUSTMENT: 'orange', RETURN: 'red' };
                return <Tag color={colorMap[type]}>{type}</Tag>;
            },
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
        { title: 'Người thao tác', key: 'createdBy', render: (_, record) => record.createdBy?.fullName || 'N/A' },
        { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleString('vi-VN') },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Lịch sử Giao dịch Kho</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Nhập Hàng
                </Button>
            </div>

            <Table dataSource={transactions} columns={columns} rowKey="id" loading={loading} />

            <Modal title="Nhập Hàng Vào Kho" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleImport}>
                    <Form.Item name="productId" label="ID Sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập ID sản phẩm' }]}>
                        <Input placeholder="Nhập UUID của sản phẩm" />
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Inventory;