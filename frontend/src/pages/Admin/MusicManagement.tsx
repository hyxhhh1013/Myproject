import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Modal, Form, Input, Select, message, 
  Card, Space, Popconfirm, Tag 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  PlayCircleOutlined, SoundOutlined 
} from '@ant-design/icons';

interface Music {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  platform: string;
  url: string;
  isVisible: boolean;
}

const MusicManagement: React.FC = () => {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Music | null>(null);
  const [form] = Form.useForm();

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/music');
      setMusicList(res.data);
    } catch (error) {
      message.error('加载音乐失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await axios.put(`/api/music/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/music', values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchMusic();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/music/${id}`);
      message.success('删除成功');
      fetchMusic();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      render: (url: string) => (
        url ? <img src={url} alt="cover" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded" />
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: '艺术家',
      dataIndex: 'artist',
      key: 'artist',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => <a href={url} target="_blank" rel="noreferrer" className="text-blue-500">{url}</a>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Music) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingItem(record);
            form.setFieldsValue(record);
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
          <h2 className="text-xl font-bold">音乐管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}>
            添加音乐
          </Button>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={musicList} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? "编辑音乐" : "添加音乐"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input prefix={<SoundOutlined />} />
          </Form.Item>
          <Form.Item name="artist" label="艺术家">
            <Input />
          </Form.Item>
          <Form.Item name="platform" label="平台" initialValue="netease">
            <Select>
              <Select.Option value="netease">网易云音乐</Select.Option>
              <Select.Option value="spotify">Spotify</Select.Option>
              <Select.Option value="local">本地上传</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="url" label="链接/ID">
            <Input prefix={<PlayCircleOutlined />} placeholder="歌曲链接或ID" />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面链接">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MusicManagement;
