import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Modal, Form, Input, message, 
  Card, Space, Popconfirm, DatePicker 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  GlobalOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface Travel {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  visitedAt: string;
  description: string;
  photo?: string;
}

const TravelManagement: React.FC = () => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Travel | null>(null);
  const [form] = Form.useForm();

  const fetchTravels = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/travel-cities');
      setTravels(res.data);
    } catch (error) {
      message.error('加载足迹失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravels();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        visitedAt: values.visitedAt ? values.visitedAt.toISOString() : null,
      };

      if (editingItem) {
        await axios.put(`/api/travel-cities/${editingItem.id}`, payload);
        message.success('更新成功');
      } else {
        await axios.post('/api/travel-cities', payload);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchTravels();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/travel-cities/${id}`);
      message.success('删除成功');
      fetchTravels();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'photo',
      key: 'photo',
      render: (photo: string) => (
        photo ? (
          <img 
            src={photo} 
            alt="Travel photo" 
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            无
          </div>
        )
      )
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: '坐标',
      key: 'coordinates',
      render: (_: any, record: Travel) => (
        <div className="text-xs text-gray-500">
          {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
        </div>
      )
    },
    {
      title: '时间',
      dataIndex: 'visitedAt',
      key: 'visitedAt',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Travel) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingItem(record);
            form.setFieldsValue({
              ...record,
              visitedAt: record.visitedAt ? dayjs(record.visitedAt) : null
            });
            setIsModalVisible(true);
          }} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <Card className="mb-6" bodyStyle={{ padding: '12px 16px' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">旅行足迹</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}>
            添加足迹
          </Button>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={travels} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? "编辑足迹" : "添加足迹"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="location" label="地点名称" rules={[{ required: true }]}>
            <Input prefix={<GlobalOutlined />} />
          </Form.Item>
          <Form.Item name="photo" label="图片链接">
            <Input placeholder="https://example.com/photo.jpg" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="latitude" label="纬度" rules={[{ required: true }]}>
              <Input type="number" step="0.000001" />
            </Form.Item>
            <Form.Item name="longitude" label="经度" rules={[{ required: true }]}>
              <Input type="number" step="0.000001" />
            </Form.Item>
          </div>
          <Form.Item name="visitedAt" label="游玩时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TravelManagement;
