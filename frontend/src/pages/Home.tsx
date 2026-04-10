import { useEffect, Suspense, lazy } from 'react';
import axios from '../utils/axiosConfig';
import { Hero } from '../components/Sections/Hero';
import { ParticleBackground } from '../components/UI/ParticleBackground';

// Lazy load non-hero sections
const About = lazy(() => import('../components/Sections/About').then(module => ({ default: module.About })));
const Skills = lazy(() => import('../components/Sections/Skills').then(module => ({ default: module.Skills })));
const Projects = lazy(() => import('../components/Sections/Projects').then(module => ({ default: module.Projects })));
const Experience = lazy(() => import('../components/Sections/Experience').then(module => ({ default: module.Experience })));
const Photos = lazy(() => import('../components/Sections/Photos').then(module => ({ default: module.Photos })));
const Contact = lazy(() => import('../components/Sections/Contact').then(module => ({ default: module.Contact })));

const SectionLoader = () => (
  <div className="py-20 text-center flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Home = () => {
  useEffect(() => {
    // Simple visitor counter
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
      axios.post('/api/site-config/view').catch(() => {});
      sessionStorage.setItem('visited', 'true');
    }
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <ParticleBackground />
      <Hero />
      <Suspense fallback={<SectionLoader />}>
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Photos />
        <Contact />
      </Suspense>
    </div>
  );
};

export default Home;
