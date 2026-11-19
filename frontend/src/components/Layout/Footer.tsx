import { Github, Mail, Command } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { useI18n } from '../../i18n/i18nContext';
import { useAppStore } from '../../store/useAppStore';

export const Footer = () => {
  const [icpCode, setIcpCode] = useState<string>('湘ICP备2025152056号');
  const { td } = useI18n();
  const { setCommandOpen } = useAppStore();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/siteConfig');
        const data = response.data?.data || response.data;
        if (data && data.icpCode) {
          setIcpCode(data.icpCode);
        }
      } catch {
        // Keep default ICP code
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="bg-[#FAF9F5] dark:bg-[#0D0D0C] border-t designer-hairline pt-12 pb-24 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A6F48] dark:bg-[#C9A87C]" />
            <span className="font-serif-editorial text-lg text-[#141413] dark:text-[#F0EFEA]">
              {td('黄奕轩 · Huang Yixuan', 'Huang Yixuan · Portfolio')}
            </span>
          </div>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[#6E6C66] dark:text-[#9E9C94]">
            &copy; {new Date().getFullYear()} {td('黄奕轩 (Huang Yixuan)', 'Huang Yixuan')} · CRAFTED WITH SWISS EDITORIAL GRIDS
          </p>
          {icpCode && (
            <p className="font-mono-tech text-[10px] tracking-[0.14em] text-[#6E6C66]/80 dark:text-[#9E9C94]/80 mt-1">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-colors"
              >
                {icpCode}
              </a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/hyxhhh1013"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub @hyxhhh1013"
            className="p-2.5 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="mailto:hyxhhh1013@gmail.com"
            aria-label="Email hyxhhh1013@gmail.com"
            className="p-2.5 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all"
          >
            <Mail className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Open Command Palette"
            className="px-3.5 py-2 rounded-full bg-[#F3F1EC] dark:bg-[#141413] border designer-hairline text-[#141413] dark:text-[#F0EFEA] hover:border-[#8A6F48] hover:text-[#8A6F48] dark:hover:text-[#C9A87C] transition-all flex items-center gap-1.5 font-mono-tech text-[11px]"
            title={td('打开命令面板 (⌘K)', 'Open Command Palette (⌘K)')}
          >
            <Command className="w-3.5 h-3.5" />
            <span>⌘K</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
