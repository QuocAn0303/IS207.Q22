import React, { useState, useEffect } from 'react';
import { Table, Input, message, Tag } from 'antd';
import axiosInstance from '../api/axios';

const { Search } = Input;

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchCustomers = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/customers?page=${page}&limit=${pagination.pageSize}&search=${search}`);
            setCustomers(res.data.data);
            setPagination({
                ...pagination,
                current: res.data.pagination.page,
                total: res.data.pagination.total,
            });
        } catch (error) {
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchCustomers(newPagination.current);
    };

    const columns = [
        { title: 'Tên Khách Hàng', dataIndex: 'name', key: 'name' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', render: (val) => val || '—' },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (val) => val || '—' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address', render: (val) => val || '—' },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Danh sách Khách Hàng</h2>
                <Search
                    placeholder="Tìm tên, SĐT, Email..."
                    onSearch={(val) => fetchCustomers(1, val)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                dataSource={customers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default Customers;