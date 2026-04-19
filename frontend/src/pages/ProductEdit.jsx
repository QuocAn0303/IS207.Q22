import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  message,
  Select,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "../api/axios";

const { Dragger } = Upload;

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        const data = res.data.data || res.data || {};
        // map category object to categoryId for the select
        if (data.category && data.category.id)
          data.categoryId = data.category.id;
        form.setFieldsValue(data);
      } catch (e) {
        message.error("Không tải được sản phẩm");
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("/categories");
        setCategories(res.data?.data || res.data || []);
      } catch (e) {
        // ignore
      }
    };
    loadCategories();
  }, []);

  const props = {
    name: "image",
    multiple: false,
    accept: "image/*",
    fileList,
    onChange(info) {
      const fl = info.fileList.slice(-1);
      setFileList(fl);
    },
    beforeUpload(file) {
      return false; // prevent auto upload
    },
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (id) {
        const formData = new FormData();
        Object.keys(values).forEach((k) => {
          if (values[k] !== undefined && values[k] !== null)
            formData.append(k, values[k]);
        });
        if (fileList[0]) formData.append("image", fileList[0].originFileObj);
        await axios.patch(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Cập nhật thành công");
        navigate("/products");
      } else {
        // Create new product (API requires categoryId and numeric fields)
        const payload = { ...values };
        if (payload.price) payload.price = Number(payload.price);
        if (payload.costPrice) payload.costPrice = Number(payload.costPrice);
        if (!payload.categoryId) {
          message.error("Vui lòng chọn danh mục");
          setLoading(false);
          return;
        }

        const res = await axios.post(`/products`, payload);
        const created = res.data?.data || res.data;
        const newId = created?.id;
        if (fileList[0] && newId) {
          const fd = new FormData();
          fd.append("image", fileList[0].originFileObj);
          await axios.post(`/products/${newId}/image`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        message.success("Tạo sản phẩm thành công");
        navigate("/products");
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Chỉnh sửa sản phẩm</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ unit: "cái" }}
      >
        <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
          {" "}
          <Input />{" "}
        </Form.Item>
        <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
          {" "}
          <Input />{" "}
        </Form.Item>
        <Form.Item label="Giá bán" name="price" rules={[{ required: true }]}>
          {" "}
          <InputNumber style={{ width: "100%" }} />{" "}
        </Form.Item>
        <Form.Item
          label="Giá vốn"
          name="costPrice"
          rules={[{ required: true }]}
        >
          {" "}
          <InputNumber style={{ width: "100%" }} />{" "}
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          {" "}
          <Input.TextArea rows={3} />{" "}
        </Form.Item>
        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Chọn danh mục"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>
        <Form.Item label="Ảnh">
          <Dragger {...props} style={{ padding: 12 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo thả ảnh vào đây hoặc nhấn để chọn
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
