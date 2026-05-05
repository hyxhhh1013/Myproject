import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Form, Input, Upload, Select, Tag, 
  Modal, message, Space, Popconfirm, Spin
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, EyeOutlined
} from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';

const { Option } = Select;

interface Interest {
  id: number;
  title: string;
  type: string;
  coverUrl: string;
  description?: string;
  tags?: string;
  rating?: number;
  status: string;
}

const Interests: React.FC = () => {
  const [form] = Form.useForm();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Create Interest');
  const [currentInterest, setCurrentInterest] = useState<Interest | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  // 获取兴趣列表
  const fetchInterests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/interests');
      setInterests(response.data);
    } catch (error) {
      message.error('Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  // 图片上传前的处理
  const beforeUpload = (file: UploadFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = (file.size || 0) / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 图片上传成功后的处理
  const handleUploadChange = (info: any) => {
    if (info.file.status === 'done') {
      // 获取上传后的图片URL
      const response = info.file.response;
      if (response && response.coverUrl) {
        setImageUrl(response.coverUrl);
        form.setFieldsValue({ cover: response.coverUrl });
      } else {
        // 如果是直接上传到服务器并返回URL
        const url = info.file.response.url || info.file.response;
        setImageUrl(url);
        form.setFieldsValue({ cover: url });
      }
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // 打开创建模态框
  const showCreateModal = () => {
    form.resetFields();
    setImageUrl('');
    setCurrentInterest(null);
    setModalTitle('Create Interest');
    setModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (record: any) => {
    setCurrentInterest(record);
    setImageUrl(record.coverUrl);
    setModalTitle('Edit Interest');
    form.setFieldsValue({
      title: record.title,
      type: record.type,
      cover: record.coverUrl,
      description: record.description,
      tags: record.tags ? record.tags.split(',') : [],
      rating: record.rating,
      status: record.status
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setImageUrl('');
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        tags: values.tags.join(','),
        rating: values.rating ? parseFloat(values.rating) : null
      };

      if (currentInterest && 'id' in currentInterest) {
        // 更新兴趣
        await axios.put(`/interests/${currentInterest.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Interest updated successfully');
      } else {
        // 创建兴趣
        await axios.post('/interests', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Interest created successfully');
      }

      setModalVisible(false);
      fetchInterests();
    } catch (error) {
      message.error('Failed to save interest');
    }
  };

  // 删除兴趣
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/interests/${id}`);
      message.success('Interest deleted successfully');
      fetchInterests();
    } catch (error) {
      message.error('Failed to delete interest');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'Cover',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 100,
      render: (text: string) => (
        <div className="w-16 h-24 overflow-hidden rounded-md">
          <img src={text} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (text: string) => (
        <div>
          {text?.split(',').map((tag: string) => (
            <Tag key={tag} color="green">{tag}</Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (text: number) => text ? `${text.toFixed(1)}/10` : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text: string) => {
        let color = 'default';
        if (text === 'Completed') color = 'success';
        else if (text === 'Watching') color = 'processing';
        else if (text === 'Wishlist') color = 'default';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
          />
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm 
            title="Are you sure to delete this interest?" 
            onConfirm={() => handleDelete(record.id)}
            okText="Yes" 
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Interests Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateModal}
        >
          Create Interest
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={interests}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Spin>

      {/* 创建/编辑模态框 */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {currentInterest ? 'Update' : 'Create'}
          </Button>
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the type!' }]}
          >
            <Select placeholder="Select type">
              <Option value="Movie">Movie</Option>
              <Option value="Game">Game</Option>
              <Option value="Book">Book</Option>
              <Option value="Music">Music</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cover"
            label="Cover Image"
            rules={[{ required: true, message: 'Please upload cover image!' }]}
          >
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="w-32 h-48 overflow-hidden rounded-md">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Upload
                name="cover"
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                showUploadList={false}
                action="/interests/upload"
              >
                <Button icon={<UploadOutlined />}>
                  Upload Cover
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Enter tags"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rating"
          >
            <Input placeholder="Enter rating (0-10)" type="number" min={0} max={10} step={0.1} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="Watching">Watching</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Wishlist">Wishlist</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Interests;



