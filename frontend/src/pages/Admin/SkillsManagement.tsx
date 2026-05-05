import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Skill {
  id: number;
  name: string;
  proficiency: number; // 0-100
  masteredAt: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const SkillsManagement: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    proficiency: 50, // 默认熟练�?0%
    masteredAt: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [formError, setFormError] = useState<string>('');

  // 加载技能数�?  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/skills');
      // 处理日期格式
      const formattedData = response.data.map((item: any) => ({
        ...item,
        proficiency: item.level, // 映射 level �?proficiency
        masteredAt: new Date(item.createdAt).toISOString().split('T')[0] // 使用 createdAt 作为 masteredAt 的默认值，因为后端没有 masteredAt 字段
      }));
      setSkills(formattedData);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 表单验证
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('请输入技能名�?);
      return false;
    }
    if (formData.proficiency < 0 || formData.proficiency > 100) {
      setFormError('熟练程度必须�?-100之间');
      return false;
    }
    if (!formData.masteredAt) {
      setFormError('请选择掌握时间');
      return false;
    }
    return true;
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
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
        level: formData.proficiency,
        category: '技�? // 暂时硬编码，后面可以加分类选择
      };

      if (isEditing) {
        // 更新现有技�?        await axios.put(`/api/skills/${isEditing}`, dataToSubmit);
        alert('技能更新成功！');
      } else {
        // 创建新技�?        await axios.post('/api/skills', {
          ...dataToSubmit,
          userId: 1 // 暂时硬编码用户ID
        });
        alert('技能创建成功！');
      }
      
      // 重置表单和状�?      setShowModal(false);
      resetForm();
      
      // 重新获取数据
      await fetchData();
    } catch (error: any) {
      console.error('Failed to save skill:', error);
      setFormError(error.response?.data?.message || '保存失败，请重试');
    }
  };

  // 处理编辑
  const handleEdit = (skill: Skill) => {
    setIsEditing(skill.id);
    setFormData({
      name: skill.name,
      proficiency: skill.proficiency,
      masteredAt: skill.masteredAt,
      description: skill.description || '',
    });
    setShowModal(true);
    setFormError('');
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个技能吗�?)) {
      try {
        await axios.delete(`/api/skills/${id}`);
        alert('技能删除成功！');
        await fetchData();
      } catch (error) {
        console.error('Failed to delete skill:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 重置表单
  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      name: '',
      proficiency: 50,
      masteredAt: new Date().toISOString().split('T')[0],
      description: '',
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
          <h2 className="text-3xl font-bold text-gray-900">技能管�?/h2>
          <p className="text-gray-500 mt-1">管理您的技能信息，包括新增、编辑和删除</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#0071e3] text-white px-6 py-2 rounded-full hover:bg-[#0077ed] transition-colors font-medium"
        >
          新增技�?        </button>
      </div>

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div 
            key={skill.id} 
            className="bg-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">熟练程度</span>
                      <span className="text-[#0071e3] font-medium">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0071e3] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="p-2 text-gray-500 hover:text-[#0071e3] transition-colors"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    🗑�?                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block bg-transparent text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  掌握�? {skill.masteredAt}
                </span>
              </div>

              {skill.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{skill.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Skills */}
      {skills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无技能信�?/p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/5 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? '编辑技�? : '新增技�?}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">技能名�?*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                    placeholder="输入技能名�?
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">熟练程度 *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      name="proficiency"
                      min="0"
                      max="100"
                      value={formData.proficiency}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      name="proficiency"
                      min="0"
                      max="100"
                      value={formData.proficiency}
                      onChange={handleInputChange}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors text-center"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">掌握时间 *</label>
                  <input
                    type="date"
                    name="masteredAt"
                    value={formData.masteredAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">技能描�?/label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-colors"
                  rows={3}
                  placeholder="输入技能描述，介绍您对该技能的掌握情况"
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
                  {isEditing ? '保存修改' : '创建技�?}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManagement;


