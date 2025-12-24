import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  message, 
  Space, 
  Tag, 
  Tooltip, 
  Image, 
  Popconfirm,
  Select,
  Card,
  Empty,
} from 'antd';
import { 
  PlusOutlined, 
  GithubOutlined, 
  LinkOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MenuOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string | string[]; 
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string; // Main image
  images?: string; // JSON string of all images
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
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

const TECH_OPTIONS = [
  { value: 'React', label: 'React', color: 'blue' },
  { value: 'Vue', label: 'Vue', color: 'green' },
  { value: 'TypeScript', label: 'TypeScript', color: 'blue' },
  { value: 'JavaScript', label: 'JavaScript', color: 'yellow' },
  { value: 'Node.js', label: 'Node.js', color: 'green' },
  { value: 'Express', label: 'Express', color: 'gray' },
  { value: 'NestJS', label: 'NestJS', color: 'red' },
  { value: 'Python', label: 'Python', color: 'blue' },
  { value: 'Java', label: 'Java', color: 'red' },
  { value: 'Go', label: 'Go', color: 'cyan' },
  { value: 'Docker', label: 'Docker', color: 'blue' },
  { value: 'AWS', label: 'AWS', color: 'orange' },
  { value: 'AI', label: 'AI', color: 'purple' },
  { value: 'Figma', label: 'Figma', color: 'pink' },
  { value: 'TailwindCSS', label: 'TailwindCSS', color: 'cyan' },
  { value: 'Ant Design', label: 'Ant Design', color: 'blue' },
];

const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [form] = Form.useForm();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) setViewMode('grid');
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/projects?limit=100'); // Get all for sorting
      const data = response.data.data || response.data;
      
      const parsedData = Array.isArray(data) ? data.map((p: any) => ({
        ...p,
        technologies: typeof p.technologies === 'string' && p.technologies.startsWith('[') 
          ? JSON.parse(p.technologies) 
          : (typeof p.technologies === 'string' ? p.technologies.split(',') : p.technologies)
      })) : [];
      
      // Sort by orderIndex
      parsedData.sort((a: Project, b: Project) => (a.orderIndex || 0) - (b.orderIndex || 0));
      
      setProjects(parsedData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      message.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      
      formData.append('userId', '1');
      formData.append('title', values.title);
      formData.append('description', values.description); // Markdown content
      formData.append('startDate', new Date().toISOString());
      
      // Handle technologies (array -> JSON string)
      formData.append('technologies', JSON.stringify(values.technologies));
      
      if (values.githubUrl) formData.append('githubUrl', values.githubUrl);
      if (values.demoUrl) formData.append('demoUrl', values.demoUrl);

      // Handle Images
      // 1. New files
      const newFiles = fileList.filter(f => f.originFileObj);
      newFiles.forEach(file => {
        if (file.originFileObj) {
            formData.append('images', file.originFileObj);
        }
      });

      // 2. Existing images (send as JSON string)
      const existingImages = fileList.filter(f => !f.originFileObj).map(f => f.url);
      formData.append('existingImages', JSON.stringify(existingImages));

      if (editingProject) {
        await axios.put(`/projects/${editingProject.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('更新成功');
      } else {
        // For new project, orderIndex is max + 1 (backend can handle or we send it)
        await axios.post('/projects', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/projects/${id}`);
      message.success('删除成功');
      fetchProjects();
    } catch (error) {
      message.error('删除失败');
    }
  };
  
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
        title: '确认批量删除',
        content: `确定要删除选中的 ${selectedRowKeys.length} 个项目吗？此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                await axios.post('/projects/bulk-delete', { ids: selectedRowKeys });
                message.success(`成功删除 ${selectedRowKeys.length} 个项目`);
                setSelectedRowKeys([]);
                fetchProjects();
            } catch (error) {
                message.error('批量删除失败');
            }
        }
    });
  };
  
  const handleExport = () => {
      if (projects.length === 0) {
          message.warning('没有数据可导出');
          return;
      }
      try {
          const headers = ['ID', '标题', '描述', 'GitHub', 'Demo', '创建时间'];
          const csvContent = [
            headers.join(','),
            ...projects.map(p => [
                p.id,
                `"${(p.title || '').replace(/"/g, '""')}"`,
                `"${(p.description || '').replace(/"/g, '""')}"`,
                p.githubUrl || '',
                p.demoUrl || '',
                p.createdAt
            ].join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `projects_export_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (err) {
          message.error('导出失败');
      }
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    
    // Parse technologies
    let techs: string[] = [];
    if (Array.isArray(record.technologies)) {
        techs = record.technologies;
    } else if (typeof record.technologies === 'string') {
        try {
            const parsed = JSON.parse(record.technologies);
            if (Array.isArray(parsed)) techs = parsed;
            else techs = record.technologies.split(',');
        } catch {
            techs = record.technologies.split(',');
        }
    }

    form.setFieldsValue({
      title: record.title,
      description: record.description,
      technologies: techs,
      githubUrl: record.githubUrl,
      demoUrl: record.demoUrl
    });
    
    // Setup fileList
    const images: UploadFile[] = [];
    
    // Check 'images' JSON first
    if (record.images) {
        try {
            const urls = JSON.parse(record.images);
            if (Array.isArray(urls)) {
                urls.forEach((url, index) => {
                    images.push({
                        uid: `-${index}`,
                        name: `image-${index}`,
                        status: 'done',
                        url: url
                    });
                });
            }
        } catch (e) {}
    } 
    // Fallback to imageUrl if images is empty/invalid
    if (images.length === 0 && record.imageUrl) {
        images.push({
            uid: '-1',
            name: 'cover.png',
            status: 'done',
            url: record.imageUrl,
        });
    }

    setFileList(images);
    setIsModalVisible(true);
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
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    listType: 'picture-card',
    multiple: true
  };

  // Drag and Drop
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setProjects((previous) => {
        const activeIndex = previous.findIndex((i) => i.id === active.id);
        const overIndex = previous.findIndex((i) => i.id === over?.id);
        
        const newProjects = [...previous];
        const [movedItem] = newProjects.splice(activeIndex, 1);
        newProjects.splice(overIndex, 0, movedItem);
        
        // Update orderIndex locally
        const updatedProjects = newProjects.map((p, i) => ({ ...p, orderIndex: i }));
        
        updatedProjects.forEach(p => {
             axios.put(`/projects/${p.id}`, { orderIndex: p.orderIndex }).catch(console.error);
        });

        return updatedProjects;
      });
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: '排序',
      key: 'sort',
      width: 50,
      render: () => <MenuOutlined className="cursor-grab text-gray-400" />,
    },
    {
        title: '截图',
        key: 'images',
        width: 150,
        render: (_, record) => {
            let urls: string[] = [];
            if (record.images) {
                try { urls = JSON.parse(record.images); } catch {}
            }
            if (urls.length === 0 && record.imageUrl) urls = [record.imageUrl];
            
            return urls.length > 0 ? (
                <div className="flex -space-x-4 overflow-hidden py-1">
                    <Image.PreviewGroup>
                        {urls.slice(0, 3).map((url, idx) => (
                            <Image 
                                key={idx} 
                                src={url} 
                                width={60} 
                                height={40} 
                                className="rounded shadow-sm border border-white"
                                style={{ objectFit: 'cover' }} 
                            />
                        ))}
                    </Image.PreviewGroup>
                    {urls.length > 3 && (
                        <div className="w-[60px] h-[40px] rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-white shadow-sm z-10">
                            +{urls.length - 3}
                        </div>
                    )}
                </div>
            ) : <div className="text-gray-400 text-xs">无图片</div>;
        }
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => (
        <div className="max-w-md truncate text-gray-500">
            {description}
        </div>
      ),
    },
    {
      title: '技术栈',
      dataIndex: 'technologies',
      key: 'technologies',
      render: (technologies) => {
        let techs: string[] = [];
        if (Array.isArray(technologies)) techs = technologies;
        else if (typeof technologies === 'string') {
            try {
                const parsed = JSON.parse(technologies);
                if (Array.isArray(parsed)) techs = parsed;
                else techs = technologies.split(',');
            } catch {
                techs = technologies.split(',');
            }
        }
        
        return (
            <Space size={[0, 4]} wrap>
            {techs.map((tech) => {
                const option = TECH_OPTIONS.find(o => o.value === tech.trim());
                return (
                    <Tag key={tech} color={option?.color || 'default'}>{tech}</Tag>
                );
            })}
            </Space>
        );
      },
    },
    {
      title: '链接',
      key: 'links',
      render: (_, record) => (
        <Space>
          {record.githubUrl && (
            <Tooltip title="GitHub">
              <a href={record.githubUrl} target="_blank" rel="noopener noreferrer">
                <GithubOutlined style={{ fontSize: '18px', color: '#333' }} />
              </a>
            </Tooltip>
          )}
          {record.demoUrl && (
            <Tooltip title="Demo">
              <a href={record.demoUrl} target="_blank" rel="noopener noreferrer">
                <LinkOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              </a>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card className="mb-6" bodyStyle={{ padding: '12px 16px' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full md:w-auto">
                  <h2 className="text-xl font-bold mb-1">项目管理</h2>
                  <p className="text-gray-500 text-sm">管理您的项目作品集</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                        setEditingProject(null);
                        form.resetFields();
                        setFileList([]);
                        setIsModalVisible(true);
                    }}
                  >
                    创建项目
                  </Button>
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
            <Button size="small" danger onClick={handleBatchDelete} icon={<DeleteOutlined />}>{!isMobile && '批量删除'}</Button>
          </Space>
        </div>
      )}

      {viewMode === 'grid' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
              {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {projects.map(project => (
                          <Card
                              key={project.id}
                              hoverable
                              actions={[
                                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(project)}>编辑</Button>,
                                  <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(project.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                                  </Popconfirm>
                              ]}
                          >
                              <Card.Meta 
                                  title={project.title}
                                  description={
                                      <div className="line-clamp-2 text-gray-500 text-xs mb-2">
                                          {project.description}
                                      </div>
                                  }
                              />
                              <div className="mt-2">
                                  {/* Render Tech Tags (Limit to 3) */}
                                  {Array.isArray(project.technologies) ? project.technologies.slice(0, 3).map((tech: string) => {
                                      const option = TECH_OPTIONS.find(o => o.value === tech.trim());
                                      return (
                                          <Tag key={tech} color={option?.color || 'default'} className="text-xs mr-1 mb-1">{tech}</Tag>
                                      );
                                  }) : null}
                              </div>
                          </Card>
                      ))}
                  </div>
              ) : (
                  <div className="py-12">
                      <Empty description="暂无项目数据" />
                  </div>
              )}
          </div>
      ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DndContext 
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext 
                    items={projects.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={{
                            body: {
                                row: SortableRow,
                            },
                        }}
                        columns={columns}
                        dataSource={projects}
                        rowKey="id"
                        loading={loading}
                        pagination={{ defaultPageSize: 10 }}
                        scroll={{ x: 800 }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys),
                        }}
                    />
                </SortableContext>
            </DndContext>
          </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? "编辑项目" : "创建新项目"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="项目截图 (支持多图)">
             <Upload {...uploadProps}>
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>点击上传</div>
                </div>
             </Upload>
          </Form.Item>

          <Form.Item 
            name="title" 
            label="标题" 
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="输入项目标题" />
          </Form.Item>
          
          <Form.Item name="technologies" label="技术栈">
            <Select 
                mode="tags" 
                placeholder="选择或输入技术栈" 
                options={TECH_OPTIONS}
                style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="description" label="详细描述 (Markdown)">
            <SimpleMDE 
                options={{
                    spellChecker: false,
                    placeholder: "支持 Markdown 格式..."
                }}
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
              <Form.Item name="githubUrl" label="GitHub链接">
                <Input prefix={<GithubOutlined />} placeholder="https://github.com/..." />
              </Form.Item>
              
              <Form.Item name="demoUrl" label="Demo/预览链接">
                <Input prefix={<LinkOutlined />} placeholder="https://..." />
              </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectsManagement;
