import React from 'react'

const About: React.FC = () => {
  return (
    <div className="space-y-16">
      <h2 className="section-title">关于我</h2>
      <div className="card apple-card-hover">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="/assets/images/e8f47feeab5afd0a0fce8ab4f9373d09.jpg"
                alt="About Me"
                className="w-full h-auto rounded-xl shadow-md group-hover:shadow-lg transition-all duration-500 ease-in-out transform group-hover:scale-[1.02]"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          <div className="lg:w-2/3">
            <h3 className="text-3xl font-semibold text-black mb-6 tracking-tight">黄奕轩</h3>
            <div className="space-y-6">
              <p className="text-lg text-[#6e6e73] leading-relaxed">
                我是湖南农业大学计算机科学与技术专业的大二学生，目前掌握了C语言、Java基础以及Web开发相关技术，熟悉GitHub项目开发流程，曾在学校安全实验室参与前端项目的基础优化工作。
              </p>
              <p className="text-lg text-[#6e6e73] leading-relaxed">
                作为小型创业活动的负责人，我不仅统筹完成了活动宣传页面的开发与迭代，还实现了单日营收1000+的成果，也让我更懂得如何将技术与实际需求结合。此外，我持续关注AI与前端的融合趋势，在Trae等技术社区积极学习前沿案例。
              </p>
              <p className="text-lg text-[#6e6e73] leading-relaxed">
                我性格开朗外向，具备出色的沟通表达与团队协作能力，可高效对接产品、设计等多方需求。自律意识突出，坚持健身习惯，能保持高效的学习与工作节奏，快速适应职场环境。
              </p>
            </div>
            <div className="mt-12">
              <h4 className="text-xl font-semibold text-black mb-6">基本信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoItem label="姓名" value="黄奕轩" />
                <InfoItem label="出生年月" value="2005年10月" />
                <InfoItem label="邮箱" value="2090862712@qq.com" />
                <InfoItem label="电话" value="17373337419" />
                <InfoItem label="所在地" value="湖南省长沙市" />
                <InfoItem label="职位" value="前端开发助理" />
                <InfoItem label="教育背景" value="湖南农业大学 计算机科学与技术专业（本科在读）" />
                <InfoItem label="年级" value="大二" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Info Item Component
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-[#86868b] font-medium mb-1.5 uppercase tracking-wider">{label}</span>
      <span className="text-base text-black">{value}</span>
    </div>
  )
}

export default About