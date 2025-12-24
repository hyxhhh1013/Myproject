import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  Tag, 
  message, 
  Space, 
  Card, 
  Input, 
  Tooltip, 
  Popconfirm,
  Form,
  List
} from 'antd';
import { 
  CheckOutlined, 
  DeleteOutlined, 
  MailOutlined, 
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [replyForm] = Form.useForm();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/messages');
      setMessages(res.data);
      setFilteredMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      message.error('加载留言失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter logic
  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = messages.filter(msg => 
      msg.name.toLowerCase().includes(lowerSearch) ||
      msg.email.toLowerCase().includes(lowerSearch) ||
      msg.content.toLowerCase().includes(lowerSearch) ||
      msg.subject.toLowerCase().includes(lowerSearch)
    );
    setFilteredMessages(filtered);
  }, [searchText, messages]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.patch(`/messages/${id}/read`);
      message.success('已标记为已读');
      updateLocalMessage(id, { isRead: true });
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchMarkAsRead = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await axios.post('/messages/batch/read', { ids: selectedRowKeys });
      message.success(`已将 ${selectedRowKeys.length} 条留言标记为已读`);
      setMessages(prev => prev.map(m => selectedRowKeys.includes(m.id) ? { ...m, isRead: true } : m));
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/messages/${id}`);
      message.success('删除成功');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (currentMessage?.id === id) setViewModalVisible(false);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await axios.post('/messages/batch/delete', { ids: selectedRowKeys });
      message.success(`已删除 ${selectedRowKeys.length} 条留言`);
      setMessages(prev => prev.filter(m => !selectedRowKeys.includes(m.id)));
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };
  
  const handleExport = () => {
    if (filteredMessages.length === 0) {
      message.warning('没有数据可导出');
      return;
    }
    try {
      const headers = ['ID', '姓名', '邮箱', '主题', '内容', '状态', '创建时间'];
      const csvContent = [
        headers.join(','),
        ...filteredMessages.map(msg => [
            msg.id,
            `"${msg.name.replace(/"/g, '""')}"`,
            `"${msg.email.replace(/"/g, '""')}"`,
            `"${msg.subject.replace(/"/g, '""')}"`,
            `"${msg.content.replace(/"/g, '""')}"`,
            msg.isRead ? '已读' : '未读',
            msg.createdAt
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      message.error('导出失败');
      console.error(err);
    }
  };

  const updateLocalMessage = (id: number, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleView = (record: Message) => {
    setCurrentMessage(record);
    setViewModalVisible(true);
    if (!record.isRead) {
      handleMarkAsRead(record.id);
    }
  };

  const handleReply = (record: Message) => {
    setCurrentMessage(record);
    replyForm.setFieldsValue({
      to: record.email,
      subject: `Re: ${record.subject}`,
      content: `\n\n------------------\nOriginal Message:\nFrom: ${record.name}\nDate: ${new Date(record.createdAt).toLocaleString()}\n\n${record.content}`
    });
    setReplyModalVisible(true);
  };

  const sendReply = async () => {
    try {
      // Since we don't have a real email backend, we'll simulate it or use mailto
      // For now, let's just show success and close
      const values = await replyForm.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('回复已发送 (模拟)');
      setReplyModalVisible(false);
      
      // Optionally open system mail client
      window.location.href = `mailto:${values.to}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(values.content)}`;
    } catch (error) {
      // Form validation error
    }
  };

  const rowSelection: TableRowSelection<Message> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const columns: ColumnsType<Message> = [
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead) => (
        isRead ? 
        <Tag color="success" icon={<CheckOutlined />}>已读</Tag> : 
        <Tag color="error" icon={<MailOutlined />}>未读</Tag>
      ),
      filters: [
        { text: '已读', value: true },
        { text: '未读', value: false },
      ],
      onFilter: (value, record) => record.isRead === value,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <span className="font-medium text-gray-700">{text}</span>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) => (
        <Tooltip title={email}>
            <div className="truncate max-w-[180px] text-gray-500 hover:text-blue-600 cursor-pointer">
                {email}
            </div>
        </Tooltip>
      )
    },
    {
      title: '内容',
      key: 'content',
      render: (_, record) => (
        <div className="max-w-md">
            <div className="font-medium text-gray-800 mb-1 truncate">{record.subject}</div>
            <div className="text-gray-500 text-sm truncate">{record.content}</div>
        </div>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text) => <span className="text-gray-500 text-sm">{new Date(text).toLocaleString()}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
           <Tooltip title="快速回复">
            <Button 
                type="text" 
                icon={<MailOutlined />} 
                className="text-blue-600 hover:bg-blue-50"
                onClick={(e) => { e.stopPropagation(); handleReply(record); }} 
            />
          </Tooltip>
          <Tooltip title={record.isRead ? "已读" : "标记为已读"}>
             <Button 
                type="text" 
                disabled={record.isRead}
                icon={<CheckOutlined />} 
                className={record.isRead ? "text-gray-300" : "text-green-600 hover:bg-green-50"}
                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(record.id); }} 
             />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm 
                title="确定删除这条留言吗?" 
                onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id); }}
                onCancel={(e) => e?.stopPropagation()}
            >
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => e.stopPropagation()}
                />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">留言管理</h1>
            <p className="text-gray-500 mt-1 text-sm">查看和回复来自网站的访客留言</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Input 
                placeholder="搜索姓名、邮箱或内容..." 
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={e => setSearchText(e.target.value)}
                className="flex-1 md:w-[250px]"
                allowClear
            />
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
            <Button icon={<ReloadOutlined />} onClick={fetchMessages} />
        </div>
      </div>
      
      <Card 
        bordered={false} 
        className="shadow-sm rounded-xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        {/* Batch Actions Toolbar */}
        {selectedRowKeys.length > 0 && (
            <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-100">
                <span className="text-blue-700 text-sm">
                    已选 <span className="font-bold">{selectedRowKeys.length}</span>
                </span>
                <Space size="small">
                    {!isMobile && <Button size="small" onClick={() => setSelectedRowKeys([])}>取消</Button>}
                    <Button size="small" onClick={handleBatchMarkAsRead} icon={<CheckOutlined />}>{!isMobile && '标记已读'}</Button>
                    <Button size="small" danger onClick={handleBatchDelete} icon={<DeleteOutlined />}>{!isMobile && '删除'}</Button>
                </Space>
            </div>
        )}

        {isMobile ? (
            <List
                dataSource={filteredMessages}
                rowKey="id"
                loading={loading}
                pagination={{
                    onChange: (page) => { console.log(page); },
                    pageSize: 10,
                }}
                renderItem={item => (
                    <List.Item 
                        key={item.id}
                        onClick={() => handleView(item)}
                        className="cursor-pointer hover:bg-gray-50 px-4 py-3 border-b border-gray-100 last:border-0"
                    >
                        <div className="w-full">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-gray-900 truncate pr-2">{item.name}</div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-sm font-medium text-gray-800 mb-1 truncate">{item.subject}</div>
                            <div className="text-xs text-gray-500 line-clamp-2 mb-2">{item.content}</div>
                            <div className="flex justify-between items-center">
                                <Tag color={item.isRead ? "success" : "error"} className="mr-0">
                                    {item.isRead ? "已读" : "未读"}
                                </Tag>
                                <Space onClick={e => e.stopPropagation()}>
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<MailOutlined />} 
                                        className="text-blue-600"
                                        onClick={() => handleReply(item)} 
                                    />
                                    <Popconfirm 
                                        title="删除?" 
                                        onConfirm={() => handleDelete(item.id)}
                                        placement="topRight"
                                    >
                                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </Space>
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        ) : (
            <Table 
                rowSelection={rowSelection}
                columns={columns} 
                dataSource={filteredMessages} 
                rowKey="id"
                loading={loading}
                pagination={{ 
                    defaultPageSize: 10, 
                    showTotal: (total) => `共 ${total} 条留言`,
                    showSizeChanger: true 
                }}
                onRow={(record) => ({
                    onClick: () => handleView(record),
                    className: "cursor-pointer hover:bg-blue-50 transition-colors" 
                })}
            />
        )}
      </Card>

      {/* View Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2">
                <UserOutlined /> 留言详情
            </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => {
             if (currentMessage) {
                 Modal.confirm({
                     title: '确定删除?',
                     content: '删除后无法恢复',
                     okType: 'danger',
                     onOk: () => handleDelete(currentMessage.id)
                 });
             }
          }}>
            删除
          </Button>,
          <Button key="reply" type="primary" icon={<MailOutlined />} onClick={() => currentMessage && handleReply(currentMessage)}>
            回复
          </Button>
        ]}
        width={600}
      >
        {currentMessage && (
            <div className="space-y-6 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {currentMessage.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{currentMessage.name}</div>
                            <div className="text-gray-500 text-sm">{currentMessage.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <Tag color={currentMessage.isRead ? "success" : "error"}>
                            {currentMessage.isRead ? "已读" : "未读"}
                        </Tag>
                        <div className="text-xs text-gray-400 mt-1">
                            {new Date(currentMessage.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                        {currentMessage.subject}
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {currentMessage.content}
                    </div>
                </div>
            </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title="快速回复"
        open={replyModalVisible}
        onOk={sendReply}
        onCancel={() => setReplyModalVisible(false)}
        okText="发送邮件"
        cancelText="取消"
      >
        <Form form={replyForm} layout="vertical">
            <Form.Item name="to" label="收件人">
                <Input disabled />
            </Form.Item>
            <Form.Item 
                name="subject" 
                label="主题"
                rules={[{ required: true, message: '请输入主题' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item 
                name="content" 
                label="内容"
                rules={[{ required: true, message: '请输入回复内容' }]}
            >
                <Input.TextArea rows={6} />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesManagement;
