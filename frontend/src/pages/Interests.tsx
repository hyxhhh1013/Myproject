import { useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MusicSection } from '../components/Sections/MusicSection';
import { MovieSection } from '../components/Sections/MovieSection';
import { TravelMap } from '../components/Sections/TravelMap';
import './Interests.css';

export default function Interests() {
  useEffect(() => {
    // Simple visitor counter
    const visited = sessionStorage.getItem('visited_interests');
    if (!visited) {
        axios.post('/site-config/view').catch(() => {});
        sessionStorage.setItem('visited_interests', 'true');
    }
  }, []);

  return (
    <div className="interests-page overflow-x-hidden">
      {/* Background with Texture */}
      <div className="background-texture"></div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            日常与兴趣
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            生活碎片：最近在听的歌、看过的电影、去过的地方
          </motion.p>
          <motion.div 
            className="hero-photo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </div>
      </section>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Music Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <MusicSection />
        </motion.div>
        
        {/* Movie Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <MovieSection />
        </motion.div>
        
        {/* Travel Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <TravelMap />
        </motion.div>
      </main>
      

    </div>
  );
}