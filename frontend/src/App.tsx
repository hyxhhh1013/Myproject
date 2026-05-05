import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Experience from './pages/Experience'
import Skills from './pages/Skills'
import Projects from './pages/Projects'
import Contact from './pages/Contact'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              个人自我介绍
            </Link>
            <div className="hidden md:flex space-x-8">
              <NavLink to="/">首页</NavLink>
              <NavLink to="/about">关于我</NavLink>
              <NavLink to="/experience">工作经历</NavLink>
              <NavLink to="/skills">技能</NavLink>
              <NavLink to="/projects">项目案例</NavLink>
              <NavLink to="/contact">联系方式</NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} 个人自我介绍网站. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

// Navigation Link Component
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
    >
      {children}
    </Link>
  )
}

export default App