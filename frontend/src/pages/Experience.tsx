import React from 'react'

const Experience: React.FC = () => {
  return (
    <div className="space-y-16">
      <h2 className="section-title">校园与实践经历</h2>
      
      {/* Campus Experience */}
      <div className="card apple-card-hover">
        <h3 className="text-3xl font-semibold text-black mb-10">实践经历</h3>
        <div className="timeline">
          {/* Experience Item 1 */}
          <TimelineItem
            date="2024年11月 - 至今"
            title="学校安全实验室成员"
            subtitle="湖南农业大学"
            description={[
              "入选校级核心技术实验室，自主学习Web安全相关知识",
              "参与实验室前端项目的漏洞排查与基础优化工作",
              "结合数据结构知识优化前端数据处理逻辑，提升小项目运行效率",
              "强化代码规范与工程化思维"
            ]}
          />
          
          {/* Experience Item 2 */}
          <TimelineItem
            date="2025年05月"
            title="小型创业活动负责人"
            subtitle="自主创业"
            description={[
              "主导策划并落地小型创业实践活动",
              "统筹团队完成活动宣传页面的简易开发与上线，实现线上引流",
              "结合用户反馈迭代页面交互设计",
              "助力活动当日营收突破1000+，锻炼需求分析与技术落地能力"
            ]}
          />
          
          {/* Experience Item 3 */}
          <TimelineItem
            date="2025年10月 - 至今"
            title="技术社区参与者"
            subtitle="字节跳动Trae社区"
            description={[
              "积极参与AI技术社区活动，重点关注AI在前端开发中的应用案例",
              "在GitHub独立开发并落地小型前端展示项目",
              "涵盖页面布局、交互逻辑实现等功能",
              "完善代码提交与版本管理记录"
            ]}
          />
        </div>
      </div>
      
      {/* Education */}
      <div className="card apple-card-hover">
        <h3 className="text-3xl font-semibold text-black mb-10">教育背景</h3>
        <div className="timeline">
          {/* Education Item 1 */}
          <TimelineItem
            date="2023年9月 - 至今"
            title="计算机科学与技术"
            subtitle="湖南农业大学"
            description={[
              "本科在读，目前大二",
              "主修课程：C语言、Java、数据结构、计算机网络、Web开发",
              "学习成绩优秀，积极参与各类技术活动",
              "专注于前端开发方向"
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// Timeline Item Component
function TimelineItem({ date, title, subtitle, description }: { date: string; title: string; subtitle: string; description: string[] }) {
  return (
    <div className="timeline-item relative group">
      <div className="timeline-dot group-hover:scale-125 transition-transform duration-300"></div>
      <div className="timeline-date">{date}</div>
      <div className="timeline-title group-hover:text-[#0071e3] transition-colors duration-300">{title}</div>
      <div className="timeline-subtitle">{subtitle}</div>
      <div className="timeline-description">
        <ul className="space-y-3 ml-2">
          {description.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[#0071e3] mr-2 mt-1.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Experience