import React from 'react';

export const MovieWidget: React.FC = () => {
  const movies = [
    {
      id: 1,
      title: "肖申克的救赎",
      year: "1994",
      comment: "希望是件好东西，也许是最好的东西，而且希望永不消逝。",
      poster: "https://img2.doubanio.com/view/photo/l_ratio_poster/public/p480747492.jpg"
    },
    {
      id: 2,
      title: "海上钢琴师",
      year: "1998",
      comment: "陆地太大了，我害怕下不了船。钢琴上的传奇一生。",
      poster: "https://img1.doubanio.com/view/photo/l_ratio_poster/public/p511146807.jpg"
    },
    {
      id: 3,
      title: "唐人街探案",
      year: "2015",
      comment: "王宝强+刘昊然的侦探喜剧，笑点密集又烧脑。",
      poster: "https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2275536003.jpg"
    },
    {
      id: 4,
      title: "让子弹飞",
      year: "2010",
      comment: "姜文式荒诞与犀利，台词每句都能单拎出来。",
      poster: "https://img9.doubanio.com/view/photo/l_ratio_poster/public/p1512562287.jpg"
    },
    {
      id: 5,
      title: "默杀",
      year: "2024",
      comment: "近期最让人窒息的国产悬疑，沉默的力量太震撼。",
      poster: "https://img2.doubanio.com/view/photo/l_ratio_poster/public/p3014135771.jpg"
    },
    {
      id: 6,
      title: "你的婚礼",
      year: "2021",
      comment: "许光汉+章若楠的青春遗憾，谁没爱过一个错过的人。",
      poster: "https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2634326774.jpg"
    }
  ];

  return (
    <div className="movie-widget card">
      <h3 className="widget-title">最近安利 · 经典观影</h3>
      <p className="widget-desc">一些深深打动我的电影，从救赎到荒诞到青春</p>
      <div className="movies-scroll">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img src={movie.poster} alt={movie.title} />
            <div className="info">
              <h4>{movie.title}</h4>
              <p className="year">{movie.year}</p>
              <p className="comment">{movie.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add styles for movie widget
const style = document.createElement('style');
style.textContent = `
  .movie-widget .movies-scroll {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 8px 0;
    scrollbar-width: none;
  }
  
  .movie-widget .movies-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .movie-widget .movie-card {
    flex-shrink: 0;
    width: 180px;
    background: rgba(255,255,255,0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s;
  }
  
  .movie-widget .movie-card:hover {
    transform: translateY(-8px);
  }
  
  .movie-widget .movie-card img {
    width: 100%;
    height: 260px;
    object-fit: cover;
  }
  
  .movie-widget .info {
    padding: 12px;
    color: #fff;
  }
  
  .movie-widget .info h4 {
    margin: 0 0 4px;
    font-size: 16px;
  }
  
  .movie-widget .year {
    color: #aaa;
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .movie-widget .comment {
    font-size: 13px;
    color: #ccc;
    line-height: 1.4;
  }
`;
document.head.appendChild(style);