import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';

export const Footer = () => {
  const [icpCode, setIcpCode] = useState<string>('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/siteConfig');
        const data = response.data?.data || response.data;
        if (data && data.icpCode) {
          setIcpCode(data.icpCode);
        }
      } catch (error) {
        console.error('Failed to fetch site config for footer:', error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center space-x-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="mailto:2090862712@qq.com" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Mail className="w-6 h-6" />
          </a>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} 黄奕轩. All rights reserved.
        </p>
        {icpCode && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {icpCode}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
};
