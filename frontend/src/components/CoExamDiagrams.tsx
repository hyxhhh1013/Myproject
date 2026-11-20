import React from 'react';

export interface CacheDiagramProps {
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

/**
 * Q1: 按字编址寻址范围可视化换算 + 幂次速查
 */
export const Q1AddressingDiagram: React.FC = () => (
  <div className="space-y-3">
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
        图解换算链路（先统一单位为 Byte，再除字长）
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center">
        <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <div className="text-[10px] font-mono designer-text-muted">总容量</div>
          <div className="text-sm font-mono font-bold designer-text-primary mt-0.5">256 MB</div>
          <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">2⁸ × 2²⁰ = 2²⁸ B</div>
        </div>
        <div className="text-lg font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">÷</div>
        <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <div className="text-[10px] font-mono designer-text-muted">1 个字的大小</div>
          <div className="text-sm font-mono font-bold designer-text-primary mt-0.5">64 bit → 8 B</div>
          <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">64 ÷ 8 = 2³ B</div>
        </div>
        <div className="text-lg font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">=</div>
        <div className="p-3 rounded-xl bg-[#8A6F48]/12 dark:bg-[#C8A97E]/15 border border-[#8A6F48]/40">
          <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">按字寻址范围</div>
          <div className="text-sm font-mono font-bold designer-text-primary mt-0.5">32M 字 (2²⁵)</div>
          <div className="text-[11px] font-mono text-[#8A6F48] dark:text-[#C8A97E]">0000000H ~ 1FFFFFFH</div>
        </div>
      </div>

      <div className="pt-2 border-t designer-hairline">
        <div className="text-[11px] font-mono designer-text-muted mb-1.5">
          为什么 2²⁵ - 1 等于 1FFFFFFH？（25 个 1 按 4 位一组拆分）
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {[
            { bin: '1', hex: '1' },
            { bin: '1111', hex: 'F' },
            { bin: '1111', hex: 'F' },
            { bin: '1111', hex: 'F' },
            { bin: '1111', hex: 'F' },
            { bin: '1111', hex: 'F' },
            { bin: '1111', hex: 'F' },
          ].map((g, idx) => (
            <div
              key={idx}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline text-center"
            >
              <div className="text-[10px] designer-text-muted">{g.bin}</div>
              <div className="font-bold text-[#8A6F48] dark:text-[#C8A97E]">{g.hex}</div>
            </div>
          ))}
          <div className="px-2.5 py-1 rounded-lg bg-[#8A6F48]/10 text-[#8A6F48] dark:text-[#C8A97E] flex items-center text-[11px]">
            共 1 + 6×4 = 25 位 → 1FFFFFFH
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q2: 32K × 32 存储器引脚结构示意图
 */
export const Q2MemoryPinsDiagram: React.FC = () => (
  <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-3">
    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
      图解：存储体容量与地址线 / 数据线对应关系
    </div>
    <div className="overflow-x-auto">
      <svg viewBox="0 0 640 165" className="w-full max-w-[640px] mx-auto h-auto">
        {/* Left Address Bus */}
        <line x1="28" y1="82" x2="188" y2="82" stroke="#8A6F48" strokeWidth="3" />
        <polygon points="188,76 200,82 188,88" fill="#8A6F48" />
        <line x1="92" y1="92" x2="108" y2="72" stroke="#8A6F48" strokeWidth="2" />
        <text x="100" y="64" textAnchor="middle" fill="#8A6F48" fontSize="12" fontFamily="monospace" fontWeight="700">
          15 根地址线 (A0~A14)
        </text>
        <text x="100" y="106" textAnchor="middle" className="fill-[#757067] dark:fill-[#9C968B]" fontSize="11" fontFamily="sans-serif">
          决定寻址单元数：2¹⁵ = 32K
        </text>

        {/* Center Memory Block */}
        <rect x="204" y="24" width="228" height="118" rx="12" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.8" />
        <text x="318" y="54" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="14" fontWeight="700">
          32K × 32 位 存储体
        </text>
        <rect x="228" y="68" width="180" height="22" rx="4" className="fill-[#8A6F48]/15" stroke="#8A6F48" strokeOpacity="0.45" />
        <text x="318" y="83" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11" fontFamily="monospace">
          单元 0000H ： 32 bit 宽
        </text>
        <rect x="228" y="96" width="180" height="22" rx="4" className="fill-[#8A6F48]/10" stroke="#8A6F48" strokeOpacity="0.3" />
        <text x="318" y="111" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="11" fontFamily="monospace">
          …… 共 32,768 个存储单元
        </text>

        {/* Right Data Bus */}
        <line x1="444" y1="82" x2="604" y2="82" stroke="#3B7A75" strokeWidth="3" />
        <polygon points="444,76 432,82 444,88" fill="#3B7A75" />
        <polygon points="604,76 616,82 604,88" fill="#3B7A75" />
        <line x1="518" y1="92" x2="534" y2="72" stroke="#3B7A75" strokeWidth="2" />
        <text x="528" y="64" textAnchor="middle" fill="#3B7A75" fontSize="12" fontFamily="monospace" fontWeight="700">
          32 根数据线 (D0~D31)
        </text>
        <text x="528" y="106" textAnchor="middle" className="fill-[#757067] dark:fill-[#9C968B]" fontSize="11" fontFamily="sans-serif">
          等于字长 32 位（双向）
        </text>
      </svg>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-2 border-t designer-hairline">
      {[
        { k: '1K = 2¹⁰', v: '10 根地址线' },
        { k: '32K = 2⁵×2¹⁰', v: '15 根地址线' },
        { k: '1M = 2²⁰', v: '20 根地址线' },
        { k: '4G = 2³²', v: '32 根地址线' },
      ].map((item) => (
        <div key={item.k} className="py-1.5 px-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <div className="font-semibold text-[#8A6F48] dark:text-[#C8A97E]">{item.k}</div>
          <div className="text-[11px] designer-text-muted">{item.v}</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Q3: 78.375 转二进制完整演算双表
 */
export const Q3DecToBinDiagram: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
          ① 整数 78：除 2 取余
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#8A6F48]/12 text-[#8A6F48] dark:text-[#C8A97E]">
          从下往上读 ↑
        </span>
      </div>
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr className="border-b designer-hairline designer-text-muted">
            <th className="py-1 text-left">除法算式</th>
            <th className="py-1 text-center">商</th>
            <th className="py-1 text-right">余数（二进制位）</th>
          </tr>
        </thead>
        <tbody className="divide-y designer-hairline designer-text-secondary">
          {[
            ['78 ÷ 2', '39', '0（最低位 LSB）'],
            ['39 ÷ 2', '19', '1'],
            ['19 ÷ 2', '9', '1'],
            ['9 ÷ 2', '4', '1'],
            ['4 ÷ 2', '2', '0'],
            ['2 ÷ 2', '1', '0'],
            ['1 ÷ 2', '0', '1（最高位 MSB）'],
          ].map(([expr, q, r]) => (
            <tr key={expr}>
              <td className="py-1">{expr}</td>
              <td className="py-1 text-center">{q}</td>
              <td className="py-1 text-right font-bold text-[#8A6F48] dark:text-[#C8A97E]">{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs font-mono pt-1 text-right designer-text-primary">
        逆序拼接：<strong className="text-[#8A6F48] dark:text-[#C8A97E]">1001110</strong>（验算：64+8+4+2=78）
      </div>
    </div>

    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-3.5 space-y-2 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
            ② 小数 0.375：乘 2 取整
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
            从上往下读 ↓
          </span>
        </div>
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b designer-hairline designer-text-muted">
              <th className="py-1 text-left">乘法算式</th>
              <th className="py-1 text-center">取出整数</th>
              <th className="py-1 text-right">剩余小数</th>
            </tr>
          </thead>
          <tbody className="divide-y designer-hairline designer-text-secondary">
            {[
              ['0.375 × 2 = 0.75', '0', '0.75'],
              ['0.75 × 2 = 1.50', '1', '0.50'],
              ['0.50 × 2 = 1.00', '1', '0.00（结束）'],
            ].map(([expr, bit, rem]) => (
              <tr key={expr}>
                <td className="py-1.5">{expr}</td>
                <td className="py-1.5 text-center font-bold text-emerald-700 dark:text-emerald-300">{bit}</td>
                <td className="py-1.5 text-right">{rem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline space-y-1 text-xs font-mono">
        <div className="designer-text-secondary">
          顺序拼接：<strong className="text-emerald-700 dark:text-emerald-300">.011</strong>（验算：0×0.5 + 1×0.25 + 1×0.125 = 0.375）
        </div>
        <div className="designer-text-primary font-semibold">
          最终答案：(78.375)₁₀ = <span className="text-[#8A6F48] dark:text-[#C8A97E]">(1001110.011)₂</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q4: 混合进制转换分组对齐 + 十六进制竖式进位表
 */
export const Q4MixedRadixDiagram: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-3.5 space-y-2.5">
      <div className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
        ① 八进制 (753)₈ → 二进制 → 十六进制 1EBH
      </div>
      <div className="space-y-2 font-mono text-xs">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            { oct: '7', bin: '111' },
            { oct: '5', bin: '101' },
            { oct: '3', bin: '011' },
          ].map((c) => (
            <div key={c.oct} className="p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
              <div className="text-[10px] designer-text-muted">八进制 {c.oct}</div>
              <div className="font-bold designer-text-primary">{c.bin}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-[11px] designer-text-muted">↓ 从右往左每 4 位重新分组（左侧补 3 个 0）↓</div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            { bin: '0001', hex: '1' },
            { bin: '1110', hex: 'E (14)' },
            { bin: '1011', hex: 'B (11)' },
          ].map((c) => (
            <div key={c.bin} className="p-2 rounded-lg bg-[#8A6F48]/10 border border-[#8A6F48]/30">
              <div className="text-[10px] designer-text-muted">{c.bin}</div>
              <div className="font-bold text-[#8A6F48] dark:text-[#C8A97E]">{c.hex}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-3.5 space-y-2.5">
      <div className="text-xs font-mono font-semibold text-[#8A6F48] dark:text-[#C8A97E]">
        ② 十六进制竖式逐位相加（逢 16 进 1）
      </div>
      <table className="w-full text-center font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b designer-hairline designer-text-muted text-[10px]">
            <th className="py-1 text-left">位权</th>
            <th className="py-1">16³</th>
            <th className="py-1">16²</th>
            <th className="py-1">16¹</th>
            <th className="py-1">16⁰</th>
          </tr>
        </thead>
        <tbody className="divide-y designer-hairline">
          <tr>
            <td className="py-1.5 text-left designer-text-muted">被加数</td>
            <td className="py-1.5 font-semibold">2</td>
            <td className="py-1.5 font-semibold">A (10)</td>
            <td className="py-1.5 font-semibold">3</td>
            <td className="py-1.5 font-semibold">C (12)</td>
          </tr>
          <tr>
            <td className="py-1.5 text-left designer-text-muted">+ 加数</td>
            <td className="py-1.5 font-semibold">0</td>
            <td className="py-1.5 font-semibold">1</td>
            <td className="py-1.5 font-semibold">E (14)</td>
            <td className="py-1.5 font-semibold">B (11)</td>
          </tr>
          <tr className="bg-amber-500/8">
            <td className="py-1 text-left text-amber-700 dark:text-amber-300">低位进位</td>
            <td className="py-1 text-amber-700 dark:text-amber-300">0</td>
            <td className="py-1 font-bold text-amber-700 dark:text-amber-300">+1</td>
            <td className="py-1 font-bold text-amber-700 dark:text-amber-300">+1</td>
            <td className="py-1 designer-text-muted">—</td>
          </tr>
          <tr className="bg-[#8A6F48]/12 font-bold text-[#8A6F48] dark:text-[#C8A97E]">
            <td className="py-1.5 text-left">结果</td>
            <td className="py-1.5 text-sm">2</td>
            <td className="py-1.5 text-sm">C</td>
            <td className="py-1.5 text-sm">2</td>
            <td className="py-1.5 text-sm">7</td>
          </tr>
        </tbody>
      </table>
      <div className="text-[11px] font-mono designer-text-muted">
        末位 12+11=23=16+7（进1）→ 次位 3+14+1=18=16+2（进1）→ 10+1+1=12(C)
      </div>
    </div>
  </div>
);

/**
 * Q5: SRAM vs DRAM 最少引出线对比示意图
 */
export const Q5RamPinsDiagram: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div className="rounded-xl border border-[#8A6F48]/35 bg-white dark:bg-[#171614] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">
          SRAM（常规默认 · 不分时复用）
        </span>
        <span className="text-sm font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">20 根</span>
      </div>
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <span>地址线 A0 ~ A9（1024 = 2¹⁰）</span>
          <strong className="text-[#8A6F48] dark:text-[#C8A97E]">10 根</strong>
        </div>
        <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <span>数据线 D0 ~ D7（8 位）</span>
          <strong className="text-[#3B7A75] dark:text-[#6EE7B7]">8 根</strong>
        </div>
        <div className="flex justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <span>控制线（片选 CS̅ + 读写 R/W̅）</span>
          <strong className="text-amber-800 dark:text-amber-300">2 根（最易漏！）</strong>
        </div>
      </div>
    </div>

    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold designer-text-primary">
          DRAM（地址线分时复用）
        </span>
        <span className="text-sm font-mono font-bold designer-text-primary">15 根</span>
      </div>
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <span>行/列地址复用（10 ÷ 2）</span>
          <strong>5 根</strong>
        </div>
        <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <span>数据线 D0 ~ D7（8 位）</span>
          <strong>8 根</strong>
        </div>
        <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
          <span>控制线（行/列选通或读写控制）</span>
          <strong>2 根</strong>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q6: 浮点加减法 5 步流程图 + 实例演练
 */
export const Q6FloatFlowDiagram: React.FC = () => (
  <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-3">
    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
      浮点加减法 5 步流水图（顺序不可颠倒）
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {[
        { n: '01', name: '对阶', desc: '小阶向大阶看齐，尾数右移' },
        { n: '02', name: '尾数求和', desc: '按定点加减法规则运算' },
        { n: '03', name: '规格化', desc: '左规（消前导）或右规（消溢出）' },
        { n: '04', name: '舍入', desc: '0 舍 1 入 / 恒置 1 法补精度' },
        { n: '05', name: '溢出判断', desc: '判阶码上溢（报错）或下溢（置0）' },
      ].map((s, idx) => (
        <div
          key={s.n}
          className="relative p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">
              STEP {s.n}
            </span>
            {idx < 4 && (
              <span className="hidden sm:inline text-xs font-mono text-[#8A6F48]">→</span>
            )}
          </div>
          <div className="text-sm font-bold designer-text-primary">{s.name}</div>
          <div className="text-[11px] designer-text-muted mt-1 leading-snug">{s.desc}</div>
        </div>
      ))}
    </div>
    <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline text-xs font-mono designer-text-secondary">
      <strong className="text-[#8A6F48] dark:text-[#C8A97E]">直观类比（十进制科学计数法）：</strong>
      算 3.2×10⁵ + 4.5×10³ → ①对阶变为 3.2×10⁵ + 0.045×10⁵ → ②尾数相加得 3.245×10⁵ → ③规格化（若得 12.4×10⁵ 则右规为 1.24×10⁶）→ ④保留有效位舍入 → ⑤检查指数是否超出范围。
    </div>
  </div>
);

/**
 * Q7: Cache 三种映射对比表 + LFU/LRU 替换机制图解
 */
export const Q7CacheMappingDiagram: React.FC = () => (
  <div className="space-y-3">
    <div className="overflow-x-auto rounded-xl border designer-hairline bg-white dark:bg-[#171614]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#FAF9F5] dark:bg-[#1B1A17] border-b designer-hairline">
            <th className="py-2 px-3 font-semibold designer-text-primary">映射方式</th>
            <th className="py-2 px-3 font-semibold designer-text-primary">主存块能放的位置</th>
            <th className="py-2 px-3 font-semibold designer-text-primary">主存地址划分</th>
            <th className="py-2 px-3 font-semibold designer-text-primary">优缺点一句话</th>
          </tr>
        </thead>
        <tbody className="divide-y designer-hairline designer-text-secondary">
          <tr>
            <td className="py-2 px-3 font-semibold text-[#8A6F48] dark:text-[#C8A97E] whitespace-nowrap">直接映射</td>
            <td className="py-2 px-3">只能固定放到 Cache 第 (块号 mod 行数) 行</td>
            <td className="py-2 px-3 font-mono">标记 | 行号 | 块内字</td>
            <td className="py-2 px-3">电路最简单，但冲突率最高（抖动）</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-semibold text-[#8A6F48] dark:text-[#C8A97E] whitespace-nowrap">全相联映射</td>
            <td className="py-2 px-3">可放到 Cache 任意空行</td>
            <td className="py-2 px-3 font-mono">标记 | 块内字</td>
            <td className="py-2 px-3">最灵活冲突最低，但比较器多、成本高</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-semibold text-[#8A6F48] dark:text-[#C8A97E] whitespace-nowrap">组相联映射</td>
            <td className="py-2 px-3">组间直接映射，组内全相联（任意放）</td>
            <td className="py-2 px-3 font-mono">标记 | 组号 | 块内字</td>
            <td className="py-2 px-3">折中方案，现代 CPU 最常用（考 Q11！）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
      <div className="p-3 rounded-xl bg-white dark:bg-[#171614] border designer-hairline">
        <div className="font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">① 随机算法 (Random)</div>
        <p className="mt-1 designer-text-secondary leading-relaxed">硬件随机挑一行淘汰。实现最简单，但未利用局部性原理。</p>
      </div>
      <div className="p-3 rounded-xl bg-white dark:bg-[#171614] border designer-hairline">
        <div className="font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">② LFU（最不经常使用）</div>
        <p className="mt-1 designer-text-secondary leading-relaxed">每行配访问计数器，访问一次 +1，替换<strong>计数值最小</strong>的行（看历史总频率）。</p>
      </div>
      <div className="p-3 rounded-xl bg-white dark:bg-[#171614] border designer-hairline">
        <div className="font-mono font-bold text-[#8A6F48] dark:text-[#C8A97E]">③ LRU（近期最少使用）</div>
        <p className="mt-1 designer-text-secondary leading-relaxed">命中行清 0，其余行 +1，替换<strong>计数值最大</strong>的行（最符合局部性原理）。</p>
      </div>
    </div>
  </div>
);

/**
 * Q8: 汉字编码三阶段流转管线 + 机内码 vs ASCII 对比
 */
export const Q8HanziEncodingDiagram: React.FC = () => (
  <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-3">
    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
      汉字在计算机内的编码流转全过程
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline space-y-1">
        <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] font-bold">01 输入阶段</div>
        <div className="text-sm font-bold designer-text-primary">外码（输入码）</div>
        <p className="text-xs designer-text-secondary">不唯一：拼音（音码）、五笔（形码）、区位码（顺序码）、音形码。</p>
      </div>
      <div className="p-3 rounded-xl bg-[#8A6F48]/10 border border-[#8A6F48]/35 space-y-1">
        <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] font-bold">02 存储与处理阶段</div>
        <div className="text-sm font-bold designer-text-primary">机内码（内部编码）</div>
        <p className="text-xs designer-text-secondary">唯一且固定占 <strong>2 字节</strong>，每字节最高位恒为 <strong>1</strong>。</p>
      </div>
      <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline space-y-1">
        <div className="text-[10px] font-mono text-[#8A6F48] dark:text-[#C8A97E] font-bold">03 输出阶段</div>
        <div className="text-sm font-bold designer-text-primary">点阵码（字形码）</div>
        <p className="text-xs designer-text-secondary">存入字库（如 16×16 需 32B，24×24 需 72B），点阵越密越清晰。</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t designer-hairline font-mono text-xs">
      <div className="p-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
        <div className="text-[10px] designer-text-muted mb-1">西文 ASCII（1 字节，最高位 = 0）</div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">0</span>
          <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 flex-1 text-center">x x x x x x x</span>
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
        <div className="text-[10px] designer-text-muted mb-1">汉字机内码（2 字节，两字节最高位均为 1）</div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-[#8A6F48]/20 text-[#8A6F48] dark:text-[#C8A97E] font-bold">1</span>
          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 flex-1 text-center">xxxxxxx</span>
          <span className="px-1.5 py-0.5 rounded bg-[#8A6F48]/20 text-[#8A6F48] dark:text-[#C8A97E] font-bold">1</span>
          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 flex-1 text-center">xxxxxxx</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q9: 水平型 vs 垂直型微指令字长结构对比图示
 */
export const Q9MicroInstructionDiagram: React.FC = () => (
  <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-3">
    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
      图解：微指令字长与微程序长度的“反比关系”
    </div>
    <div className="space-y-2.5 font-mono text-xs">
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="font-semibold text-[#8A6F48] dark:text-[#C8A97E]">水平型微指令（字长、并行强、微程序短）</span>
          <span className="designer-text-muted">1 条微指令同时发多个微命令</span>
        </div>
        <div className="grid grid-cols-6 gap-1 text-center">
          {['控制段 A', '控制段 B', '控制段 C', 'ALU 操作', '判别测试', '下址字段'].map((f) => (
            <div key={f} className="py-1.5 px-1 rounded bg-[#8A6F48]/14 border border-[#8A6F48]/35 text-[10px] font-semibold designer-text-primary">
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="font-semibold designer-text-primary">垂直型微指令（字短、易懂、微程序长）</span>
          <span className="designer-text-muted">1 条微指令通常只干 1~2 件事</span>
        </div>
        <div className="grid grid-cols-6 gap-1 text-center">
          <div className="col-span-1 py-1.5 rounded bg-[#3B7A75]/15 border border-[#3B7A75]/35 text-[10px] font-semibold">微操作码</div>
          <div className="col-span-1 py-1.5 rounded bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline text-[10px]">源寄存器</div>
          <div className="col-span-1 py-1.5 rounded bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline text-[10px]">目的寄存器</div>
          <div className="col-span-3 py-1.5 text-left pl-2 text-[10px] designer-text-muted flex items-center">
            ← 字短，但完成同一机器指令需要串联更多条微指令
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q10: 区分内存中的指令与数据（时间 + 空间双维度流向图）
 */
export const Q10InstVsDataDiagram: React.FC = () => (
  <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-2">
    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
      图解：时间维度 × 空间流向双维区分
    </div>
    <div className="overflow-x-auto">
      <svg viewBox="0 0 640 190" className="w-full max-w-[640px] mx-auto h-auto">
        {/* Main Memory */}
        <rect x="18" y="42" width="146" height="106" rx="12" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.8" />
        <text x="91" y="76" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="14" fontWeight="700">
          主存储器
        </text>
        <text x="91" y="99" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="11" fontFamily="monospace">
          指令与数据混存
        </text>
        <text x="91" y="120" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10.5" fontFamily="monospace">
          (均为 0/1 二进制串)
        </text>

        {/* Top Path: Instruction */}
        <path d="M 164 72 C 250 72, 270 46, 396 46" fill="none" stroke="#3B7A75" strokeWidth="2.5" />
        <polygon points="394,40 406,46 394,52" fill="#3B7A75" />
        <rect x="214" y="18" width="150" height="22" rx="6" className="fill-[#3B7A75]/15" />
        <text x="289" y="33" textAnchor="middle" fill="#3B7A75" fontSize="11" fontWeight="700">
          时间：取指周期
        </text>

        <rect x="410" y="18" width="212" height="58" rx="12" className="fill-[#3B7A75]/10" stroke="#3B7A75" strokeWidth="1.5" />
        <text x="516" y="42" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="13" fontWeight="700">
          空间：流向控制器 (CU)
        </text>
        <text x="516" y="61" textAnchor="middle" fill="#3B7A75" fontSize="11" fontFamily="monospace">
          送入指令寄存器 IR 译码
        </text>

        {/* Bottom Path: Data */}
        <path d="M 164 118 C 250 118, 270 142, 396 142" fill="none" stroke="#8A6F48" strokeWidth="2.5" />
        <polygon points="394,136 406,142 394,148" fill="#8A6F48" />
        <rect x="214" y="150" width="150" height="22" rx="6" className="fill-[#8A6F48]/15" />
        <text x="289" y="165" textAnchor="middle" fill="#8A6F48" fontSize="11" fontWeight="700">
          时间：执行周期
        </text>

        <rect x="410" y="112" width="212" height="58" rx="12" className="fill-[#8A6F48]/12" stroke="#8A6F48" strokeWidth="1.5" />
        <text x="516" y="136" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="13" fontWeight="700">
          空间：流向运算器 (ALU)
        </text>
        <text x="516" y="155" textAnchor="middle" fill="#8A6F48" fontSize="11" fontFamily="monospace">
          送入通用寄存器 / ALU 运算
        </text>
      </svg>
    </div>
  </div>
);

/**
 * Q11: 组相联 Cache 映射机制示意图（联动当前参数）
 */
export const Q11CacheSetAssocDiagram: React.FC<CacheDiagramProps> = (v) => {
  const numSets = v.lines / v.ways;
  return (
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-2.5">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
        图解：{v.ways} 路组相联 Cache 地址查找过程（共 {numSets} 组 × {v.ways} 行/组 = {v.lines} 行）
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 680 185" className="w-full max-w-[680px] mx-auto h-auto">
          {/* Address box at top */}
          <rect x="110" y="12" width="180" height="36" rx="6" className="fill-[#8A6F48]/18" stroke="#8A6F48" strokeWidth="1.4" />
          <text x="200" y="34" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="12" fontFamily="monospace" fontWeight="700">
            Tag 标记 ({v.tagBits}位)
          </text>

          <rect x="290" y="12" width="120" height="36" rx="6" className="fill-[#3B7A75]/16" stroke="#3B7A75" strokeWidth="1.4" />
          <text x="350" y="34" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="12" fontFamily="monospace" fontWeight="700">
            Set 组号 ({v.setBits}位)
          </text>

          <rect x="410" y="12" width="160" height="36" rx="6" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#9A948A" strokeWidth="1.4" />
          <text x="490" y="34" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="12" fontFamily="monospace" fontWeight="700">
            Offset 块内字 ({v.offsetBits}位)
          </text>

          {/* Arrows downward */}
          <path d="M 350 48 L 350 78 L 210 78 L 210 92" fill="none" stroke="#3B7A75" strokeWidth="1.8" />
          <polygon points="205,90 210,100 215,90" fill="#3B7A75" />
          <text x="358" y="72" fill="#3B7A75" fontSize="10.5" fontFamily="sans-serif" fontWeight="600">
            ① 组号定组（0 ~ {numSets - 1} 组）
          </text>

          <path d="M 200 48 L 200 66 L 88 66 L 88 122 L 106 122" fill="none" stroke="#8A6F48" strokeWidth="1.8" />
          <polygon points="104,117 114,122 104,127" fill="#8A6F48" />
          <text x="18" y="92" fill="#8A6F48" fontSize="10.5" fontFamily="sans-serif" fontWeight="600">
            ② 组内 {v.ways} 路
          </text>
          <text x="18" y="107" fill="#8A6F48" fontSize="10.5" fontFamily="sans-serif" fontWeight="600">
            并行比对 Tag
          </text>

          <path d="M 490 48 L 490 122 L 466 122" fill="none" stroke="#8A8478" strokeWidth="1.6" strokeDasharray="4 3" />
          <polygon points="468,117 458,122 468,127" fill="#8A8478" />
          <text x="500" y="114" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10.5" fontFamily="sans-serif">
            ③ 命中后在 {v.wordsPerBlock} 字块内
          </text>
          <text x="500" y="130" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10.5" fontFamily="sans-serif">
            精准定位目标字
          </text>

          {/* Cache Set Box */}
          <rect x="116" y="102" width="340" height="72" rx="10" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.6" />
          <text x="286" y="122" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontWeight="700">
            Cache 第 k 组（内含 {v.ways} 行 / 路，全相联比较）
          </text>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${128 + i * 80}, 132)`}>
              <rect width="72" height="30" rx="5" className="fill-white dark:fill-[#141412]" stroke="#8A6F48" strokeOpacity="0.45" />
              <text x="36" y="19" textAnchor="middle" className="fill-[#8A6F48] dark:fill-[#C8A97E]" fontSize="10" fontFamily="monospace">
                Way {i} | Tag
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

/**
 * Q12: 微程序执行流程图 + 24 位微指令 4-bit 十六进制对齐标尺
 */
export const Q12MicroprogramDiagram: React.FC = () => (
  <div className="space-y-3">
    {/* 1. Clean SVG Flowchart */}
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-2">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
        图解 ①：微程序执行状态流程图（对应 8 个微地址）
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 740 295" className="w-full max-w-[740px] mx-auto h-auto">
          <defs>
            <marker id="coArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#8A6F48" />
            </marker>
            <marker id="coArrowTeal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#3B7A75" />
            </marker>
          </defs>

          {/* 00H */}
          <rect x="24" y="22" width="128" height="48" rx="10" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.5" />
          <text x="88" y="42" textAnchor="middle" fill="#8A6F48" fontSize="12" fontFamily="monospace" fontWeight="700">00H · NOP</text>
          <text x="88" y="60" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10.5" fontFamily="monospace">000001H → 01H</text>

          <line x1="152" y1="46" x2="210" y2="46" stroke="#8A6F48" strokeWidth="1.8" markerEnd="url(#coArrow)" />

          {/* 01H */}
          <rect x="216" y="16" width="246" height="60" rx="12" className="fill-[#8A6F48]/14" stroke="#8A6F48" strokeWidth="2" />
          <text x="339" y="38" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="12.5" fontWeight="700">
            01H · 取指译码（读指送 IR）
          </text>
          <text x="339" y="58" textAnchor="middle" fill="#8A6F48" fontSize="11" fontFamily="monospace" fontWeight="600">
            P&lt;1&gt; 按操作码分支（基址 30H · 107070H）
          </text>

          {/* Branching bus from 01H */}
          <line x1="339" y1="76" x2="339" y2="104" stroke="#8A6F48" strokeWidth="1.8" />
          <line x1="100" y1="104" x2="640" y2="104" stroke="#8A6F48" strokeWidth="1.8" />
          <line x1="100" y1="104" x2="100" y2="128" stroke="#8A6F48" strokeWidth="1.8" markerEnd="url(#coArrow)" />
          <line x1="295" y1="104" x2="295" y2="128" stroke="#8A6F48" strokeWidth="1.8" markerEnd="url(#coArrow)" />
          <line x1="470" y1="104" x2="470" y2="128" stroke="#8A6F48" strokeWidth="1.8" markerEnd="url(#coArrow)" />
          <line x1="640" y1="104" x2="640" y2="128" stroke="#8A6F48" strokeWidth="1.8" markerEnd="url(#coArrow)" />

          {/* Branch 1: ADD (30H -> 04H -> 05H) */}
          <text x="100" y="98" textAnchor="middle" fill="#8A6F48" fontSize="10.5" fontFamily="monospace" fontWeight="700">ADD</text>
          <rect x="24" y="134" width="152" height="40" rx="8" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.4" />
          <text x="100" y="151" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11" fontWeight="700">30H: R0 → A</text>
          <text x="100" y="166" textAnchor="middle" fill="#8A6F48" fontSize="10" fontFamily="monospace">001404H</text>

          <line x1="100" y1="174" x2="100" y2="192" stroke="#8A6F48" strokeWidth="1.5" markerEnd="url(#coArrow)" />

          <rect x="24" y="196" width="152" height="36" rx="8" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#8A6F48" strokeWidth="1.4" />
          <text x="100" y="212" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11" fontWeight="700">04H: R0 → B</text>
          <text x="100" y="226" textAnchor="middle" fill="#8A6F48" fontSize="10" fontFamily="monospace">002405H</text>

          <line x1="100" y1="232" x2="100" y2="248" stroke="#8A6F48" strokeWidth="1.5" markerEnd="url(#coArrow)" />

          <rect x="24" y="252" width="152" height="36" rx="8" className="fill-[#3B7A75]/12" stroke="#3B7A75" strokeWidth="1.5" />
          <text x="100" y="268" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11" fontWeight="700">05H: A+B → R0</text>
          <text x="100" y="282" textAnchor="middle" fill="#3B7A75" fontSize="10" fontFamily="monospace">04B201H → 回01H</text>

          {/* Branch 2: IN (32H) */}
          <text x="295" y="98" textAnchor="middle" fill="#8A6F48" fontSize="10.5" fontFamily="monospace" fontWeight="700">IN</text>
          <rect x="220" y="134" width="150" height="58" rx="9" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#3B7A75" strokeWidth="1.5" />
          <text x="295" y="154" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontWeight="700">32H: IN → R0</text>
          <text x="295" y="170" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10" fontFamily="monospace">RD=1, IOM=1, LDR0</text>
          <text x="295" y="185" textAnchor="middle" fill="#3B7A75" fontSize="10.5" fontFamily="monospace" fontWeight="700">183001H → 回01H</text>

          {/* Branch 3: OUT (33H) */}
          <text x="470" y="98" textAnchor="middle" fill="#8A6F48" fontSize="10.5" fontFamily="monospace" fontWeight="700">OUT</text>
          <rect x="395" y="134" width="150" height="58" rx="9" className="fill-[#FAF9F5] dark:fill-[#1F1E1B]" stroke="#3B7A75" strokeWidth="1.5" />
          <text x="470" y="154" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontWeight="700">33H: R0 → OUT</text>
          <text x="470" y="170" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10" fontFamily="monospace">WR=1, IOM=1, R0_B</text>
          <text x="470" y="185" textAnchor="middle" fill="#3B7A75" fontSize="10.5" fontFamily="monospace" fontWeight="700">280401H → 回01H</text>

          {/* Branch 4: HLT (35H self loop) */}
          <text x="640" y="98" textAnchor="middle" fill="#8A6F48" fontSize="10.5" fontFamily="monospace" fontWeight="700">HLT</text>
          <rect x="570" y="134" width="144" height="58" rx="9" className="fill-rose-500/10" stroke="#C2594A" strokeWidth="1.5" />
          <text x="642" y="154" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontWeight="700">35H: NOP 停机</text>
          <text x="642" y="170" textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10" fontFamily="monospace">下址仍为 35H</text>
          <text x="642" y="185" textAnchor="middle" fill="#C2594A" fontSize="10.5" fontFamily="monospace" fontWeight="700">000035H（自循环）</text>
          <path d="M 642 192 C 642 224, 728 224, 728 163 C 728 148, 720 148, 716 148" fill="none" stroke="#C2594A" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* Return note */}
          <path d="M 295 192 L 295 232 L 470 232 L 470 192" fill="none" stroke="#3B7A75" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="382" y="250" textAnchor="middle" fill="#3B7A75" fontSize="10.5" fontFamily="monospace">
            ADD(05H) / IN(32H) / OUT(33H) 执行完统一跳回 01H 取下一条指令
          </text>
        </svg>
      </div>
    </div>

    {/* 2. 24-bit Alignment Ruler */}
    <div className="rounded-xl border designer-hairline bg-white dark:bg-[#171614] p-4 space-y-2">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
        图解 ②：24 位微指令怎么快速折算 6 位十六进制？（考场防错标尺）
      </div>
      <p className="text-xs designer-text-secondary">
        字段边界（2 | 3 | 4 | 3 | 3 | 3 | 6）与十六进制的「每 4 位一组」<strong>错位</strong>！考场先把 24 位二进制连写出来，再从左到右每 4 位画竖线：
      </p>
      <div className="overflow-x-auto font-mono text-[11px]">
        <div className="min-w-[540px] space-y-1.5">
          {/* Field bands (exact 24-bit proportional track) */}
          <div
            className="grid gap-0.5 text-center"
            style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
          >
            <div style={{ gridColumn: 'span 2 / span 2' }} className="py-1 rounded bg-black/5 dark:bg-white/5 text-[10px]">M23,22 (2)</div>
            <div style={{ gridColumn: 'span 3 / span 3' }} className="py-1 rounded bg-[#8A6F48]/15 text-[#8A6F48] dark:text-[#C8A97E] font-semibold text-[10px]">WR,RD,IOM (3)</div>
            <div style={{ gridColumn: 'span 4 / span 4' }} className="py-1 rounded bg-[#3B7A75]/15 text-[#3B7A75] dark:text-[#6EE7B7] font-semibold text-[10px]">S3-S0 (4)</div>
            <div style={{ gridColumn: 'span 3 / span 3' }} className="py-1 rounded bg-[#8A6F48]/15 text-[#8A6F48] dark:text-[#C8A97E] font-semibold text-[10px]">A (3)</div>
            <div style={{ gridColumn: 'span 3 / span 3' }} className="py-1 rounded bg-black/5 dark:bg-white/5 text-[10px]">B (3)</div>
            <div style={{ gridColumn: 'span 3 / span 3' }} className="py-1 rounded bg-[#8A6F48]/15 text-[#8A6F48] dark:text-[#C8A97E] font-semibold text-[10px]">C (3)</div>
            <div style={{ gridColumn: 'span 6 / span 6' }} className="py-1 rounded bg-[#3B7A75]/15 text-[#3B7A75] dark:text-[#6EE7B7] font-semibold text-[10px]">MA5 ~ MA0 下址 (6)</div>
          </div>
          {/* Example 01H */}
          <div className="grid grid-cols-6 gap-1.5 text-center pt-1">
            {[
              { bits: '0001', hex: '1', note: '00 + 01' },
              { bits: '0000', hex: '0', note: '0 + 000' },
              { bits: '0111', hex: '7', note: '0 + 111(A)' },
              { bits: '0000', hex: '0', note: '000(B) + 0' },
              { bits: '0111', hex: '7', note: '01(C) + 11' },
              { bits: '0000', hex: '0', note: '0000(MA)' },
            ].map((nib, i) => (
              <div key={i} className="p-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1D1A] border designer-hairline">
                <div className="text-[10px] designer-text-muted">{nib.bits}</div>
                <div className="text-sm font-bold text-[#8A6F48] dark:text-[#C8A97E]">{nib.hex}</div>
                <div className="text-[9.5px] designer-text-muted">{nib.note}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] designer-text-muted text-right">
            示例（地址 01H）：<code className="text-[#8A6F48] dark:text-[#C8A97E]">00 010 0000 111 000 001 110000</code> → 每 4 位一划 = <strong>107070H</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Q13: 专业工程原理图 SVG —— 2114 SRAM (1K×4) 扩展为 4K×8 存储器
 */
export const Q13SramWiringDiagram: React.FC = () => {
  const groupX = [170, 340, 510, 680];
  const groupAddrRanges = ['000H~3FFH', '400H~7FFH', '800H~BFFH', 'C00H~FFFH'];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border designer-hairline bg-white dark:bg-[#141412] p-3.5 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#8A6F48] dark:text-[#C8A97E] font-semibold">
            2114 SRAM（1K×4）组成 4K×8 存储器标准连线原理图
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-mono">
            <span className="inline-flex items-center gap-1 text-[#2563EB] dark:text-[#60A5FA]">
              <span className="w-2.5 h-0.5 bg-current" /> D7~D4 高4位
            </span>
            <span className="inline-flex items-center gap-1 text-[#B45309] dark:text-[#F59E0B]">
              <span className="w-2.5 h-0.5 bg-current" /> D3~D0 低4位
            </span>
            <span className="inline-flex items-center gap-1 text-[#DC2626] dark:text-[#F87171]">
              <span className="w-2.5 h-0.5 bg-current" /> R/W̅ 读写
            </span>
            <span className="inline-flex items-center gap-1 text-[#0F766E] dark:text-[#2DD4BF]">
              <span className="w-2.5 h-0.5 bg-current" /> CS0̅~CS3̅ 片选
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox="0 0 820 475" className="w-full min-w-[660px] h-auto select-none">
            {/* Background subtle frame */}
            <rect x="4" y="4" width="812" height="467" rx="14" className="fill-[#FAF9F5] dark:fill-[#191816]" stroke="#D8D2C5" strokeOpacity="0.45" />

            {/* === TOP DATA BUSES === */}
            {/* D7~D4 Bus (Blue) */}
            <text x="20" y="40" fill="#2563EB" className="dark:fill-[#60A5FA]" fontSize="12" fontFamily="monospace" fontWeight="700">
              D7~D4
            </text>
            <line x1="76" y1="36" x2="735" y2="36" stroke="#2563EB" strokeWidth="2.8" />
            {/* Slash /4 marker */}
            <line x1="94" y1="44" x2="104" y2="28" stroke="#2563EB" strokeWidth="1.8" />
            <text x="108" y="30" fill="#2563EB" fontSize="10.5" fontFamily="monospace" fontWeight="700">4</text>

            {/* D3~D0 Bus (Amber) */}
            <text x="20" y="72" fill="#B45309" className="dark:fill-[#F59E0B]" fontSize="12" fontFamily="monospace" fontWeight="700">
              D3~D0
            </text>
            <line x1="76" y1="68" x2="778" y2="68" stroke="#B45309" strokeWidth="2.8" />
            <line x1="94" y1="76" x2="104" y2="60" stroke="#B45309" strokeWidth="1.8" />
            <text x="108" y="62" fill="#B45309" fontSize="10.5" fontFamily="monospace" fontWeight="700">4</text>

            {/* === MIDDLE R/W BUS (Red) === */}
            <text x="20" y="198" fill="#DC2626" className="dark:fill-[#F87171]" fontSize="12" fontFamily="monospace" fontWeight="700">
              R/W̅
            </text>
            <line x1="76" y1="194" x2="758" y2="194" stroke="#DC2626" strokeWidth="2" />

            {/* === LOWER ADDRESS BUS A9~A0 (Slate) === */}
            <text x="18" y="328" className="fill-[#374151] dark:fill-[#D1D5DB]" fontSize="12" fontFamily="monospace" fontWeight="700">
              A9~A0
            </text>
            <line x1="76" y1="324" x2="735" y2="324" stroke="#4B5563" strokeWidth="2.8" />
            <line x1="94" y1="332" x2="104" y2="316" stroke="#4B5563" strokeWidth="1.8" />
            <text x="108" y="318" className="fill-[#374151] dark:fill-[#D1D5DB]" fontSize="10.5" fontFamily="monospace" fontWeight="700">10</text>

            {/* === 4 CHIP GROUPS (Each: Top Chip + Bottom Chip) === */}
            {groupX.map((gx, idx) => {
              const chipW = 92;
              const chipH = 60;
              const topY = 104;
              const botY = 224;
              const centerX = gx + chipW / 2;
              const rightTapX = gx + chipW + 22;
              const leftCsX = gx - 18;

              return (
                <g key={idx}>
                  {/* Subtle group dashed enclosure */}
                  <rect
                    x={gx - 26}
                    y={92}
                    width={chipW + 58}
                    height={212}
                    rx="10"
                    fill="none"
                    stroke="#8A6F48"
                    strokeOpacity="0.28"
                    strokeDasharray="4 4"
                  />
                  <text x={centerX} y={102} textAnchor="middle" fill="#8A6F48" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    第 {idx} 组（{groupAddrRanges[idx]}）
                  </text>

                  {/* D7~D4 tap -> Top Chip */}
                  <circle cx={centerX} cy={36} r="3.5" fill="#2563EB" />
                  <line x1={centerX} y1={36} x2={centerX} y2={topY} stroke="#2563EB" strokeWidth="2" />
                  <line x1={centerX - 5} y1={84} x2={centerX + 5} y2={76} stroke="#2563EB" strokeWidth="1.4" />
                  <text x={centerX + 8} y={84} fill="#2563EB" fontSize="9.5" fontFamily="monospace">4</text>

                  {/* D3~D0 tap -> routed cleanly around right side into Bottom Chip */}
                  <circle cx={rightTapX} cy={68} r="3.5" fill="#B45309" />
                  <path
                    d={`M ${rightTapX} 68 L ${rightTapX} ${botY + 30} L ${gx + chipW} ${botY + 30}`}
                    fill="none"
                    stroke="#B45309"
                    strokeWidth="2"
                  />
                  <line x1={rightTapX - 5} y1={148} x2={rightTapX + 5} y2={140} stroke="#B45309" strokeWidth="1.4" />
                  <text x={rightTapX + 7} y={148} fill="#B45309" fontSize="9.5" fontFamily="monospace">4</text>

                  {/* Top Chip: 2114 (High 4 bits) */}
                  <rect
                    x={gx}
                    y={topY}
                    width={chipW}
                    height={chipH}
                    rx="8"
                    className="fill-white dark:fill-[#22211E]"
                    stroke="#2563EB"
                    strokeWidth="1.6"
                  />
                  <text x={centerX} y={topY + 24} textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontFamily="monospace" fontWeight="700">
                    2114
                  </text>
                  <text x={centerX} y={topY + 41} textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10" fontFamily="monospace">
                    1K × 4 (高4位)
                  </text>

                  {/* Bottom Chip: 2114 (Low 4 bits) */}
                  <rect
                    x={gx}
                    y={botY}
                    width={chipW}
                    height={chipH}
                    rx="8"
                    className="fill-white dark:fill-[#22211E]"
                    stroke="#B45309"
                    strokeWidth="1.6"
                  />
                  <text x={centerX} y={botY + 24} textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="11.5" fontFamily="monospace" fontWeight="700">
                    2114
                  </text>
                  <text x={centerX} y={botY + 41} textAnchor="middle" className="fill-[#757067] dark:fill-[#A09B90]" fontSize="10" fontFamily="monospace">
                    1K × 4 (低4位)
                  </text>

                  {/* R/W taps to Top Chip bottom and Bottom Chip top */}
                  <circle cx={gx + 28} cy={194} r="3" fill="#DC2626" />
                  <line x1={gx + 28} y1={194} x2={gx + 28} y2={topY + chipH} stroke="#DC2626" strokeWidth="1.6" />
                  <line x1={gx + 28} y1={194} x2={gx + 28} y2={botY} stroke="#DC2626" strokeWidth="1.6" />
                  <text x={gx + 34} y={182} fill="#DC2626" fontSize="9" fontFamily="monospace">WE̅</text>

                  {/* A9~A0 taps to both chips (via right-center bus tap) */}
                  <circle cx={gx + 68} cy={324} r="3.5" fill="#4B5563" />
                  <line x1={gx + 68} y1={324} x2={gx + 68} y2={botY + chipH} stroke="#4B5563" strokeWidth="2" />
                  <line x1={gx + 68} y1={botY} x2={gx + 68} y2={topY + chipH} stroke="#4B5563" strokeWidth="1.8" strokeDasharray="3 2" />
                  <text x={gx + 73} y={310} className="fill-[#4B5563] dark:fill-[#9CA3AF]" fontSize="9" fontFamily="monospace">A9~0</text>

                  {/* CS line from Decoder up to both chips on left side */}
                  <path
                    d={`M ${leftCsX} 388 L ${leftCsX} ${topY + 30} L ${gx} ${topY + 30}`}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  <line x1={leftCsX} y1={botY + 30} x2={gx} y2={botY + 30} stroke="#0F766E" strokeWidth="2" />
                  <circle cx={leftCsX} cy={botY + 30} r="3" fill="#0F766E" />
                  {/* Active-low bubbles */}
                  <circle cx={gx - 3} cy={topY + 30} r="3" className="fill-white dark:fill-[#191816]" stroke="#0F766E" strokeWidth="1.4" />
                  <circle cx={gx - 3} cy={botY + 30} r="3" className="fill-white dark:fill-[#191816]" stroke="#0F766E" strokeWidth="1.4" />

                  {/* CS label */}
                  <text x={leftCsX + 6} y={376} fill="#0F766E" fontSize="11" fontFamily="monospace" fontWeight="700">
                    CS{idx}̅
                  </text>
                </g>
              );
            })}

            {/* === 2:4 DECODER AT BOTTOM === */}
            <rect
              x="128"
              y="388"
              width="586"
              height="64"
              rx="12"
              className="fill-[#0F766E]/10"
              stroke="#0F766E"
              strokeWidth="1.8"
            />
            <text x="421" y="416" textAnchor="middle" className="fill-[#141413] dark:fill-[#F2F0EA]" fontSize="14" fontWeight="700">
              2 : 4 地址译码器（高位片选译码）
            </text>
            <text x="421" y="438" textAnchor="middle" fill="#0F766E" fontSize="11" fontFamily="monospace">
              每组上下 2 片共用同一根片选线（低电平有效 CS0̅ ~ CS3̅）
            </text>

            {/* A10 & A11 inputs into Decoder */}
            <text x="24" y="411" fill="#0F766E" fontSize="12" fontFamily="monospace" fontWeight="700">A10</text>
            <line x1="60" y1="407" x2="120" y2="407" stroke="#0F766E" strokeWidth="2.2" />
            <polygon points="118,402 128,407 118,412" fill="#0F766E" />

            <text x="24" y="438" fill="#0F766E" fontSize="12" fontFamily="monospace" fontWeight="700">A11</text>
            <line x1="60" y1="434" x2="120" y2="434" stroke="#0F766E" strokeWidth="2.2" />
            <polygon points="118,429 128,434 118,439" fill="#0F766E" />
          </svg>
        </div>
      </div>

      {/* Address Space Allocation Table */}
      <div className="overflow-x-auto rounded-xl border designer-hairline bg-white dark:bg-[#171614]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#FAF9F5] dark:bg-[#1B1A17] border-b designer-hairline designer-text-muted">
              <th className="py-2 px-3">芯片组</th>
              <th className="py-2 px-3">高位 A11 A10</th>
              <th className="py-2 px-3">有效片选</th>
              <th className="py-2 px-3">片内地址 A9~A0</th>
              <th className="py-2 px-3">十六进制地址空间</th>
            </tr>
          </thead>
          <tbody className="divide-y designer-hairline designer-text-secondary">
            {[
              ['第 0 组（2片）', '0  0', 'CS0̅ 有效', '00_0000_0000 ~ 11_1111_1111', '000H ~ 3FFH'],
              ['第 1 组（2片）', '0  1', 'CS1̅ 有效', '00_0000_0000 ~ 11_1111_1111', '400H ~ 7FFH'],
              ['第 2 组（2片）', '1  0', 'CS2̅ 有效', '00_0000_0000 ~ 11_1111_1111', '800H ~ BFFH'],
              ['第 3 组（2片）', '1  1', 'CS3̅ 有效', '00_0000_0000 ~ 11_1111_1111', 'C00H ~ FFFH'],
            ].map(([grp, hi, cs, lo, hex]) => (
              <tr key={grp}>
                <td className="py-1.5 px-3 font-semibold designer-text-primary">{grp}</td>
                <td className="py-1.5 px-3">{hi}</td>
                <td className="py-1.5 px-3 text-[#0F766E] dark:text-[#2DD4BF] font-semibold">{cs}</td>
                <td className="py-1.5 px-3 text-[11px]">{lo}</td>
                <td className="py-1.5 px-3 font-bold text-[#8A6F48] dark:text-[#C8A97E]">{hex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
