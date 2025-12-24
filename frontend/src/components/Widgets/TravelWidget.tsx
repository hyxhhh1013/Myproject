import React from 'react';

export const TravelWidget: React.FC = () => {
  const travels = [
    {
      id: 1,
      city: "北京",
      country: "中国",
      image: "https://images.unsplash.com/photo-1516394881397-60770031356d?w=400&h=250&fit=crop",
      description: "探索古都的历史与现代交融，故宫的宏伟，胡同的烟火气",
      date: "2024.05"
    },
    {
      id: 2,
      city: "上海",
      country: "中国",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop",
      description: "魔都的繁华与魅力，外滩的夜景，弄堂的故事",
      date: "2024.08"
    },
    {
      id: 3,
      city: "杭州",
      country: "中国",
      image: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=400&h=250&fit=crop",
      description: "西湖美景，雷峰塔下，感受江南水乡的温柔",
      date: "2024.10"
    },
    {
      id: 4,
      city: "成都",
      country: "中国",
      image: "https://images.unsplash.com/photo-1544631764-03a90c50a085?w=400&h=250&fit=crop",
      description: "美食之都，熊猫基地，慢悠悠的生活节奏",
      date: "2025.01"
    }
  ];

  return (
    <div className="travel-widget card">
      <h3 className="widget-title">旅行足迹</h3>
      <p className="widget-desc">走过的路，看过的景，留下的美好回忆</p>
      <div className="travel-grid">
        {travels.map((travel) => (
          <div key={travel.id} className="travel-card">
            <div className="travel-image">
              <img src={travel.image} alt={`${travel.city}, ${travel.country}`} />
            </div>
            <div className="travel-info">
              <div className="location">
                <h4>{travel.city}</h4>
                <span className="country">{travel.country}</span>
              </div>
              <p className="travel-date">{travel.date}</p>
              <p className="travel-description">{travel.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add styles for travel widget
const style = document.createElement('style');
style.textContent = `
  .travel-widget .travel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .travel-widget .travel-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s;
  }
  
  .travel-widget .travel-card:hover {
    transform: translateY(-8px);
  }
  
  .travel-widget .travel-image {
    height: 200px;
    overflow: hidden;
  }
  
  .travel-widget .travel-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .travel-widget .travel-card:hover .travel-image img {
    transform: scale(1.1);
  }
  
  .travel-widget .travel-info {
    padding: 16px;
    color: #fff;
  }
  
  .travel-widget .location {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .travel-widget .location h4 {
    margin: 0;
    font-size: 18px;
  }
  
  .travel-widget .country {
    color: #aaa;
    font-size: 14px;
  }
  
  .travel-widget .travel-date {
    color: #aaa;
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .travel-widget .travel-description {
    font-size: 14px;
    color: #ccc;
    line-height: 1.4;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .travel-widget .travel-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);