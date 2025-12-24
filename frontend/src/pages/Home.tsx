import { useEffect } from 'react';
import axios from 'axios';
import { Hero } from '../components/Sections/Hero';
import { About } from '../components/Sections/About';
import { Skills } from '../components/Sections/Skills';
import { Projects } from '../components/Sections/Projects';
import { Photos } from '../components/Sections/Photos';
import { Contact } from '../components/Sections/Contact';
import { Experience } from '../components/Sections/Experience';

const Home = () => {
  useEffect(() => {
    // Simple visitor counter
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
        axios.post('/site-config/view').catch(() => {});
        sessionStorage.setItem('visited', 'true');
    }
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Hero />
      <Projects />
      <Skills />
      <About />
      <Experience />
      <Photos />
      <Contact />
    </div>
  );
};

export default Home;
