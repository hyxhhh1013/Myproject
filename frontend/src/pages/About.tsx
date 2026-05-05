import React from 'react'

const About: React.FC = () => {
  return (
    <div>
      <h2 className="section-title">关于我</h2>
      <div className="card">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <img
              src="https://via.placeholder.com/300"
              alt="About Me"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="md:w-2/3 md:pl-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">张三</h3>
            <p className="text-gray-700 mb-4">
              我是一名全栈开发工程师，拥有5年的Web开发经验，擅长使用React、TypeScript、Node.js和PostgreSQL等技术栈开发高质量的Web应用。
            </p>
            <p className="text-gray-700 mb-4">
              我热爱技术，喜欢学习新东西，并且善于解决复杂问题。我具有良好的团队合作精神和沟通能力，能够与不同背景的人合作完成项目。
            </p>
            <p className="text-gray-700 mb-4">
              我的专业领域包括：前端开发、后端开发、数据库设计、系统架构设计和DevOps。
            </p>
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">基本信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600"><strong>姓名：</strong>张三</p>
                  <p className="text-gray-600"><strong>年龄：</strong>30岁</p>
                  <p className="text-gray-600"><strong>邮箱：</strong>zhangsan@example.com</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>电话：</strong>138-0013-8000</p>
                  <p className="text-gray-600"><strong>所在地：</strong>北京市</p>
                  <p className="text-gray-600"><strong>职位：</strong>全栈开发工程师</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About