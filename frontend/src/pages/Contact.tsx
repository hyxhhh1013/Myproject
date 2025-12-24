import React, { useState } from 'react'
import axios from 'axios'

const Contact: React.FC = () => {
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await axios.post('/api/messages', formData)
      
      // 重置表单
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      // 显示成功提示
      alert('消息发送成功！我们会尽快回复您。')
    } catch (error) {
      console.error('发送失败:', error)
      alert('发送失败，请稍后重试或直接通过邮件联系。')
    }
  }

  // 表单输入变化处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-16">
      <h2 className="section-title">联系方式</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="card apple-card-hover">
          <h3 className="text-3xl font-semibold text-black mb-10">联系信息</h3>
          
          <div className="space-y-8">
            <ContactInfoItem
              title="地址"
              value="湖南省长沙市"
            />
            
            <ContactInfoItem
              title="邮箱"
              value="2090862712@qq.com"
              isLink={true}
              href="mailto:2090862712@qq.com"
            />
            
            <ContactInfoItem
              title="电话"
              value="17373337419"
              isLink={true}
              href="tel:17373337419"
            />
            
            <div>
              <h4 className="text-sm text-[#86868b] font-medium mb-4 uppercase tracking-wider">社交媒体</h4>
              <div className="flex space-x-8">
                <SocialLink href="https://github.com/hyxhhh1013" ariaLabel="GitHub">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </SocialLink>
                <SocialLink href="https://linkedin.com" ariaLabel="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </SocialLink>
                <SocialLink href="https://twitter.com" ariaLabel="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </SocialLink>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="card apple-card-hover">
          <h3 className="text-3xl font-semibold text-black mb-10">发送消息</h3>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormGroup
              label="姓名"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入您的姓名"
            />
            
            <FormGroup
              label="邮箱"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入您的邮箱"
            />
            
            <FormGroup
              label="主题"
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="请输入消息主题"
            />
            
            <div className="form-group">
              <label htmlFor="message" className="form-label">消息</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="请输入您的消息"
                className="form-textarea"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full py-3.5 text-base"
            >
              发送消息
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Contact Info Item Component
function ContactInfoItem({ title, value, isLink = false, href = '' }: { title: string; value: string; isLink?: boolean; href?: string }) {
  return (
    <div>
      <h4 className="text-sm text-[#86868b] font-medium mb-3 uppercase tracking-wider">{title}</h4>
      {isLink ? (
        <a 
          href={href} 
          className="text-base text-[#0071e3] hover:underline transition-colors duration-300"
        >
          {value}
        </a>
      ) : (
        <p className="text-base text-black">{value}</p>
      )}
    </div>
  )
}

// Form Group Component
function FormGroup({ label, id, name, type, value, onChange, required, placeholder }: { 
  label: string; 
  id: string; 
  name: string; 
  type: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  placeholder: string;
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  )
}

// Social Link Component
function SocialLink({ href, children, ariaLabel }: { href: string; children: React.ReactNode; ariaLabel: string }) {
  return (
    <a 
      href={href} 
      aria-label={ariaLabel}
      className="text-[#86868b] hover:text-[#0071e3] transition-all duration-300 ease-in-out transform hover:scale-110"
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export default Contact