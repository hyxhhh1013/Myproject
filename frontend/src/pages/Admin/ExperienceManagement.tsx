import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Experience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const ExperienceManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    userId: 1, // 默认用户ID，实际应从认证信息获�?  });
  const [formError, setFormError] = useState<string>('');

  // 加载工作经历数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/experience');
      // 处理日期格式
      const formattedData = response.data.map((item: any) => ({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''
      }));
      setExperiences(formattedData);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 表单验证
  const validateForm = () => {
    if (!formData.company.trim()) {
      setFormError('请输入公司名�?);
      return false;
    }
    if (!formData.position.trim()) {
      setFormError('请输入职�?);
      return false;
    }
    if (!formData.startDate) {
      setFormError('请选择开始时�?);
      return false;
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      setFormError('结束时间不能早于开始时�?);
      return false;
    }
    if (!formData.description.trim()) {
      setFormError('请输入工作描�?);
      return false;
    }
    return true;
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  // 处理新增/编辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (isEditing) {
        // 更新现有经历
        await axios.put(`/api/experience/${isEditing}`, dataToSubmit);
        alert('工作经历更新成功�?);
      } else {
        // 创建新经�?        await axios.post('/api/experience', dataToSubmit);
        alert('工作经历创建成功�?);
      }
      
      // 重置表单和状�?      setShowModal(false);
      resetForm();
      
      // 重新获取数据
      await fetchData();
    } catch (error: any) {
      console.error('Failed to save experience:', error);
      setFormError(error.response?.data?.message || '保存失败，请重试');
    }
  };

  // 处理编辑
  const handleEdit = (experience: Experience) => {
    setIsEditing(experience.id);
    setFormData({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      description: experience.description,
      userId: experience.userId,
    });
    setShowModal(true);
    setFormError('');
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个工作经历吗�?)) {
      try {
        await axios.delete(`/experience/${id}`);
        alert('工作经历删除成功�?);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete experience:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 重置表单
  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      userId: 1,
    });
    setFormError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">加载�?..</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">工作经历管理</h2>
          <p className="text-gray-500 mt-1">管理您的工作经历，包括新增、编辑和删除</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#0071e3] text-white px-6 py-2 rounded-full hover:bg-[#0077ed] transition-colors font-medium"
        >
          新增经历
        </button>
      </div>

      {/* Experiences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((experience) => (
          <div 
            key={experience.id} 
            className="bg-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{experience.company}</h3>
                  <p className="text-[#0071e3] font-medium mt-1">{experience.position}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(experience)}
                    className="p-2 text-gray-500 hover:text-[#0071e3] transition-colors"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(experience.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    🗑�?                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block bg-transparent text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {experience.startDate}
                  {experience.endDate ? ` - ${experience.endDate}` : ' - 至今'}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">{experience.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No Experiences */}
      {experiences.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无工作经历</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/5 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? '编辑工作经历' : '新增工作经历'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                �?              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">公司名称 *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                    placeholder="输入公司名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职位 *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                    placeholder="输入职位"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时�?*</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                    placeholder="可选，留空表示至今"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工作描述 *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                  rows={4}
                  placeholder="输入工作描述，介绍您的工作职责和成就"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-white/30 rounded-full text-white/80 hover:bg-white/5 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0071e3] text-white rounded-full hover:bg-[#0077ed] transition-colors font-medium"
                >
                  {isEditing ? '保存修改' : '创建经历'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceManagement;


