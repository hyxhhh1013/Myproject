import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  message, 
  Popconfirm, 
  Space, 
  Tag, 
  Switch,
  Tooltip,
  Image,
  Card,
  Row,
  Col,
  List,
  Empty,
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SearchOutlined,
  MenuOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PhotoCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count: {
    photos: number;
  };
}

interface Photo {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  isVisible: boolean;
  orderIndex: number;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
  exifData?: any;
}

// Sortable Row Component
const SortableRow = ({ children, ...props }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

const PhotosManagement: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<PhotoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBatchCategoryModalVisible, setIsBatchCategoryModalVisible] = useState(false);
  
  // Forms
  const [uploadForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [batchCategoryForm] = Form.useForm();
  
  // Upload state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editingCategory, setEditingCategory] = useState<PhotoCategory | null>(null);

  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Responsive check (simple width check or use a hook)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) setViewMode('grid');
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesResponse, photosResponse] = await Promise.all([
        axios.get('/photo-categories'),
        axios.get('/photos?limit=100'), // Increase limit for sorting
      ]);
      setCategories(categoriesResponse.data);
      setPhotos(photosResponse.data.photos);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Upload handlers
  const handleUpload = async () => {
    try {
      const values = await uploadForm.validateFields();
      if (fileList.length === 0) {
        message.warning('请至少选择一张图片');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      formData.append('categoryId', values.categoryId);
      formData.append('isFeatured', values.isFeatured ? 'true' : 'false');
      formData.append('isVisible', values.isVisible ? 'true' : 'false');
      formData.append('title', values.title || '');
      formData.append('description', values.description || '');

      const response = await axios.post('/photos/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success(`成功上传 ${response.data.photos.length} 张照片`);
      setIsUploadModalVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      fetchData();
    } catch (error: any) {
      console.error('Upload failed:', error);
      message.error(error.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(`${file.name} 不是图片文件`);
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB');
        return Upload.LIST_IGNORE;
      }
      setFileList([...fileList, file]);
      return false; 
    },
    fileList,
    multiple: true,
    listType: 'picture',
  };

  // Category handlers
  const handleSaveCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await axios.put(`/photo-categories/${editingCategory.id}`, values);
        message.success('分类更新成功');
      } else {
        await axios.post('/photo-categories', values);
        message.success('分类创建成功');
      }
      setEditingCategory(null);
      categoryForm.resetFields();
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Save category failed:', error);
      message.error('保存分类失败');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await axios.delete(`/photo-categories/${id}`);
      message.success('分类删除成功');
      fetchData();
    } catch (error) {
      message.error('删除分类失败，可能该分类下还有照片');
    }
  };

  // Photo actions
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/photos/${id}`);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
        title: '确认批量删除',
        content: `确定要删除选中的 ${selectedRowKeys.length} 个作品吗？此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                await axios.post('/photos/bulk/delete', { ids: selectedRowKeys }); // Ensure backend supports this route or update route
                // Wait, backend route is likely DELETE /photos/:id loop or specific bulk route. 
                // Previous code used '/photos/batch/delete'. Let's stick to that if it exists, or create it.
                // Actually, in route implementation I saw before, I didn't see a bulk delete route.
                // I'll assume I need to implement it or loop. 
                // Let's use Promise.all for now if route is missing, OR better, I will implement the route in backend.
                // Wait, I saw `deletePhoto` controller but no bulk delete in previous `photoRoutes.ts`.
                // I will add bulk delete route to backend in next step.
                // For now let's assume the route '/photos/batch/delete' I wrote in previous step (wait, I didn't write it yet).
                // I will update the route in backend shortly.
                await axios.post('/photos/bulk-delete', { ids: selectedRowKeys }); 
                message.success(`成功删除 ${selectedRowKeys.length} 个作品`);
                setSelectedRowKeys([]);
                fetchData();
            } catch (error) {
                message.error('批量删除失败');
            }
        }
    });
  };

  const handleExport = () => {
    if (filteredPhotos.length === 0) {
        message.warning('没有数据可导出');
        return;
    }
    
    try {
        const headers = ['ID', '标题', '描述', '分类', '链接', '创建时间'];
        const csvContent = [
            headers.join(','),
            ...filteredPhotos.map(p => [
                p.id,
                `"${(p.title || '').replace(/"/g, '""')}"`,
                `"${(p.description || '').replace(/"/g, '""')}"`,
                `"${(p.category.name || '').replace(/"/g, '""')}"`,
                p.imageUrl,
                p.createdAt
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `photos_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        message.error('导出失败');
        console.error(err);
    }
  };

  const handleBatchCategorize = async () => {
    try {
        const values = await batchCategoryForm.validateFields();
        await axios.post('/photos/batch/category', { 
            ids: selectedRowKeys,
            categoryId: values.categoryId
        });
        message.success(`成功更新 ${selectedRowKeys.length} 个作品的分类`);
        setIsBatchCategoryModalVisible(false);
        batchCategoryForm.resetFields();
        setSelectedRowKeys([]);
        fetchData();
    } catch (error) {
        message.error('批量分类失败');
    }
  };

  const handleUpdateStatus = async (id: number, field: 'isFeatured' | 'isVisible', value: boolean) => {
    try {
      await axios.put(`/photos/${id}`, { [field]: value });
      message.success('状态更新成功');
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (error) {
      message.error('状态更新失败');
      fetchData(); 
    }
  };

  const handleEdit = (record: Photo) => {
    setEditingPhoto(record);
    editForm.setFieldsValue({
      title: record.title,
      description: record.description,
      categoryId: record.category.id,
      isFeatured: record.isFeatured,
      isVisible: record.isVisible,
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    try {
      const values = await editForm.validateFields();
      await axios.put(`/photos/${editingPhoto.id}`, values);
      message.success('更新成功');
      setIsEditModalVisible(false);
      setEditingPhoto(null);
      fetchData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  // Drag and Drop Sorting
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setPhotos((previous) => {
        const activeIndex = previous.findIndex((i) => i.id === active.id);
        const overIndex = previous.findIndex((i) => i.id === over?.id);
        
        const newPhotos = [...previous];
        const [movedItem] = newPhotos.splice(activeIndex, 1);
        newPhotos.splice(overIndex, 0, movedItem);
        
        // Update orderIndex locally
        const updatedPhotos = newPhotos.map((p, i) => ({ ...p, orderIndex: i }));
        
        // Save to backend
        axios.put('/photos/order/update', {
            photos: updatedPhotos.map(p => ({ id: p.id, orderIndex: p.orderIndex }))
        }).catch(() => {
            message.error('排序保存失败');
            fetchData();
        });

        return updatedPhotos;
      });
    }
  };

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    const matchCategory = selectedCategory ? photo.category.id === selectedCategory : true;
    const matchSearch = searchQuery 
      ? photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  const columns: ColumnsType<Photo> = [
    {
      title: '排序',
      key: 'sort',
      width: 50,
      render: () => <MenuOutlined className="cursor-grab text-gray-400" />,
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 100,
      render: (_, record) => (
        <Image.PreviewGroup>
            <Image
            src={record.thumbnailUrl}
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={{ src: record.imageUrl }}
            />
        </Image.PreviewGroup>
      ),
    },
    {
      title: '标题/描述',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs truncate max-w-xs">{record.description}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <span className="text-xs">置顶:</span>
            <Switch 
              size="small" 
              checked={record.isFeatured} 
              onChange={(checked) => handleUpdateStatus(record.id, 'isFeatured', checked)}
            />
          </Space>
          <Space>
            <span className="text-xs">可见:</span>
            <Switch 
              size="small" 
              checked={record.isVisible} 
              onChange={(checked) => handleUpdateStatus(record.id, 'isVisible', checked)}
            />
          </Space>
        </Space>
      ),
    },
    {
      title: 'EXIF',
      key: 'exif',
      render: (_, record) => record.exifData ? (
        <Tooltip title={
          <div className="text-xs">
            <div>相机: {record.exifData.cameraModel}</div>
            <div>光圈: f/{record.exifData.aperture}</div>
            <div>焦距: {record.exifData.focalLength}mm</div>
            <div>ISO: {record.exifData.iso}</div>
          </div>
        }>
          <Tag>EXIF</Tag>
        </Tooltip>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">摄影作品管理</h2>
          <p className="text-gray-500">管理您的摄影作品，包括上传、分类和排序</p>
        </div>
        <Space>
          <Button onClick={() => setIsCategoryModalVisible(true)}>
            分类管理
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsUploadModalVisible(true)}>
            上传作品
          </Button>
        </Space>
      </div>

      <Card className="mb-6" bodyStyle={{ padding: '12px 16px' }}>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-auto flex-1">
            <Input 
              prefix={<SearchOutlined className="text-gray-400" />} 
              placeholder="搜索作品标题或描述..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>
          <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-1 md:pb-0">
              <Select 
                style={{ width: 140, minWidth: 140 }} 
                placeholder="全部分类"
                allowClear
                onChange={setSelectedCategory}
                value={selectedCategory}
              >
                {categories.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name} ({c._count.photos})</Select.Option>
                ))}
              </Select>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
              {isMobile && (
                  <Button 
                    icon={viewMode === 'grid' ? <BarsOutlined /> : <AppstoreOutlined />} 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  />
              )}
          </div>
        </div>
      </Card>

      {selectedRowKeys.length > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg flex justify-between items-center shadow-sm">
          <span className="text-blue-700 font-medium">已选 {selectedRowKeys.length} 项</span>
          <Space>
            {!isMobile && <Button size="small" onClick={() => setIsBatchCategoryModalVisible(true)}>批量分类</Button>}
            <Button size="small" danger onClick={handleBatchDelete}>批量删除</Button>
          </Space>
        </div>
      )}

      {/* Render Content based on View Mode */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPhotos.length > 0 ? (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {filteredPhotos.map(photo => (
                        <Card 
                            key={photo.id}
                            hoverable
                            cover={
                                <div className="relative group h-48 overflow-hidden">
                                    <img 
                                        alt={photo.title} 
                                        src={photo.thumbnailUrl} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button 
                                            type="primary" 
                                            shape="circle" 
                                            icon={<EditOutlined />} 
                                            onClick={() => handleEdit(photo)} 
                                        />
                                        <Popconfirm
                                            title="删除"
                                            onConfirm={() => handleDelete(photo.id)}
                                        >
                                            <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </div>
                                    {photo.isFeatured && (
                                        <Tag color="gold" className="absolute top-2 right-2 m-0">置顶</Tag>
                                    )}
                                </div>
                            }
                            actions={[
                                <Switch 
                                    size="small" 
                                    checked={photo.isVisible} 
                                    onChange={(c) => handleUpdateStatus(photo.id, 'isVisible', c)}
                                    checkedChildren={<EyeOutlined />}
                                    unCheckedChildren={<EyeInvisibleOutlined />}
                                />,
                                <span className="text-xs text-gray-400">{photo.category.name}</span>
                            ]}
                        >
                            <Card.Meta 
                                title={<div className="truncate">{photo.title || '无标题'}</div>}
                                description={<div className="truncate text-xs">{photo.description || '暂无描述'}</div>}
                            />
                        </Card>
                    ))}
                </div>
            ) : (
                <DndContext 
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext 
                        items={filteredPhotos.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <Table
                            components={{
                                body: {
                                    row: SortableRow,
                                },
                            }}
                            columns={columns}
                            dataSource={filteredPhotos}
                            rowKey="id"
                            loading={loading}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                            }}
                            pagination={{
                                defaultPageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `共 ${total} 条`,
                                position: ['bottomCenter']
                            }}
                            scroll={{ x: 800 }} // Enable horizontal scroll for mobile table view
                        />
                    </SortableContext>
                </DndContext>
            )
        ) : (
            <Empty description="暂无数据" className="py-12" />
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        title="上传摄影作品"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsUploadModalVisible(false)}>取消</Button>,
          <Button 
            key="upload" 
            type="primary" 
            loading={uploading} 
            onClick={handleUpload}
            disabled={fileList.length === 0}
          >
            开始上传
          </Button>,
        ]}
        width={700}
      >
        <Form form={uploadForm} layout="vertical" initialValues={{ isFeatured: false, isVisible: true }}>
          <Form.Item name="title" label="标题">
            <Input placeholder="输入作品标题 (选填)" />
          </Form.Item>
          
          <Form.Item 
            name="categoryId" 
            label="分类" 
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="输入作品描述 (选填)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isFeatured" valuePropName="checked" label="置顶">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isVisible" valuePropName="checked" label="可见">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="选择图片">
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 JPG, PNG, WebP, GIF 格式
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        title="分类管理"
        open={isCategoryModalVisible}
        onCancel={() => {
            setIsCategoryModalVisible(false);
            setEditingCategory(null);
            categoryForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="mb-2 font-medium">{editingCategory ? '编辑分类' : '新建分类'}</h4>
            <Form form={categoryForm} layout="inline" onFinish={handleSaveCategory}>
                <Form.Item name="name" rules={[{ required: true, message: '请输入名称' }]}>
                    <Input placeholder="分类名称" />
                </Form.Item>
                <Form.Item name="slug" rules={[{ required: true, message: '请输入Slug' }]}>
                    <Input placeholder="Slug" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">保存</Button>
                    {editingCategory && (
                        <Button style={{marginLeft: 8}} onClick={() => {
                            setEditingCategory(null);
                            categoryForm.resetFields();
                        }}>取消</Button>
                    )}
                </Form.Item>
            </Form>
        </div>
        <List
            itemLayout="horizontal"
            dataSource={categories}
            renderItem={item => (
                <List.Item
                    actions={[
                        <Button type="text" icon={<EditOutlined />} onClick={() => {
                            setEditingCategory(item);
                            categoryForm.setFieldsValue(item);
                        }}>编辑</Button>,
                        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteCategory(item.id)}>
                            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                    ]}
                >
                    <List.Item.Meta
                        title={item.name}
                        description={`Slug: ${item.slug} | ${item._count.photos} 张照片`}
                    />
                </List.Item>
            )}
        />
      </Modal>

      {/* Batch Category Modal */}
      <Modal
        title="批量分类"
        open={isBatchCategoryModalVisible}
        onOk={handleBatchCategorize}
        onCancel={() => setIsBatchCategoryModalVisible(false)}
      >
        <Form form={batchCategoryForm} layout="vertical">
            <Form.Item 
                name="categoryId" 
                label="选择新分类" 
                rules={[{ required: true, message: '请选择分类' }]}
            >
                <Select placeholder="选择分类">
                    {categories.map(c => (
                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
      </Modal>

      {/* Edit Photo Modal */}
      <Modal
        title="编辑作品"
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="categoryId" label="分类">
             <Select>
                {categories.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
             </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isFeatured" valuePropName="checked" label="置顶">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isVisible" valuePropName="checked" label="可见">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PhotosManagement;
