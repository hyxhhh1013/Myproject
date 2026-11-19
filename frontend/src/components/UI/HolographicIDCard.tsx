import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Github,
  Check,
  Copy,
  MapPin,
  ArrowUpRight,
  Award,
  User,
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useI18n } from '../../i18n/i18nContext';
import { playCardFlip, playSuccessChime } from '../../utils/soundEffects';

interface HolographicIDCardProps {
  name?: string;
  title?: string;
  avatarUrl?: string;
  avatarThumbnailUrl?: string;
  className?: string;
}

const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/hyxhhh1013';

export const HolographicIDCard: React.FC<HolographicIDCardProps> = ({
  name,
  title,
  avatarUrl,
  avatarThumbnailUrl,
  className = '',
}) => {
  const { t, td } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // Gentle, restrained 3.5-degree tilt so buttons never shift away from the cursor
    setTilt({
      rotateX: (0.5 - relY) * 4,
      rotateY: (relX - 0.5) * 4,
      glareX: relX * 100,
      glareY: relY * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('hyxhhh1013@gmail.com');
    playSuccessChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSwitchSide = (side: 'front' | 'back') => {
    if (side === activeSide) return;
    playCardFlip();
    setActiveSide(side);
  };

  const resolvedAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : DEFAULT_AVATAR;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0 select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full rounded-xl overflow-hidden flex flex-col justify-between min-h-[436px] p-7 bg-[#FFFFFF]/80 dark:bg-[#161614]/90 backdrop-blur-sm border designer-hairline shadow-[0_1px_2px_rgba(20,20,19,0.03)]"
      >
        {/* Subtle Warm Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(138, 111, 72, 0.12), transparent 65%)`,
          }}
        />

        {/* Top Segmented Mode Bar — Architectural Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-4 border-b designer-hairline">
          <div className="inline-flex p-0.5 rounded-md bg-[#F3F1EC] dark:bg-[#22221F] border designer-hairline">
            <button
              type="button"
              data-sfx="custom"
              onClick={() => handleSwitchSide('front')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
                activeSide === 'front'
                  ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold'
                  : 'text-[#5F5E58] dark:text-[#C8C5BC] hover:designer-text-primary'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{td('档案', 'DOSSIER')}</span>
            </button>
            <button
              type="button"
              data-sfx="custom"
              onClick={() => handleSwitchSide('back')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
                activeSide === 'back'
                  ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F2F0EA] dark:text-[#141413] font-semibold'
                  : 'text-[#5F5E58] dark:text-[#C8C5BC] hover:designer-text-primary'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>{td('荣誉 & 奖项', 'HONORS')}</span>
            </button>
          </div>

          <span className="text-[11px] font-mono tracking-wider designer-text-secondary">HYX // ’28</span>
        </div>

        {/* Center Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-5">
          {activeSide === 'front' ? (
            <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-[84px] h-[84px] rounded-xl overflow-hidden border designer-hairline bg-[#F3F1EC] dark:bg-[#22221F] shrink-0">
                    <ImageWithFallback
                      src={resolvedAvatar}
                      thumbnailSrc={avatarThumbnailUrl || resolvedAvatar}
                      alt={name || 'Huang Yixuan'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      <span>{td('可立即到岗 · 深/杭/长', 'AVAILABLE NOW')}</span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight designer-heading truncate">
                      {td(name && name !== '加载中...' ? name : '黄奕轩', 'Huang Yixuan')}
                    </h2>
                    <p className="text-xs sm:text-[13px] designer-text-secondary truncate mt-0.5">
                      {td(
                        title && title !== '在读学生' && !title.includes('前端')
                          ? title
                          : 'AI Agent 工程 / FDE 驻场实习生',
                        'AI Agent & FDE Engineer Intern',
                      )}
                    </p>
                    <p className="text-[11px] font-mono designer-text-muted mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8A6F48] shrink-0" />
                      <span className="truncate">{td('湖南农业大学 · 计科 ’28', 'HNUA · CS \'28')}</span>
                    </p>
                  </div>
                </div>

                {/* Editorial Proof Metrics & Ledger */}
                <div className="rounded-lg bg-[#FAF9F5]/90 dark:bg-[#1B1B18] border designer-hairline divide-y designer-hairline">
                  <div className="px-4 py-3 flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] designer-text-muted">
                      AI WORKFLOW
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-mono font-semibold tracking-tight text-[#8A6F48] dark:text-[#C8A97E]">
                        200M+
                      </span>
                      <span className="text-[11px] font-mono designer-text-muted">Tokens / Day</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] uppercase tracking-[0.12em] designer-text-muted">RESIDENCY</span>
                    <span className="font-medium designer-text-primary">
                      {td('洋葱教育 · FDE 驻场', 'Onion Edu · FDE')}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] uppercase tracking-[0.12em] designer-text-muted">RESEARCH</span>
                    <a
                      href="https://ai4science.hyxhhh.site/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#8A6F48] dark:text-[#C8A97E] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>{td('禾书耕文 AI4Science', 'HeShu AI4Science')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8A6F48] dark:text-[#C8A97E]">
                  SELECTED HONORS (2025 — 2026)
                </div>

                <div className="rounded-lg bg-[#FAF9F5]/90 dark:bg-[#1B1B18] border designer-hairline divide-y designer-hairline text-xs">
                  {[
                    { zh: '字节跳动 Trae · 中南大学', prizeZh: '二等奖', en: 'ByteDance Trae · CSU', prizeEn: '2nd' },
                    { zh: '字节跳动 Trae · 湖南农大', prizeZh: '三等奖', en: 'ByteDance Trae · HNUA', prizeEn: '3rd' },
                    { zh: 'LEV0 黑客松 · 2026.06', prizeZh: '最佳创意奖', en: 'LEV0 Hackathon', prizeEn: 'Best Idea' },
                    { zh: '湖南省大学生创新大赛校赛', prizeZh: '二等奖', en: 'Hunan Innovation Contest', prizeEn: '2nd' },
                    { zh: '湖南省程序设计大赛 · 网安', prizeZh: '三等奖', en: 'Hunan Programming (Sec)', prizeEn: '3rd' },
                  ].map((h, i) => (
                    <div key={i} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <span className="designer-text-primary truncate">{td(h.zh, h.en)}</span>
                      <span className="font-mono text-[11px] text-[#8A6F48] dark:text-[#C8A97E] shrink-0">
                        {td(h.prizeZh, h.prizeEn)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Bottom Action Bar */}
        <div className="relative z-10 pt-4 border-t designer-hairline flex items-center justify-between gap-2">
          <button
            type="button"
            data-sfx="custom"
            onClick={handleCopyEmail}
            className="flex-1 py-2.5 px-3.5 rounded-lg bg-[#F3F1EC]/85 dark:bg-[#1E1E1B] border designer-hairline hover:border-[#8A6F48]/40 transition-colors text-xs font-mono flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8A6F48]" />}
            <span className="truncate">{copied ? t('idcard.copied') : 'hyxhhh1013@gmail.com'}</span>
          </button>

          <a
            href="https://github.com/hyxhhh1013"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg bg-[#F3F1EC]/85 dark:bg-[#1E1E1B] border designer-hairline hover:border-[#8A6F48]/40 transition-colors"
            aria-label="GitHub"
            title="GitHub @hyxhhh1013"
          >
            <Github className="w-4 h-4 stroke-[1.5]" />
          </a>

          <a
            href="mailto:hyxhhh1013@gmail.com"
            className="p-2.5 rounded-lg bg-[#F3F1EC]/85 dark:bg-[#1E1E1B] border designer-hairline hover:border-[#8A6F48]/40 transition-colors"
            aria-label="Send Email"
            title="hyxhhh1013@gmail.com"
          >
            <Mail className="w-4 h-4 stroke-[1.5]" />
          </a>
        </div>
      </motion.div>
    </div>
  );
};
