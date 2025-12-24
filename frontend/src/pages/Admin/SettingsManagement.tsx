import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, message, Card } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

const SettingsManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/site-config');
      form.setFieldsValue(res.data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
      message.error('获取配置失败');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.put('/site-config', values);
      message.success('保存成功');
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await axios.put('/auth/change-password', values);
      message.success('密码修改成功，请重新登录');
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('Failed to change password:', error);
      message.error(error.response?.data?.error || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: '基本设置',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteTitle: 'My Portfolio',
            aboutMe: '',
            seoKeywords: '',
            seoDescription: '',
            icpCode: ''
          }}
        >
          <Form.Item label="站点标题" name="siteTitle" rules={[{ required: true, message: '请输入站点标题' }]}>
            <Input placeholder="例如：我的个人作品集" />
          </Form.Item>
          
          <Form.Item label="关于我 (About Me)" name="aboutMe" help="这将显示在关于我页面">
            <TextArea rows={6} placeholder="介绍一下你自己..." />
          </Form.Item>

          <Form.Item label="SEO 关键词" name="seoKeywords" help="用逗号分隔，例如：摄影, 前端, 设计">
            <Input placeholder="SEO Keywords" />
          </Form.Item>

          <Form.Item label="SEO 描述" name="seoDescription">
            <TextArea rows={3} placeholder="SEO Description" />
          </Form.Item>

          <Form.Item label="ICP 备案号" name="icpCode">
            <Input placeholder="例如：京ICP备xxxxxxxx号" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: '安全设置',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onChangePassword}
        >
          <Form.Item 
            label="当前密码" 
            name="currentPassword" 
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item 
            label="新密码" 
            name="newPassword" 
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item 
            label="确认新密码" 
            name="confirmPassword" 
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} danger>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default SettingsManagement;
