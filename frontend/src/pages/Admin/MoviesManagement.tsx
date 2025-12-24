import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Modal, Form, Input, Rate, message, 
  Card, Space, Popconfirm, DatePicker 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  VideoCameraOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  posterUrl: string;
  rating: number;
  review: string;
  watchedAt: string;
  likes: number;
}

const MoviesManagement: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Movie | null>(null);
  const [form] = Form.useForm();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/movies');
      setMovies(res.data);
    } catch (error) {
      message.error('加载电影失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        watchedAt: values.watchedAt ? values.watchedAt.toISOString() : null,
      };

      if (editingItem) {
        await axios.put(`/api/movies/${editingItem.id}`, payload);
        message.success('更新成功');
      } else {
        await axios.post('/api/movies', payload);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchMovies();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/movies/${id}`);
      message.success('删除成功');
      fetchMovies();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '海报',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      render: (url: string) => (
        url ? <img src={url} alt="poster" className="w-12 h-16 rounded object-cover" /> : <div className="w-12 h-16 bg-gray-100 rounded" />
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Movie) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.year}</div>
        </div>
      )
    },
    {
      title: '导演',
      dataIndex: 'director',
      key: 'director',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled allowHalf defaultValue={rating} style={{ fontSize: 12 }} />
    },
    {
      title: '观看时间',
      dataIndex: 'watchedAt',
      key: 'watchedAt',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Movie) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingItem(record);
            form.setFieldsValue({
              ...record,
              watchedAt: record.watchedAt ? dayjs(record.watchedAt) : null
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
          <h2 className="text-xl font-bold">电影管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}>
            添加电影
          </Button>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={movies} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? "编辑电影" : "添加电影"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input prefix={<VideoCameraOutlined />} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="director" label="导演">
              <Input />
            </Form.Item>
            <Form.Item name="year" label="年份">
              <Input type="number" />
            </Form.Item>
          </div>
          <Form.Item name="rating" label="评分 (0-5)">
            <Rate allowHalf />
          </Form.Item>
          <Form.Item name="watchedAt" label="观看时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="posterUrl" label="海报链接">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="review" label="简评">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MoviesManagement;
