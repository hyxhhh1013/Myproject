import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { ArrowUpRight } from 'lucide-react';

interface TechStackItem {
  name: string;
  tag: string;
}

interface TechStackMarqueeProps {
  items?: TechStackItem[];
  onSelectTech?: (techName: string) => void;
}

const DEFAULT_ITEMS: TechStackItem[] = [
  { name: 'TypeScript', tag: '01 / CORE' },
  { name: 'React 18 / Next.js', tag: '02 / UI' },
  { name: 'LangGraph / RAG', tag: '03 / AGENT' },
  { name: 'Tailwind CSS', tag: '04 / DESIGN' },
  { name: 'Node.js / FastAPI', tag: '05 / API' },
  { name: 'Prisma / PostgreSQL', tag: '06 / DATA' },
  { name: 'Hybrid Search & Rerank', tag: '07 / AI' },
  { name: 'Docker / Linux', tag: '08 / INFRA' },
  { name: 'Framer Motion', tag: '09 / CRAFT' },
];

export const TechStackMarquee: React.FC<TechStackMarqueeProps> = ({
  items = DEFAULT_ITEMS,
  onSelectTech,
}) => {
  const { td } = useI18n();
  const doubledItems = [...items, ...items];

  return (
    <div className="designer-card p-5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b designer-hairline">
        <h3 className="text-[#8E8C84] text-[11px] font-mono uppercase tracking-widest">
          {td('ENGINEERING & AI TOOLCHAIN // 技术栈矩阵', 'ENGINEERING & AI TOOLCHAIN')}
        </h3>
        <span className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">
          {td('CLICK ANY NODE TO INSPECT →', 'CLICK ANY NODE TO INSPECT →')}
        </span>
      </div>

      <div className="relative overflow-hidden py-1 group">
        <div className="flex w-max gap-2.5 animate-[marquee_34s_linear_infinite] group-hover:[animation-play-state:paused]">
          {doubledItems.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              type="button"
              onClick={() => onSelectTech?.(item.name)}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#F6F4EF] dark:bg-[#1E1E1B] hover:bg-[#141413] hover:text-[#FAF9F5] dark:hover:bg-[#F2F0EA] dark:hover:text-[#141413] transition-colors duration-200 rounded-lg border designer-hairline shrink-0 group/pill"
            >
              <span className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] group-hover/pill:text-current opacity-80">
                {item.tag}
              </span>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {item.name}
              </span>
              <ArrowUpRight className="w-3 h-3 opacity-40 group-hover/pill:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
