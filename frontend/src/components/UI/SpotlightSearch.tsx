import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const SpotlightSearch = () => {
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery } = useAppStore();

  // 搜索知识库 - 包含更丰富的搜索内容和响应
  const searchKnowledge = [
    {
      queries: ['你最喜欢的电影', '最喜欢的电影', '推荐电影'],
      response: '我最喜欢的电影是《Dune》和《Spider-Man: Across the Spider-Verse》，它们的视觉效果和故事都非常出色！',
      category: '个人爱好'
    },
    {
      queries: ['你的邮箱', '邮箱', '联系邮箱', 'email'],
      response: '我的邮箱是 2090862712@qq.com，欢迎随时联系我！',
      category: '联系方式'
    },
    {
      queries: ['React 项目', 'react 项目', 'React', 'react'],
      response: '我有多个 React 项目，包括个人网站、AI 助手和仪表盘应用等，你可以在 GitHub 上查看更多详情。',
      category: '项目'
    },
    {
      queries: ['你的电话', '电话', '联系电话'],
      response: '我的电话号码是 17373337419，欢迎来电！',
      category: '联系方式'
    },
    {
      queries: ['GitHub', 'github', 'git', '代码仓库'],
      response: '我的 GitHub 账号是 https://github.com/hyxhhh1013，欢迎关注和 Star！',
      category: '联系方式'
    },
    {
      queries: ['Node.js 项目', 'node.js 项目', 'Node', 'node'],
      response: '我使用 Node.js 开发了后端 API、实时聊天应用和自动化脚本等项目。',
      category: '项目'
    },
    {
      queries: ['AI 助手', 'ai 助手', 'AI', 'ai'],
      response: '我开发了一个智能 AI 助手，能够处理自然语言查询、生成内容和提供个性化建议。',
      category: '项目'
    },
    {
      queries: ['你的技能', '技能', '技术栈', '擅长'],
      response: '我擅长 React、TypeScript、Node.js、AI/ML 和全栈开发，热衷于探索新技术。',
      category: '技能'
    },
    {
      queries: ['你的位置', '位置', '在哪里', '地址'],
      response: '我目前位于湖南省长沙市，正在积极参与当地的技术社区活动。',
      category: '个人信息'
    },
    {
      queries: ['你的职业', '职业', '工作', '做什么'],
      response: '我是一名 AI 时代的新一代创作者，专注于全栈开发、AI 应用和创意技术。',
      category: '个人信息'
    }
  ];

  // 基础搜索项 - 用于快速选择
  const searchItems = [
    { category: '电影', items: ['Spider-Man', 'The Batman', 'Dune'] },
    { category: '项目', items: ['React 项目', 'Node.js 项目', 'AI 助手'] },
    { category: '联系方式', items: ['邮箱', '电话', 'GitHub'] },
  ];

  // 智能搜索匹配逻辑
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const lowerQuery = searchQuery.toLowerCase();
    const results = [];

    // 1. 精确匹配知识库
    for (const knowledge of searchKnowledge) {
      if (knowledge.queries.some(q => q.toLowerCase().includes(lowerQuery) || lowerQuery.includes(q.toLowerCase()))) {
        results.push({
          type: 'knowledge' as const,
          ...knowledge
        });
      }
    }

    // 2. 匹配基础搜索项
    const itemResults = searchItems.flatMap(category => 
      category.items.filter(item => item.toLowerCase().includes(lowerQuery))
        .map(item => ({
          type: 'item' as const,
          item,
          category: category.category
        }))
    );

    return [...results, ...itemResults];
  };

  const filteredResults = getSearchResults();

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
          onClick={toggleSearch}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-full max-w-xl bg-white/[0.03] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索... 例如: 你最喜欢的电影, 你的邮箱, React 项目"
                className="w-full bg-transparent border-none outline-none text-white text-xl placeholder-white/40"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') toggleSearch();
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {searchQuery && filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    {result.type === 'knowledge' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">{result.category}</span>
                          <span className="text-white font-medium">{searchQuery}</span>
                        </div>
                        <p className="text-white/80 pl-6 text-sm">{result.response}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{result.category}</span>
                        <span className="text-white font-medium">{result.item}</span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-white/60">没有找到匹配的结果</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {searchItems.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-xs text-white/40 uppercase tracking-wider">{category.category}</h3>
                      <div className="space-y-1">
                        {category.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            whileHover={{ x: 5 }}
                            className="text-white/80 hover:text-white cursor-pointer text-sm"
                            onClick={() => setSearchQuery(item)}
                          >
                            {item}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shortcut Help */}
            <div className="mt-6 text-center text-white/40 text-sm">
              <p>按 Escape 或点击空白处关闭</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpotlightSearch;
