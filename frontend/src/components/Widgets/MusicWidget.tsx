import React from 'react';

export const MusicWidget: React.FC = () => {
  return (
    <div className="music-widget card">
      <h3 className="widget-title">最近在循环 · 我喜欢</h3>
      <p className="widget-desc">我的私人歌单，陪代码、摄影和日常的背景音乐</p>
      <div className="player-container">
        <iframe 
          frameBorder="0" 
          marginWidth={0} 
          marginHeight={0} 
          width="100%" 
          height="450" 
          src="https://music.163.com/outchain/player?type=2&id=12414310934&auto=0&height=450"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};