export interface WindowHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const WindowHeader = ({ title, children }: WindowHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white/10 backdrop-blur-md border-b border-white/20">
      {/* 左侧：红绿灯 */}
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 bg-red-500 rounded-full cursor-pointer hover:scale-110 transition-transform"></div>
        <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full cursor-pointer hover:scale-110 transition-transform"></div>
        <div className="w-3.5 h-3.5 bg-green-500 rounded-full cursor-pointer hover:scale-110 transition-transform"></div>
      </div>
      
      {/* 中间：地址栏 */}
      <div className="flex-1 mx-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/20">
          <span className="text-white/60 text-sm">📁</span>
          <span className="text-white text-sm font-medium truncate">{title}</span>
        </div>
      </div>
      
      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-4">
        {children}
      </div>
    </div>
  );
};


