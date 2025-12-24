import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
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
      </div>
    </footer>
  );
};
