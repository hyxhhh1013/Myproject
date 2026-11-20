import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Eye,
  EyeOff,
  Shuffle,
  Sparkles,
  Check,
  List,
  Layers,
} from 'lucide-react';
import {
  EXAM_META,
  EXAM_TIPS,
  CO_QUESTIONS,
  CoQuestion,
  QuestionSection,
} from '../data/coExamReview';
import {
  Q1AddressingDiagram,
  Q2MemoryPinsDiagram,
  Q3DecToBinDiagram,
  Q4MixedRadixDiagram,
  Q5RamPinsDiagram,
  Q6FloatFlowDiagram,
  Q7CacheMappingDiagram,
  Q8HanziEncodingDiagram,
  Q9MicroInstructionDiagram,
  Q10InstVsDataDiagram,
  Q11CacheSetAssocDiagram,
  Q12MicroprogramDiagram,
  Q13SramWiringDiagram,
} from '../components/CoExamDiagrams';

type MasteryStatus = 'unseen' | 'mastered' | 'review';
type FilterMode = 'all' | QuestionSection | 'review';
type ViewMode = 'focus' | 'all';

const STORAGE_KEY = 'co_exam_review_progress_v1';

const normalizeText = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/～/g, '~')
    .replace(/－|—|–/g, '-')
    .replace(/：/g, ':')
    .replace(/（/g, '(')
    .replace(/）/g, ')');

interface CacheVariant {
  isOriginal: boolean;
  lines: number;
  ways: number;
  blocksK: number;
  wordsPerBlock: number;
  offsetBits: number;
  blockBits: number;
  totalBits: number;
  setBits: number;
  tagBits: number;
}

const ORIGINAL_CACHE_VARIANT: CacheVariant = {
  isOriginal: true,
  lines: 64,
  ways: 4,
  blocksK: 4,
  wordsPerBlock: 128,
  offsetBits: 7,
  blockBits: 12,
  totalBits: 19,
  setBits: 4,
  tagBits: 8,
};

const CACHE_VARIANT_POOL: Omit<CacheVariant, 'isOriginal' | 'offsetBits' | 'blockBits' | 'totalBits' | 'setBits' | 'tagBits'>[] = [
  { lines: 128, ways: 4, blocksK: 4, wordsPerBlock: 256 },
  { lines: 128, ways: 8, blocksK: 8, wordsPerBlock: 128 },
  { lines: 256, ways: 4, blocksK: 16, wordsPerBlock: 64 },
  { lines: 64, ways: 2, blocksK: 8, wordsPerBlock: 256 },
  { lines: 32, ways: 4, blocksK: 2, wordsPerBlock: 64 },
  { lines: 256, ways: 8, blocksK: 32, wordsPerBlock: 128 },
];

function buildCacheVariant(cfg: { lines: number; ways: number; blocksK: number; wordsPerBlock: number }): CacheVariant {
  const offsetBits = Math.round(Math.log2(cfg.wordsPerBlock));
  const blockBits = 10 + Math.round(Math.log2(cfg.blocksK));
  const totalBits = blockBits + offsetBits;
  const setBits = Math.round(Math.log2(cfg.lines / cfg.ways));
  const tagBits = blockBits - setBits;
  return {
    isOriginal: false,
    ...cfg,
    offsetBits,
    blockBits,
    totalBits,
    setBits,
    tagBits,
  };
}

interface QuestionCardProps {
  q: CoQuestion;
  status: MasteryStatus;
  onStatusChange: (id: number, status: MasteryStatus) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ q, status, onStatusChange }) => {
  // Common reveal state
  const [revealed, setRevealed] = useState(false);

  // 1. single-blank
  const [singleInput, setSingleInput] = useState('');
  const [singleResult, setSingleResult] = useState<'idle' | 'correct' | 'secondary' | 'wrong'>('idle');

  // 2. multi-ordered (Q6)
  const [orderedInputs, setOrderedInputs] = useState<string[]>(() =>
    (q.orderedSlots || []).map(() => ''),
  );
  const [orderedResults, setOrderedResults] = useState<(boolean | null)[]>(() =>
    (q.orderedSlots || []).map(() => null),
  );

  // 3. cache-two-groups (Q7)
  const [groupAInputs, setGroupAInputs] = useState<string[]>(['', '', '']);
  const [groupBInputs, setGroupBInputs] = useState<string[]>(['', '', '']);
  const [groupAResults, setGroupAResults] = useState<(boolean | null)[]>([null, null, null]);
  const [groupBResults, setGroupBResults] = useState<(boolean | null)[]>([null, null, null]);
  const [fifoWarning, setFifoWarning] = useState<string | null>(null);

  // 4. short-answer (Q8-Q10)
  const [shortText, setShortText] = useState('');
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});

  // 5. cache-address (Q11)
  const [cacheVariant, setCacheVariant] = useState<CacheVariant>(ORIGINAL_CACHE_VARIANT);
  const [cacheInputs, setCacheInputs] = useState({ total: '', tag: '', set: '', offset: '' });
  const [cacheResults, setCacheResults] = useState<Record<string, boolean | null>>({
    total: null,
    tag: null,
    set: null,
    offset: null,
  });

  // 6. microprogram (Q12)
  const [microMode, setMicroMode] = useState<'hex' | 'full'>('hex');
  const [microInputs, setMicroInputs] = useState<Record<string, string>>({});
  const [microChecked, setMicroChecked] = useState(false);
  const [showMicroRef, setShowMicroRef] = useState(false);

  // 7. sram-expansion (Q13)
  const [sramInputs, setSramInputs] = useState<Record<string, string>>({});
  const [sramResults, setSramResults] = useState<Record<string, boolean | null>>({});
  const [sramCheckedRubric, setSramCheckedRubric] = useState<Record<number, boolean>>({});

  // Reset local interactive state when switching question in focus mode
  useEffect(() => {
    setRevealed(false);
    setSingleInput('');
    setSingleResult('idle');
    setOrderedInputs((q.orderedSlots || []).map(() => ''));
    setOrderedResults((q.orderedSlots || []).map(() => null));
    setGroupAInputs(['', '', '']);
    setGroupBInputs(['', '', '']);
    setGroupAResults([null, null, null]);
    setGroupBResults([null, null, null]);
    setFifoWarning(null);
    setShortText('');
    setCheckedPoints({});
    setCacheVariant(ORIGINAL_CACHE_VARIANT);
    setCacheInputs({ total: '', tag: '', set: '', offset: '' });
    setCacheResults({ total: null, tag: null, set: null, offset: null });
    setMicroInputs({});
    setMicroChecked(false);
    setShowMicroRef(false);
    setSramInputs({});
    setSramResults({});
    setSramCheckedRubric({});
  }, [q.id]);

  // Handlers
  const checkSingleBlank = (e?: React.FormEvent) => {
    e?.preventDefault();
    const norm = normalizeText(singleInput);
    if (!norm) return;
    if (q.acceptedAnswers?.some((a) => normalizeText(a) === norm)) {
      setSingleResult('correct');
      setRevealed(true);
      onStatusChange(q.id, 'mastered');
    } else if (q.secondaryAccepted?.answers.some((a) => normalizeText(a) === norm)) {
      setSingleResult('secondary');
      setRevealed(true);
      onStatusChange(q.id, 'mastered');
    } else {
      setSingleResult('wrong');
      setRevealed(true);
      onStatusChange(q.id, 'review');
    }
  };

  const checkMultiOrdered = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.orderedSlots) return;
    const res = q.orderedSlots.map((slot, i) => {
      const val = normalizeText(orderedInputs[i] || '');
      return slot.accepted.some((a) => normalizeText(a) === val);
    });
    setOrderedResults(res);
    setRevealed(true);
    const allCorrect = res.every(Boolean);
    onStatusChange(q.id, allCorrect ? 'mastered' : 'review');
  };

  const checkCacheTwoGroups = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.groupA || !q.groupB) return;

    const matchSet = (
      inputs: string[],
      items: { canonical: string; aliases: string[] }[],
    ) => {
      const used = new Set<number>();
      return inputs.map((raw) => {
        const norm = normalizeText(raw);
        if (!norm) return false;
        const idx = items.findIndex(
          (item, i) => !used.has(i) && item.aliases.some((al) => normalizeText(al) === norm),
        );
        if (idx !== -1) {
          used.add(idx);
          return true;
        }
        return false;
      });
    };

    // Check forbidden FIFO
    let warn: string | null = null;
    for (const raw of groupBInputs) {
      const norm = normalizeText(raw);
      const hit = q.groupB.forbidden?.find((f) => norm.includes(normalizeText(f.word)));
      if (hit) {
        warn = hit.warning;
        break;
      }
    }
    setFifoWarning(warn);

    const resA = matchSet(groupAInputs, q.groupA.items);
    const resB = matchSet(groupBInputs, q.groupB.items);
    setGroupAResults(resA);
    setGroupBResults(resB);
    setRevealed(true);
    onStatusChange(q.id, resA.every(Boolean) && resB.every(Boolean) ? 'mastered' : 'review');
  };

  const checkCacheAddress = (e?: React.FormEvent) => {
    e?.preventDefault();
    const expected = {
      total: cacheVariant.totalBits,
      tag: cacheVariant.tagBits,
      set: cacheVariant.setBits,
      offset: cacheVariant.offsetBits,
    };
    const res: Record<string, boolean> = {
      total: Number(cacheInputs.total.trim()) === expected.total,
      tag: Number(cacheInputs.tag.trim()) === expected.tag,
      set: Number(cacheInputs.set.trim()) === expected.set,
      offset: Number(cacheInputs.offset.trim()) === expected.offset,
    };
    setCacheResults(res);
    setRevealed(true);
    const allRight = Object.values(res).every(Boolean);
    onStatusChange(q.id, allRight ? 'mastered' : 'review');
  };

  const switchToRandomCacheVariant = () => {
    const others = CACHE_VARIANT_POOL.filter(
      (c) =>
        !(
          c.lines === cacheVariant.lines &&
          c.ways === cacheVariant.ways &&
          c.blocksK === cacheVariant.blocksK &&
          c.wordsPerBlock === cacheVariant.wordsPerBlock
        ),
    );
    const pick = others[Math.floor(Math.random() * others.length)];
    setCacheVariant(buildCacheVariant(pick));
    setCacheInputs({ total: '', tag: '', set: '', offset: '' });
    setCacheResults({ total: null, tag: null, set: null, offset: null });
    setRevealed(false);
  };

  const resetToOriginalCache = () => {
    setCacheVariant(ORIGINAL_CACHE_VARIANT);
    setCacheInputs({ total: '', tag: '', set: '', offset: '' });
    setCacheResults({ total: null, tag: null, set: null, offset: null });
    setRevealed(false);
  };

  const checkMicroprogram = () => {
    if (!q.microprogramRows) return;
    setMicroChecked(true);
    setRevealed(true);
    const fields =
      microMode === 'hex'
        ? (['hex24'] as const)
        : (['wrrdiom', 's3s0', 'aField', 'bField', 'cField', 'ma5ma0', 'hex24'] as const);
    let allRight = true;
    for (const row of q.microprogramRows) {
      for (const f of fields) {
        const key = `${row.addr}_${f}`;
        const raw = normalizeText(microInputs[key] || '');
        const target = normalizeText(row[f]);
        const ok =
          f === 'hex24'
            ? raw === target || raw === target.replace(/h$/, '')
            : raw === target;
        if (!ok) allRight = false;
      }
    }
    onStatusChange(q.id, allRight ? 'mastered' : 'review');
  };

  const checkSramExpansion = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.sramFields) return;
    const res: Record<string, boolean> = {};
    for (const f of q.sramFields) {
      const val = normalizeText(sramInputs[f.key] || '');
      res[f.key] = f.accepted.some((a) => normalizeText(a) === val);
    }
    setSramResults(res);
    setRevealed(true);
    onStatusChange(q.id, Object.values(res).every(Boolean) ? 'mastered' : 'review');
  };

  const statusBadge =
    status === 'mastered' ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
        <CheckCircle2 className="w-3 h-3" /> 已掌握
      </span>
    ) : status === 'review' ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/12 text-amber-800 dark:text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3 h-3" /> 待巩固
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono designer-text-muted border designer-hairline">
        未作答
      </span>
    );

  return (
    <article className="rounded-2xl bg-white dark:bg-[#151513] border designer-hairline shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 sm:px-7 py-4 border-b designer-hairline flex flex-wrap items-center justify-between gap-2 bg-[#FAF9F5]/70 dark:bg-[#1A1916]/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
            {q.label}
          </span>
          <span className="text-xs designer-text-muted">·</span>
          <span className="text-xs font-mono designer-text-muted">{q.sectionLabel}</span>
          {q.tag && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#8A6F48]/12 text-[#8A6F48] dark:bg-[#C8A97E]/15 dark:text-[#C8A97E]">
              {q.tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">{statusBadge}</div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-7 space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold designer-text-primary tracking-tight">
            {q.title}
          </h2>
          {q.interactiveType === 'cache-address' ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetToOriginalCache}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    cacheVariant.isOriginal
                      ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] border-transparent'
                      : 'designer-text-secondary border designer-hairline hover:border-[#8A6F48]'
                  }`}
                >
                  课堂原题
                </button>
                <button
                  type="button"
                  onClick={switchToRandomCacheVariant}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    !cacheVariant.isOriginal
                      ? 'bg-[#8A6F48] text-[#FAF9F5] border-transparent'
                      : 'text-[#8A6F48] dark:text-[#C8A97E] border-[#8A6F48]/40 hover:bg-[#8A6F48]/10'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  换参变式演练
                </button>
              </div>
              <p className="text-[15px] leading-relaxed designer-text-primary">
                一个组相联 Cache 由 <strong className="font-mono text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.lines}</strong> 个行组成，每组{' '}
                <strong className="font-mono text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.ways}</strong> 行。主存储器包含{' '}
                <strong className="font-mono text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.blocksK}K</strong> 个块，每块{' '}
                <strong className="font-mono text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.wordsPerBlock}</strong> 个字。请表示内存地址的格式。
              </p>
            </div>
          ) : (
            <p className="mt-2.5 text-[15px] leading-relaxed designer-text-primary">{q.prompt}</p>
          )}
        </div>

        {/* === INTERACTIVE AREA BY TYPE === */}

        {/* 1. Single Blank (Q1-Q5) */}
        {q.interactiveType === 'single-blank' && (
          <form onSubmit={checkSingleBlank} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={singleInput}
                onChange={(e) => {
                  setSingleInput(e.target.value);
                  if (singleResult !== 'idle') setSingleResult('idle');
                }}
                placeholder={q.placeholder || '输入你的答案…'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border designer-hairline focus:border-[#8A6F48] dark:focus:border-[#C8A97E] outline-none font-mono text-sm designer-text-primary"
              />
              <button
                type="submit"
                disabled={!singleInput.trim()}
                className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium disabled:opacity-40 whitespace-nowrap"
              >
                提交判题
              </button>
            </div>
            {singleResult === 'correct' && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>回答正确！已自动标记为「已掌握」。</span>
              </div>
            )}
            {singleResult === 'secondary' && q.secondaryAccepted && (
              <div className="flex items-start gap-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{q.secondaryAccepted.message}</span>
              </div>
            )}
            {singleResult === 'wrong' && (
              <div className="flex items-center gap-2 text-xs font-mono text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>答案有偏差，已加入「待巩固」，请对照下方解析再算一遍。</span>
              </div>
            )}
          </form>
        )}

        {/* 2. Multi Ordered (Q6) */}
        {q.interactiveType === 'multi-ordered' && q.orderedSlots && (
          <form onSubmit={checkMultiOrdered} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {q.orderedSlots.map((slot, idx) => {
                const state = orderedResults[idx];
                return (
                  <div key={slot.label} className="space-y-1">
                    <label className="block text-[11px] font-mono designer-text-muted">
                      {slot.label}
                    </label>
                    <input
                      type="text"
                      value={orderedInputs[idx] || ''}
                      onChange={(e) => {
                        const next = [...orderedInputs];
                        next[idx] = e.target.value;
                        setOrderedInputs(next);
                      }}
                      placeholder={`第 ${idx + 1} 步`}
                      className={`w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none text-sm designer-text-primary transition-colors ${
                        state === true
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : state === false
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'designer-hairline focus:border-[#8A6F48]'
                      }`}
                    />
                    {state === false && (
                      <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                        应为：{slot.display}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium"
            >
              检查 5 个步骤
            </button>
          </form>
        )}

        {/* 3. Cache Two Groups (Q7) */}
        {q.interactiveType === 'cache-two-groups' && q.groupA && q.groupB && (
          <form onSubmit={checkCacheTwoGroups} className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-mono font-medium designer-text-secondary">
                {q.groupA.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {groupAInputs.map((val, idx) => (
                  <input
                    key={`a-${idx}`}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const next = [...groupAInputs];
                      next[idx] = e.target.value;
                      setGroupAInputs(next);
                    }}
                    placeholder={`映射方式 ${idx + 1}`}
                    className={`px-3.5 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none text-sm designer-text-primary ${
                      groupAResults[idx] === true
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : groupAResults[idx] === false
                        ? 'border-rose-500 bg-rose-500/5'
                        : 'designer-hairline focus:border-[#8A6F48]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-medium designer-text-secondary">
                {q.groupB.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {groupBInputs.map((val, idx) => (
                  <input
                    key={`b-${idx}`}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const next = [...groupBInputs];
                      next[idx] = e.target.value;
                      setGroupBInputs(next);
                    }}
                    placeholder={`替换算法 ${idx + 1}`}
                    className={`px-3.5 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none text-sm designer-text-primary ${
                      groupBResults[idx] === true
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : groupBResults[idx] === false
                        ? 'border-rose-500 bg-rose-500/5'
                        : 'designer-hairline focus:border-[#8A6F48]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {fifoWarning && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/12 border border-rose-500/35 text-xs leading-relaxed text-rose-700 dark:text-rose-300 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{fifoWarning}</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium"
            >
              提交判题
            </button>
          </form>
        )}

        {/* 4. Short Answer (Q8-Q10) */}
        {q.interactiveType === 'short-answer' && (
          <div className="space-y-3.5">
            <textarea
              rows={4}
              value={shortText}
              onChange={(e) => setShortText(e.target.value)}
              placeholder="先自己默写要点，再点击下方「核对参考答案」对照踩分点自评…"
              className="w-full px-4 py-3 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border designer-hairline focus:border-[#8A6F48] dark:focus:border-[#C8A97E] outline-none text-sm leading-relaxed designer-text-primary resize-y"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl designer-btn-primary font-mono text-xs font-medium"
              >
                {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{revealed ? '收起参考答案' : '核对参考答案与踩分点'}</span>
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(q.id, 'mastered')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                我背熟了 · 标记已掌握
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(q.id, 'review')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-amber-500/35 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                加入待巩固
              </button>
            </div>
          </div>
        )}

        {/* 5. Cache Address Format (Q11) */}
        {q.interactiveType === 'cache-address' && (
          <form onSubmit={checkCacheAddress} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'total' as const, label: '主存地址总位数', ans: cacheVariant.totalBits },
                { key: 'tag' as const, label: '标记 (Tag) 位数', ans: cacheVariant.tagBits },
                { key: 'set' as const, label: '组号 (Set) 位数', ans: cacheVariant.setBits },
                { key: 'offset' as const, label: '块内字地址 (Offset)', ans: cacheVariant.offsetBits },
              ].map((item) => {
                const st = cacheResults[item.key];
                return (
                  <div key={item.key} className="space-y-1">
                    <label className="block text-[11px] font-mono designer-text-muted">
                      {item.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={cacheInputs[item.key]}
                        onChange={(e) =>
                          setCacheInputs((prev) => ({ ...prev, [item.key]: e.target.value }))
                        }
                        placeholder="位数"
                        className={`w-full px-3 py-2 pr-8 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none font-mono text-sm designer-text-primary ${
                          st === true
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : st === false
                            ? 'border-rose-500 bg-rose-500/5'
                            : 'designer-hairline focus:border-[#8A6F48]'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono designer-text-muted">
                        位
                      </span>
                    </div>
                    {st === false && (
                      <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                        正确：{item.ans} 位
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium"
            >
              提交计算结果
            </button>
          </form>
        )}

        {/* 6. Microprogram (Q12) */}
        {q.interactiveType === 'microprogram' && q.microprogramRows && (
          <div className="space-y-4">
            {/* Flow & Format Reference */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border designer-hairline space-y-2">
                <div className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
                  1. 流程图逻辑梳理
                </div>
                {q.microprogramFlow?.map((g) => (
                  <div key={g.group} className="space-y-1">
                    <div className="text-xs font-semibold designer-text-primary">{g.group}</div>
                    <ul className="space-y-0.5 text-xs designer-text-secondary font-mono">
                      {g.lines.map((l) => (
                        <li key={l}>• {l}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border designer-hairline space-y-2">
                <div className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
                  2. 24 位微指令格式（混合表示法）与字段编码
                </div>
                <ul className="space-y-1.5 text-xs designer-text-secondary font-mono leading-relaxed">
                  {q.microprogramFormat?.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Difficulty Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMicroMode('hex');
                    setMicroChecked(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    microMode === 'hex'
                      ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] border-transparent'
                      : 'designer-text-secondary border designer-hairline'
                  }`}
                >
                  模式 A：只填 24 位十六进制
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMicroMode('full');
                    setMicroChecked(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    microMode === 'full'
                      ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] border-transparent'
                      : 'designer-text-secondary border designer-hairline'
                  }`}
                >
                  模式 B：全字段逐位填空
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowMicroRef((v) => !v)}
                className="text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline"
              >
                {showMicroRef ? '隐藏完整参考表' : '直接看完整参考表'}
              </button>
            </div>

            {/* Interactive Table */}
            <div className="overflow-x-auto rounded-xl border designer-hairline">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#FAF9F5] dark:bg-[#1A1916] border-b designer-hairline designer-text-muted">
                    <th className="py-2.5 px-2.5 whitespace-nowrap">微地址</th>
                    {microMode === 'full' && (
                      <>
                        <th className="py-2.5 px-2 whitespace-nowrap">M23,22</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">WR,RD,IOM</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">S3-S0</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">A(3)</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">B(3)</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">C(3)</th>
                        <th className="py-2.5 px-2 whitespace-nowrap">MA5-0(6)</th>
                      </>
                    )}
                    <th className="py-2.5 px-2.5 whitespace-nowrap">对应十六进制 (24位)</th>
                    <th className="py-2.5 px-2.5">微操作说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y designer-hairline">
                  {q.microprogramRows.map((row) => {
                    const renderCell = (
                      field: 'wrrdiom' | 's3s0' | 'aField' | 'bField' | 'cField' | 'ma5ma0' | 'hex24',
                      widthClass: string,
                      placeholder: string,
                    ) => {
                      const key = `${row.addr}_${field}`;
                      const val = microInputs[key] || '';
                      const target = row[field];
                      const normVal = normalizeText(val);
                      const normTarget = normalizeText(target);
                      const isOk =
                        field === 'hex24'
                          ? normVal === normTarget || normVal === normTarget.replace(/h$/, '')
                          : normVal === normTarget;

                      return (
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setMicroInputs((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            placeholder={placeholder}
                            className={`${widthClass} px-2 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none text-xs font-mono designer-text-primary ${
                              microChecked
                                ? isOk
                                  ? 'border-emerald-500 bg-emerald-500/10'
                                  : 'border-rose-500 bg-rose-500/10'
                                : 'designer-hairline focus:border-[#8A6F48]'
                            }`}
                          />
                          {microChecked && !isOk && (
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                              {target}
                            </div>
                          )}
                        </td>
                      );
                    };

                    return (
                      <tr key={row.addr} className="hover:bg-[#FAF9F5]/50 dark:hover:bg-[#1E1D1A]/50">
                        <td className="py-2 px-2.5 font-bold text-[#8A6F48] dark:text-[#C8A97E]">
                          {row.addr}H
                        </td>
                        {microMode === 'full' && (
                          <>
                            <td className="py-2 px-2 designer-text-muted">
                              {row.m23m22}
                              {row.note || ''}
                            </td>
                            {renderCell('wrrdiom', 'w-14', '000')}
                            {renderCell('s3s0', 'w-16', '0000')}
                            {renderCell('aField', 'w-14', '000')}
                            {renderCell('bField', 'w-14', '000')}
                            {renderCell('cField', 'w-14', '000')}
                            {renderCell('ma5ma0', 'w-20', '000000')}
                          </>
                        )}
                        {renderCell('hex24', 'w-24', '如 000001H')}
                        <td className="py-2 px-2.5 font-sans text-xs designer-text-secondary">
                          {row.desc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={checkMicroprogram}
                className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium"
              >
                核对微程序表
              </button>
              <button
                type="button"
                onClick={() => {
                  setMicroInputs({});
                  setMicroChecked(false);
                }}
                className="px-4 py-2.5 rounded-xl border designer-hairline font-mono text-xs designer-text-secondary hover:border-[#8A6F48]"
              >
                清空重填
              </button>
            </div>

            {showMicroRef && (
              <div className="overflow-x-auto rounded-xl border border-[#8A6F48]/30 bg-[#FAF9F5] dark:bg-[#121210] p-3">
                <div className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E] mb-2">
                  参考微程序答案表（完整 24 位）
                </div>
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b designer-hairline designer-text-muted">
                      <th className="py-1.5 px-2">微地址</th>
                      <th className="py-1.5 px-2">M23,22</th>
                      <th className="py-1.5 px-2">WR,RD,IOM</th>
                      <th className="py-1.5 px-2">S3-S0</th>
                      <th className="py-1.5 px-2">A</th>
                      <th className="py-1.5 px-2">B</th>
                      <th className="py-1.5 px-2">C</th>
                      <th className="py-1.5 px-2">MA5-0</th>
                      <th className="py-1.5 px-2">十六进制</th>
                      <th className="py-1.5 px-2">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y designer-hairline">
                    {q.microprogramRows.map((r) => (
                      <tr key={`ref-${r.addr}`}>
                        <td className="py-1.5 px-2 font-bold">{r.addr}</td>
                        <td className="py-1.5 px-2">
                          {r.m23m22}
                          {r.note || ''}
                        </td>
                        <td className="py-1.5 px-2">{r.wrrdiom}</td>
                        <td className="py-1.5 px-2">{r.s3s0}</td>
                        <td className="py-1.5 px-2">{r.aField}</td>
                        <td className="py-1.5 px-2">{r.bField}</td>
                        <td className="py-1.5 px-2">{r.cField}</td>
                        <td className="py-1.5 px-2">{r.ma5ma0}</td>
                        <td className="py-1.5 px-2 font-bold text-[#8A6F48] dark:text-[#C8A97E]">
                          {r.hex24}
                        </td>
                        <td className="py-1.5 px-2 font-sans designer-text-secondary">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {q.microprogramFootnote && (
                  <p className="mt-2 text-[11px] designer-text-muted">{q.microprogramFootnote}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 7. SRAM Expansion (Q13) */}
        {q.interactiveType === 'sram-expansion' && q.sramFields && (
          <form onSubmit={checkSramExpansion} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {q.sramFields.map((f) => {
                const st = sramResults[f.key];
                return (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-[11px] font-mono designer-text-muted">
                      {f.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sramInputs[f.key] || ''}
                        onChange={(e) =>
                          setSramInputs((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        placeholder="填写答案"
                        className={`w-full px-3 py-2 pr-14 rounded-xl bg-[#FAF9F5] dark:bg-[#0D0D0C] border outline-none font-mono text-sm designer-text-primary ${
                          st === true
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : st === false
                            ? 'border-rose-500 bg-rose-500/5'
                            : 'designer-hairline focus:border-[#8A6F48]'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono designer-text-muted">
                        {f.unit}
                      </span>
                    </div>
                    {st === false && (
                      <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                        正确：{f.display} {f.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl designer-btn-primary font-mono text-xs font-medium"
              >
                核对计算参数
              </button>
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="px-4 py-2.5 rounded-xl border designer-hairline font-mono text-xs designer-text-secondary hover:border-[#8A6F48]"
              >
                {revealed ? '收起连线图与评分规范' : '查看连线图与考场绘图规范'}
              </button>
            </div>
          </form>
        )}

        {/* Reveal Toggle for Objective Questions */}
        {q.interactiveType !== 'short-answer' && q.interactiveType !== 'sram-expansion' && (
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t designer-hairline">
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8A6F48] dark:text-[#C8A97E] hover:underline py-1"
            >
              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{revealed ? '隐藏参考答案与解析' : '直接查看参考答案与解析'}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(q.id, 'mastered')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                标为已掌握
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(q.id, 'review')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10"
              >
                标为待巩固
              </button>
            </div>
          </div>
        )}

        {/* === REFERENCE ANSWER & EXPLANATION PANEL === */}
        {revealed && (
          <div className="rounded-xl bg-[#FAF9F5] dark:bg-[#121210] border border-[#8A6F48]/25 p-4 sm:p-5 space-y-4">
            {/* Answer Summary */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
                参考答案
              </div>
              {q.interactiveType === 'cache-address' && !cacheVariant.isOriginal ? (
                <p className="mt-1 text-sm font-semibold designer-text-primary">
                  主存地址总长为 {cacheVariant.totalBits} 位：标记 ({cacheVariant.tagBits} 位) + 组号 ({cacheVariant.setBits} 位) + 块内字地址 ({cacheVariant.offsetBits} 位)
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold designer-text-primary">{q.answerSummary}</p>
              )}
            </div>

            {/* Visual Bit Allocation Bar for Q11 */}
            {q.interactiveType === 'cache-address' && (
              <div className="space-y-1.5">
                <div className="flex rounded-xl overflow-hidden border border-[#8A6F48]/40 text-center font-mono text-xs">
                  <div
                    style={{ flex: cacheVariant.tagBits }}
                    className="py-2.5 px-2 bg-[#8A6F48]/18 text-[#141413] dark:text-[#FAF9F5] border-r border-[#8A6F48]/35"
                  >
                    <div className="font-semibold">标记 Tag</div>
                    <div className="text-[11px] text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.tagBits} 位</div>
                  </div>
                  <div
                    style={{ flex: cacheVariant.setBits }}
                    className="py-2.5 px-2 bg-[#8A6F48]/10 text-[#141413] dark:text-[#FAF9F5] border-r border-[#8A6F48]/35"
                  >
                    <div className="font-semibold">组号 Set</div>
                    <div className="text-[11px] text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.setBits} 位</div>
                  </div>
                  <div
                    style={{ flex: cacheVariant.offsetBits }}
                    className="py-2.5 px-2 bg-[#FAF9F5] dark:bg-[#1A1916] text-[#141413] dark:text-[#FAF9F5]"
                  >
                    <div className="font-semibold">块内字地址 Offset</div>
                    <div className="text-[11px] text-[#8A6F48] dark:text-[#C8A97E]">{cacheVariant.offsetBits} 位</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-mono designer-text-muted px-1">
                  <span>← 主存块号 {cacheVariant.blockBits} 位 →</span>
                  <span>主存地址共 {cacheVariant.totalBits} 位</span>
                </div>
              </div>
            )}

            {/* Comparison Table for Q9 */}
            {q.comparisonTable && (
              <div className="overflow-x-auto rounded-xl border designer-hairline">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white dark:bg-[#191815] border-b designer-hairline">
                      {q.comparisonTable.headers.map((h) => (
                        <th key={h} className="py-2 px-3 font-semibold designer-text-primary">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y designer-hairline">
                    {q.comparisonTable.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium designer-text-primary whitespace-nowrap">
                          {row[0]}
                        </td>
                        <td className="py-2 px-3 designer-text-secondary">{row[1]}</td>
                        <td className="py-2 px-3 designer-text-secondary">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Self-check Scoring Points for Short Answer */}
            {q.checklist && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider designer-text-muted">
                  踩分点自检（逐项核对是否答全）
                </div>
                <div className="space-y-1.5">
                  {q.checklist.map((pt, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-2.5 text-xs leading-relaxed designer-text-primary cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedPoints[i]}
                        onChange={() =>
                          setCheckedPoints((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        className="mt-0.5 accent-[#8A6F48]"
                      />
                      <span className={checkedPoints[i] ? 'line-through opacity-65' : ''}>{pt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Chart / Schematic Explanation for Every Question (Q1 - Q13) */}
            <div className="space-y-3">
              {q.id === 1 && <Q1AddressingDiagram />}
              {q.id === 2 && <Q2MemoryPinsDiagram />}
              {q.id === 3 && <Q3DecToBinDiagram />}
              {q.id === 4 && <Q4MixedRadixDiagram />}
              {q.id === 5 && <Q5RamPinsDiagram />}
              {q.id === 6 && <Q6FloatFlowDiagram />}
              {q.id === 7 && <Q7CacheMappingDiagram />}
              {q.id === 8 && <Q8HanziEncodingDiagram />}
              {q.id === 9 && <Q9MicroInstructionDiagram />}
              {q.id === 10 && <Q10InstVsDataDiagram />}
              {q.id === 11 && <Q11CacheSetAssocDiagram {...cacheVariant} />}
              {q.id === 12 && <Q12MicroprogramDiagram />}
              {q.id === 13 && <Q13SramWiringDiagram />}
            </div>

            {/* Step-by-step Derivation */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider designer-text-muted">
                详细解析与推导步骤
              </div>
              {q.interactiveType === 'cache-address' && !cacheVariant.isOriginal ? (
                <ul className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed designer-text-secondary">
                  <li>
                    • 1. 块内字地址位数：每块 {cacheVariant.wordsPerBlock} 个字 = 2^{cacheVariant.offsetBits}，故占 <strong>{cacheVariant.offsetBits} 位</strong>。
                  </li>
                  <li>
                    • 2. 主存块号与总地址位数：主存 {cacheVariant.blocksK}K 块 = 2^{cacheVariant.blockBits}，主存块号占 <strong>{cacheVariant.blockBits} 位</strong>；总位数 = {cacheVariant.blockBits} + {cacheVariant.offsetBits} = <strong>{cacheVariant.totalBits} 位</strong>。
                  </li>
                  <li>
                    • 3. Cache 组号位数：{cacheVariant.lines} 行 ÷ 每组 {cacheVariant.ways} 行 = {cacheVariant.lines / cacheVariant.ways} 组 = 2^{cacheVariant.setBits}，组号占 <strong>{cacheVariant.setBits} 位</strong>。
                  </li>
                  <li>
                    • 4. 标记（Tag）位数：主存块号位数 - 组号位数 = {cacheVariant.blockBits} - {cacheVariant.setBits} = <strong>{cacheVariant.tagBits} 位</strong>。
                  </li>
                </ul>
              ) : (
                <ul className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed designer-text-secondary">
                  {q.explanationLines.map((line, i) => (
                    <li key={i} className="whitespace-pre-wrap">
                      • {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {q.sramRubric && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
                  考场绘图得分规范（老师重点强调）
                </div>
                <div className="space-y-1.5">
                  {q.sramRubric.map((item, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-2.5 text-xs leading-relaxed designer-text-primary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!sramCheckedRubric[i]}
                        onChange={() =>
                          setSramCheckedRubric((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        className="mt-0.5 accent-[#8A6F48]"
                      />
                      <span className={sramCheckedRubric[i] ? 'line-through opacity-65' : ''}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pitfall Callout */}
            {q.pitfall && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>易错点：</strong>
                  {q.pitfall}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default function CoExamReview() {
  const [progress, setProgress] = useState<Record<number, MasteryStatus>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  const setQuestionStatus = (id: number, status: MasteryStatus) => {
    setProgress((prev) => ({ ...prev, [id]: status }));
  };

  const resetProgress = () => {
    if (window.confirm('确定清空全部 13 题的刷题进度重新开始吗？')) {
      setProgress({});
      setCurrentIdx(0);
    }
  };

  const stats = useMemo(() => {
    let mastered = 0;
    let review = 0;
    for (const q of CO_QUESTIONS) {
      const st = progress[q.id] || 'unseen';
      if (st === 'mastered') mastered++;
      else if (st === 'review') review++;
    }
    return {
      total: CO_QUESTIONS.length,
      mastered,
      review,
      unseen: CO_QUESTIONS.length - mastered - review,
      pct: Math.round((mastered / CO_QUESTIONS.length) * 100),
    };
  }, [progress]);

  const filteredQuestions = useMemo(() => {
    if (filter === 'all') return CO_QUESTIONS;
    if (filter === 'review') {
      return CO_QUESTIONS.filter((q) => (progress[q.id] || 'unseen') !== 'mastered');
    }
    return CO_QUESTIONS.filter((q) => q.section === filter);
  }, [filter, progress]);

  // Keep currentIdx in bounds when filter changes
  useEffect(() => {
    if (currentIdx >= filteredQuestions.length) {
      setCurrentIdx(0);
    }
  }, [filteredQuestions.length, currentIdx]);

  // Keyboard navigation in focus mode when not typing inside an input/textarea
  useEffect(() => {
    if (viewMode !== 'focus') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIdx((i) => Math.min(filteredQuestions.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, filteredQuestions.length]);

  const currentQuestion = filteredQuestions[currentIdx] || null;

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0D0D0C] pt-24 pb-20 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Masthead */}
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8A6F48] dark:text-[#C8A97E]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>FINAL EXAM DRILL · 计算机组成原理</span>
              </div>
              <h1 className="designer-heading text-2xl sm:text-3xl font-semibold designer-text-primary tracking-tight">
                {EXAM_META.title}
              </h1>
              <p className="text-xs sm:text-[13px] designer-text-muted leading-relaxed">
                {EXAM_META.source}
              </p>
            </div>

            {/* Stats Summary */}
            <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 designer-hairline">
              <div>
                <div className="text-[10px] font-mono designer-text-muted uppercase">已掌握</div>
                <div className="text-xl font-mono font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  {stats.mastered}
                  <span className="text-xs designer-text-muted">/{stats.total}</span>
                </div>
              </div>
              <div className="pl-4 border-l designer-hairline">
                <div className="text-[10px] font-mono designer-text-muted uppercase">待巩固</div>
                <div className="text-xl font-mono font-semibold text-amber-700 dark:text-amber-300 tabular-nums">
                  {stats.review}
                </div>
              </div>
              <div className="pl-4 border-l designer-hairline">
                <button
                  type="button"
                  onClick={resetProgress}
                  title="重置刷题进度"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border designer-hairline text-xs font-mono designer-text-muted hover:text-[#8A6F48] hover:border-[#8A6F48] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-[#E6E2D8] dark:bg-[#23221E] overflow-hidden">
            <div
              className="h-full bg-[#8A6F48] dark:bg-[#C8A97E] transition-all duration-300"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </header>

        {/* Section 1: Exam Tips & Pitfalls (Collapsible) */}
        <section className="rounded-2xl bg-white dark:bg-[#151513] border designer-hairline overflow-hidden">
          <button
            type="button"
            onClick={() => setTipsOpen((v) => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#FAF9F5]/60 dark:hover:bg-[#1C1B18]/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-semibold designer-text-primary">
              <Sparkles className="w-4 h-4 text-[#8A6F48] dark:text-[#C8A97E]" />
              <span>一、考试安排与备考避坑提示（来自课堂录音）</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 designer-text-muted transition-transform ${
                tipsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {tipsOpen && (
            <div className="px-5 pb-5 pt-1 border-t designer-hairline grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXAM_TIPS.map((group) => (
                <div key={group.title} className="space-y-2 pt-3">
                  <h3 className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
                    {group.title}
                  </h3>
                  <ul className="space-y-2 text-xs leading-relaxed designer-text-secondary">
                    {group.items.map((item) => (
                      <li
                        key={item.label}
                        className={
                          item.emphasize
                            ? 'p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-[#141413] dark:text-[#F0EFEA]'
                            : ''
                        }
                      >
                        <strong className="designer-text-primary">{item.label}：</strong>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Controls Bar: Filter + View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `全部 (${CO_QUESTIONS.length})` },
                { id: 'fill', label: '填空与计算 (1-7)' },
                { id: 'short', label: '简答 (8-10)' },
                { id: 'design', label: '综合设计 (11-13)' },
                { id: 'review', label: `未掌握/错题 (${stats.total - stats.mastered})` },
              ] as { id: FilterMode; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id);
                  setCurrentIdx(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors border ${
                  filter === tab.id
                    ? 'bg-[#141413] text-[#FAF9F5] dark:bg-[#F0EFEA] dark:text-[#141413] border-transparent'
                    : 'bg-white dark:bg-[#151513] designer-text-secondary designer-hairline hover:border-[#8A6F48]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-xl bg-white dark:bg-[#151513] border designer-hairline p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('focus')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'focus'
                  ? 'bg-[#8A6F48] text-[#FAF9F5]'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              逐题刷题
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'all'
                  ? 'bg-[#8A6F48] text-[#FAF9F5]'
                  : 'designer-text-muted hover:designer-text-primary'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              全卷总览
            </button>
          </div>
        </div>

        {/* Question Navigator Pills (Focus Mode) */}
        {viewMode === 'focus' && filteredQuestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filteredQuestions.map((q, idx) => {
              const st = progress[q.id] || 'unseen';
              const active = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  title={`${q.label}：${q.title}`}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-semibold transition-all border ${
                    st === 'mastered'
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/35'
                      : st === 'review'
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35'
                      : 'bg-white dark:bg-[#151513] designer-text-secondary designer-hairline'
                  } ${active ? 'ring-2 ring-[#8A6F48] dark:ring-[#C8A97E] scale-105' : 'opacity-85 hover:opacity-100'}`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        )}

        {/* Question Area */}
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#151513] border designer-hairline p-10 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-base font-semibold designer-text-primary">
              当前筛选下的题目已经全部掌握！
            </p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-xl designer-btn-primary font-mono text-xs"
            >
              返回查看全部 13 题
            </button>
          </div>
        ) : viewMode === 'focus' && currentQuestion ? (
          <div className="space-y-4">
            <QuestionCard
              q={currentQuestion}
              status={progress[currentQuestion.id] || 'unseen'}
              onStatusChange={setQuestionStatus}
            />

            {/* Prev / Next Footer */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#151513] border designer-hairline font-mono text-xs designer-text-primary disabled:opacity-35 hover:border-[#8A6F48] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                上一题
              </button>

              <span className="text-xs font-mono designer-text-muted tabular-nums">
                {currentIdx + 1} / {filteredQuestions.length}
                <span className="hidden sm:inline"> · 支持 ← → 键切换</span>
              </span>

              <button
                type="button"
                disabled={currentIdx === filteredQuestions.length - 1}
                onClick={() => setCurrentIdx((i) => Math.min(filteredQuestions.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl designer-btn-primary font-mono text-xs disabled:opacity-35"
              >
                下一题
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                status={progress[q.id] || 'unseen'}
                onStatusChange={setQuestionStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
