import { useEffect, useRef, useState } from 'react';

const PROFILE = {
  name: 'Chandrbhan Kumar',
  brand: 'Chandrbhan.dev',
  email: 'your.email@example.com',
  github: 'https://github.com/chandrbhan12',
  linkedin: 'https://www.linkedin.com/in/chandrbhan-kumar-a85195376/',
};

const TYPING_ROLES = [
  'MERN Full-Stack Developer',
  'Java Backend Developer',
  'Python Programmer',
  'BCA Graduate (UG)',
];

const SKILL_CATEGORIES = ['All', 'MERN Fullstack', 'Java', 'Python', 'Tools'];

const SKILLS = [
  {
    category: 'MERN Fullstack',
    icon: 'M',
    accent: 'cyan',
    title: 'MERN Full-Stack',
    level: '90%',
    summary: 'End-to-end web apps with REST APIs, database modeling, and reactive UIs.',
    tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Mongoose', 'JWT Auth'],
  },
  {
    category: 'Java',
    icon: 'J',
    accent: 'amber',
    title: 'Java Development',
    level: '85%',
    summary: 'Object-oriented programming, clean architecture, and relational database integration.',
    tags: ['Core Java', 'OOPs', 'Collections', 'JDBC', 'Exception Handling', 'MySQL'],
  },
  {
    category: 'Python',
    icon: 'Py',
    accent: 'emerald',
    title: 'Python Programming',
    level: '85%',
    summary: 'Backend scripting, API development, data structures, and workflow automation.',
    tags: ['Python 3', 'Flask / FastAPI', 'Data Structures', 'Automation', 'REST APIs'],
  },
  {
    category: 'Tools',
    icon: '</>',
    accent: 'violet',
    title: 'Frontend & Dev Tools',
    level: '88%',
    summary: 'Modern responsive styling, API testing, and collaborative version control.',
    tags: ['JavaScript ES6+', 'HTML5 & CSS3', 'Git & GitHub', 'Postman', 'VS Code'],
  },
];

const PROJECTS = [
  {
    id: '01',
    title: 'ProductHub — MERN CRUD App',
    category: 'MERN Full-Stack',
    accent: 'cyan',
    description:
      'Full-stack inventory and product management platform with MongoDB Atlas, Express REST API (GET/POST/PUT/DELETE), and a responsive React frontend.',
    highlights: [
      'RESTful API with Mongoose validation',
      'Live search, create, update & delete',
      'MongoDB Atlas cloud persistence',
    ],
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    demoUrl: '#projects',
    codeUrl: PROFILE.github,
  },
  {
    id: '02',
    title: 'CampusCore — Student Portal',
    category: 'Java & SQL',
    accent: 'amber',
    description:
      'Object-oriented Java application designed to manage student records, attendance, and grades with structured JDBC database connectivity.',
    highlights: [
      'Modular OOP class hierarchy',
      'JDBC & MySQL CRUD operations',
      'Role-based access & validation',
    ],
    stack: ['Java', 'OOP', 'JDBC', 'MySQL'],
    demoUrl: '#projects',
    codeUrl: PROFILE.github,
  },
  {
    id: '03',
    title: 'PyPulse — API & Data Automator',
    category: 'Python Backend',
    accent: 'emerald',
    description:
      'Lightweight Python backend service for automating repetitive data tasks, parsing reports, and serving clean JSON endpoints.',
    highlights: [
      'Fast JSON API endpoints',
      'Automated CSV/JSON processing',
      'Clean modular Python architecture',
    ],
    stack: ['Python', 'FastAPI', 'REST', 'Automation'],
    demoUrl: '#projects',
    codeUrl: PROFILE.github,
  },
];

function useTypewriter(words, speed = 70, pause = 1500) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, speed, pause]);

  return words[wordIndex].slice(0, charIndex);
}

function Reveal({ children, variant = 'fade-up', delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant}${visible ? ' is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SpotlightCard({ className = '', children }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 10;
    const rx = (0.5 - y) * 10;
    setTilt({ rx, ry, gx: x * 100, gy: y * 100, active: true });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  }

  return (
    <div
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${
          tilt.active ? 'translateY(-3px)' : ''
        }`,
        '--gx': `${tilt.gx}%`,
        '--gy': `${tilt.gy}%`,
      }}
    >
      {children}
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const typedRole = useTypewriter(TYPING_ROLES);

  const filteredSkills =
    activeTab === 'All' ? SKILLS : SKILLS.filter((item) => item.category === activeTab);

  useEffect(() => {
    function onScroll() {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? Math.min(1, top / height) : 0);
      setScrolled(top > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <div className="aurora aurora-1" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />
      <div className="dot-matrix" aria-hidden="true" />

      <header className={`nav-wrap${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container nav-pill">
          <a href="#home" className="brand" onClick={closeMenu}>
            <span className="brand-dot" aria-hidden="true" />
            <span>{PROFILE.brand}</span>
          </a>

          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Primary">
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#skills" onClick={closeMenu}>Skills</a>
            <a href="#projects" onClick={closeMenu}>Projects</a>
            <a href="#education" onClick={closeMenu}>Education</a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noreferrer"
              className="nav-btn"
              onClick={closeMenu}
            >
              LinkedIn ↗
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="home" className="hero container">
          <div className="hero-content">
            <div className="status-chip hero-anim hero-anim-1">
              <span className="pulse-dot" />
              <span>UG: BCA Completed · Open to Full-Stack Roles</span>
            </div>

            <h1 className="hero-anim hero-anim-2">
              <span className="hero-greeting">Hi, I&apos;m {PROFILE.name}</span>
              <span className="typing-line gradient-text">
                <span>{typedRole}</span>
                <span className="typing-cursor" aria-hidden="true">|</span>
              </span>
            </h1>

            <p className="hero-subtitle hero-anim hero-anim-3">
              I craft modern, scalable web applications with the{' '}
              <strong>MERN Stack</strong>, backed by strong engineering fundamentals in{' '}
              <strong>Java</strong> and <strong>Python</strong>.
            </p>

            <div className="hero-cta hero-anim hero-anim-4">
              <a href="#projects" className="btn btn-primary">
                View Projects <span>→</span>
              </a>
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                GitHub ↗
              </a>
              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                LinkedIn ↗
              </a>
            </div>

            <div className="hero-metrics hero-anim hero-anim-5">
              <div className="metric">
                <strong>BCA</strong>
                <span>UG Completed</span>
              </div>
              <div className="metric-sep" />
              <div className="metric">
                <strong>MERN</strong>
                <span>Full-Stack Web</span>
              </div>
              <div className="metric-sep" />
              <div className="metric">
                <strong>Java · Python</strong>
                <span>Core &amp; Backend</span>
              </div>
            </div>
          </div>

          <div className="hero-visual hero-anim hero-anim-3">
            <SpotlightCard className="hero-3d-card">
              <div className="stage-glow" aria-hidden="true" />
              <div className="terminal-card">
                <div className="terminal-top">
                  <div className="terminal-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="terminal-title">portfolio.ts</span>
                </div>
                <pre className="terminal-code">
                  <code>
                    <span className="c-kw">export const</span>{' '}
                    <span className="c-var">developer</span> = {'{\n'}
                    {'  '}name: <span className="c-str">&quot;{PROFILE.name}&quot;</span>,{'\n'}
                    {'  '}degree: <span className="c-str">&quot;BCA (Completed)&quot;</span>,{'\n'}
                    {'  '}stack: [<span className="c-str">&quot;MERN&quot;</span>,{' '}
                    <span className="c-str">&quot;Java&quot;</span>,{' '}
                    <span className="c-str">&quot;Python&quot;</span>],{'\n'}
                    {'  '}focus: <span className="c-str">&quot;Modern Web &amp; APIs&quot;</span>,{'\n'}
                    {'  '}available: <span className="c-bool">true</span>{'\n'}
                    {'};'}
                  </code>
                </pre>
                <div className="terminal-footer">
                  <span className="tf-badge">MongoDB</span>
                  <span className="tf-badge">Express</span>
                  <span className="tf-badge">React</span>
                  <span className="tf-badge">Node.js</span>
                </div>
              </div>

              <div className="float-pill pill-top">MERN Stack</div>
              <div className="float-pill pill-left">Java OOP</div>
              <div className="float-pill pill-bottom">Python 3</div>
            </SpotlightCard>
          </div>
        </section>

        {/* BENTO ABOUT & HIGHLIGHTS */}
        <section id="about" className="section container">
          <Reveal variant="fade-up">
            <div className="section-head">
              <span className="section-kicker">01 · ABOUT ME</span>
              <h2>Engineering clean, modern software.</h2>
            </div>
          </Reveal>

          <div className="bento-grid">
            <Reveal variant="fade-right" delay={60} className="bento-span-2">
              <SpotlightCard className="bento-card about-main">
                <span className="bento-label">OVERVIEW</span>
                <h3>Full-Stack mindset with strong CS fundamentals.</h3>
                <p>
                  I&apos;m <strong>{PROFILE.name}</strong>, a{' '}
                  <strong>Bachelor of Computer Applications (BCA)</strong> graduate focused on
                  building fast, responsive web applications with the <strong>MERN Stack</strong>.
                </p>
                <p>
                  Beyond JavaScript, I write clean object-oriented code in <strong>Java</strong> and
                  automate backend workflows in <strong>Python</strong> — bridging frontend craft
                  with reliable backend engineering.
                </p>
              </SpotlightCard>
            </Reveal>

            <Reveal variant="fade-left" delay={120}>
              <SpotlightCard className="bento-card bento-mini">
                <span className="bento-icon">⚡</span>
                <h4>MERN Architecture</h4>
                <p>RESTful APIs, MongoDB schemas, and component-driven React UIs.</p>
              </SpotlightCard>
            </Reveal>

            <Reveal variant="fade-left" delay={200}>
              <SpotlightCard className="bento-card bento-mini">
                <span className="bento-icon">☕</span>
                <h4>Java &amp; Python</h4>
                <p>Strong OOP, Collections, DSA, and backend scripting.</p>
              </SpotlightCard>
            </Reveal>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="section container">
          <Reveal variant="fade-up">
            <div className="section-head row-head">
              <div>
                <span className="section-kicker">02 · TECH STACK</span>
                <h2>Skills &amp; Technologies</h2>
              </div>

              <div className="segmented-control" role="tablist" aria-label="Skill categories">
                {SKILL_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === category}
                    className={`seg-btn${activeTab === category ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="skills-grid">
            {filteredSkills.map((skill, idx) => (
              <Reveal key={skill.title} variant="zoom-in" delay={idx * 90}>
                <SpotlightCard className={`bento-card skill-card accent-${skill.accent}`}>
                  <div className="skill-top">
                    <div className="skill-icon">{skill.icon}</div>
                    <span className="skill-level">{skill.level}</span>
                  </div>
                  <h3>{skill.title}</h3>
                  <p>{skill.summary}</p>
                  <div className="progress-track" aria-hidden="true">
                    <div
                      className="progress-fill"
                      style={{ '--target-width': skill.level }}
                    />
                  </div>
                  <div className="tag-row">
                    {skill.tags.map((tag) => (
                      <span key={tag} className="tech-tag">{tag}</span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="section container">
          <Reveal variant="fade-up">
            <div className="section-head">
              <span className="section-kicker">03 · SELECTED WORK</span>
              <h2>Featured Projects</h2>
              <p className="section-desc">
                Practical applications built across MERN Full-Stack, Java, and Python.
              </p>
            </div>
          </Reveal>

          <div className="projects-grid">
            {PROJECTS.map((project, idx) => (
              <Reveal key={project.id} variant="fade-up" delay={idx * 110}>
                <SpotlightCard className={`bento-card project-card accent-${project.accent}`}>
                  <div className="project-preview">
                    <div className="preview-bar">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="preview-meta">
                      <span className="project-num">{project.id}</span>
                      <span className="project-cat">{project.category}</span>
                    </div>
                  </div>

                  <div className="project-body">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <ul className="project-points">
                      {project.highlights.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <div className="tag-row">
                      {project.stack.map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      <a href={project.demoUrl} className="btn btn-sm btn-primary">
                        Live Preview
                      </a>
                      <a
                        href={project.codeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* EDUCATION SECTION */}
        <section id="education" className="section container">
          <Reveal variant="fade-up">
            <div className="section-head">
              <span className="section-kicker">04 · EDUCATION</span>
              <h2>Academic Background</h2>
            </div>
          </Reveal>

          <Reveal variant="zoom-in" delay={80}>
            <SpotlightCard className="bento-card edu-banner">
              <div className="edu-left">
                <span className="edu-badge">UG DEGREE · COMPLETED</span>
                <h3>Bachelor of Computer Applications (BCA)</h3>
                <p>
                  Completed undergraduate degree in Computer Applications with a strong foundation
                  in software development, database systems, and modern programming languages.
                </p>
              </div>
              <div className="edu-right">
                <span className="edu-subhead">Core Coursework</span>
                <div className="tag-row">
                  <span className="tech-tag">Data Structures &amp; Algorithms</span>
                  <span className="tech-tag">DBMS &amp; SQL</span>
                  <span className="tech-tag">Object-Oriented Java</span>
                  <span className="tech-tag">Web Technologies</span>
                  <span className="tech-tag">Operating Systems</span>
                  <span className="tech-tag">Software Engineering</span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <a href="#home" className="brand">
            <span className="brand-dot" aria-hidden="true" />
            <span>{PROFILE.brand}</span>
          </a>
          <p>
            © {new Date().getFullYear()} {PROFILE.name} · BCA Graduate · MERN · Java · Python
          </p>
          <div className="footer-links">
            <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
