import React, { useState, useEffect } from 'react';
import { DatePicker, Button, Table, message, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from '../api/axios';

const { RangePicker } = DatePicker;

const Reports = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState([dayjs().subtract(7, 'day'), dayjs()]);

    const fetchRevenueReport = async (startDate, endDate) => {
        setLoading(true);
        try {
            const from = startDate.format('YYYY-MM-DD');
            const to = endDate.format('YYYY-MM-DD');
            const res = await axiosInstance.get(`/reports/revenue?from=${from}&to=${to}`);
            setRevenueData(res.data.data);
        } catch (error) {
            message.error('Lỗi khi tải báo cáo doanh thu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueReport(dates[0], dates[1]);
    }, []);

    const handleDateChange = (vals) => {
        if (vals) {
            setDates(vals);
            fetchRevenueReport(vals[0], vals[1]);
        }
    };

    const handleExportExcel = async () => {
        // Note: Khi API export file của BE (Dev C làm tuần 5-6) hoàn thiện, 
        // bạn đổi responseType thành 'blob' để tải file về.
        message.loading({ content: 'Đang chuẩn bị file Excel...', key: 'export' });
        setTimeout(() => {
            message.success({ content: 'Giả lập xuất Excel thành công! Chờ API backend.', key: 'export' });
        }, 1000);
    };

    const columns = [
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        }
    ];

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Báo cáo Doanh Thu</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <RangePicker value={dates} onChange={handleDateChange} format="YYYY-MM-DD" />
                    <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <Card style={{ marginBottom: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <h3 style={{ margin: 0, color: '#389e0d' }}>
                    Tổng doanh thu giai đoạn này: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                </h3>
            </Card>

            <Table
                dataSource={revenueData}
                columns={columns}
                rowKey="date"
                loading={loading}
                pagination={false}
            />
        </div>
    );
};

export default Reports;