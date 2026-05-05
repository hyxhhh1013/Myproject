import React from 'react'

const Experience: React.FC = () => {
  return (
    <div>
      <h2 className="section-title">工作经历</h2>
      
      {/* Work Experience */}
      <div className="card mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">工作经历</h3>
        <div className="timeline">
          {/* Experience Item 1 */}
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-date">2020年1月 - 至今</div>
            <div className="timeline-title">高级全栈开发工程师</div>
            <div className="timeline-subtitle">ABC科技有限公司</div>
            <div className="timeline-description">
              <ul className="list-disc list-inside space-y-2">
                <li>负责公司核心产品的前端和后端开发</li>
                <li>使用React、TypeScript、Node.js和PostgreSQL开发高质量的Web应用</li>
                <li>参与系统架构设计和技术选型</li>
                <li>指导初级开发工程师，提高团队整体技术水平</li>
                <li>优化系统性能，提高应用响应速度</li>
              </ul>
            </div>
          </div>
          
          {/* Experience Item 2 */}
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-date">2018年1月 - 2019年12月</div>
            <div className="timeline-title">全栈开发工程师</div>
            <div className="timeline-subtitle">XYZ互联网公司</div>
            <div className="timeline-description">
              <ul className="list-disc list-inside space-y-2">
                <li>开发和维护公司的Web应用</li>
                <li>使用Vue.js、JavaScript、Node.js和MongoDB开发Web应用</li>
                <li>参与需求分析和功能设计</li>
                <li>修复系统bug，提高系统稳定性</li>
              </ul>
            </div>
          </div>
          
          {/* Experience Item 3 */}
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-date">2016年1月 - 2017年12月</div>
            <div className="timeline-title">前端开发工程师</div>
            <div className="timeline-subtitle">123软件开发公司</div>
            <div className="timeline-description">
              <ul className="list-disc list-inside space-y-2">
                <li>负责公司产品的前端开发</li>
                <li>使用HTML、CSS、JavaScript和jQuery开发Web应用</li>
                <li>参与UI设计和用户体验优化</li>
                <li>与后端开发工程师协作，完成前后端数据交互</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Education */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">教育背景</h3>
        <div className="timeline">
          {/* Education Item 1 */}
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-date">2012年9月 - 2016年6月</div>
            <div className="timeline-title">计算机科学与技术</div>
            <div className="timeline-subtitle">北京大学</div>
            <div className="timeline-description">
              <ul className="list-disc list-inside space-y-2">
                <li>获得学士学位</li>
                <li>主修课程：数据结构、算法、操作系统、计算机网络、数据库原理</li>
                <li>参与多个校园项目开发</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Experience