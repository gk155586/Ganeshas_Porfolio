'use strict';

/* ════════════════════════════════════════════
   LOADER
   ════════════════════════════════════════════ */
function initLoader() {
  const el = document.getElementById('loader');
  if (!el) return;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    el.classList.add('out');
    document.body.style.overflow = '';
  }, 2000);
}


/* ════════════════════════════════════════════
   SCROLL PROGRESS
   ════════════════════════════════════════════ */
function initScrollBar() {
  const bar = document.getElementById('scrollBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ════════════════════════════════════════════
   NAV
   ════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll class
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      links.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        burger.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link
  const sections = document.querySelectorAll('section[id]');
  const nls = document.querySelectorAll('.nl');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        nls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => obs.observe(s));
}

/* ════════════════════════════════════════════
   HERO CANVAS — ANIMATED MESH GRADIENT
   ════════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, t = 0;
  const orbs = [
    { x: 0.15, y: 0.2, r: 0.35, c: [99, 102, 241], s: 0.003 },
    { x: 0.85, y: 0.7, r: 0.3, c: [6, 182, 212], s: -0.002 },
    { x: 0.5, y: 0.9, r: 0.25, c: [139, 92, 246], s: 0.0025 },
    { x: 0.8, y: 0.1, r: 0.2, c: [16, 185, 129], s: -0.003 },
  ];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    if (prefersReduced) draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!prefersReduced) {
      t += 0.5;
    }

    orbs.forEach(o => {
      const x = (o.x + Math.sin(t * o.s + o.x * 10) * 0.08) * W;
      const y = (o.y + Math.cos(t * o.s * 0.7 + o.y * 10) * 0.08) * H;
      const r = o.r * Math.max(W, H);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},0.1)`);
      grad.addColorStop(1, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReduced) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  if (!prefersReduced) {
    draw();
  }
}

/* ════════════════════════════════════════════
   TYPEWRITER
   ════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('roleDynamic');
  if (!el) return;
  const words = ['scalable web apps', 'real-time systems', '50+ REST APIs', 'clean architecture', 'full-stack products', 'things that matter 🚀'];
  let wi = 0, ci = 0, del = false;

  function tick() {
    const w = words[wi];
    el.textContent = w.slice(0, ci);
    let delay = del ? 35 : 75;
    if (!del && ci === w.length) { delay = 2000; del = true; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 300; }
    else { ci += del ? -1 : 1; }
    setTimeout(tick, delay);
  }
  tick();
}

/* ════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════
   COUNTERS
   ════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = +el.dataset.target;
        let start = null;
        function step(ts) {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1500, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.7 });
  els.forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════
   PROJECT CARD GLOW
   ════════════════════════════════════════════ */
function initCardGlow() {
  if (!window.matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
}

/* ════════════════════════════════════════════
   CERTIFICATIONS CATEGORY FILTER
   ════════════════════════════════════════════ */
function initCertFilters() {
  const btns = document.querySelectorAll('.cf-btn');
  const cards = document.querySelectorAll('.cert-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
      // Trigger scroll reveal check
      window.dispatchEvent(new Event('scroll'));
    });
  });
}

/* ════════════════════════════════════════════
   CERTIFICATE MULTI-TABS
   ════════════════════════════════════════════ */
function initCertTabs() {
  document.querySelectorAll('.cert-card--multi').forEach(card => {
    const mainImg = card.querySelector('.cert-main-img');
    const tabs = card.querySelectorAll('.ct-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop lightbox from opening
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        mainImg.src = tab.dataset.img;
        mainImg.alt = tab.dataset.caption;
      });
    });
  });
}

/* ════════════════════════════════════════════
   CERTIFICATE LIGHTBOX
   ════════════════════════════════════════════ */
function initLightbox() {
  const realCerts = [
    { src: 'certs/cert_aws_developer.png',            caption: '☁️ AWS Certified Developer — Associate · Infosys Springboard · May 2026' },
    { src: 'certs/cert_full_stack_infosys.png',       caption: '💻 Full Stack Program Completion · Infosys Springboard · May 2026' },
    { src: 'certs/cert_yugayatra_completion.jpg',     caption: '💼 Software Developer Internship Completion · YugaYatra Retail (OPC) Pvt. Ltd. · 16 Feb – 16 May 2026' },
    { src: 'certs/cert_yugayatra_offer.jpg',          caption: '✉️ Software Engineer Intern Offer Letter · YugaYatra Retail · 16 February 2026' },
    { src: 'certs/cert_ijirt_publication.jpg',        caption: '📄 IJIRT Research Publication Certificate · Volume 12 Issue 8 · January 2026' },
    { src: 'certs/cert_iot_technex.jpg',              caption: '🥈 Advanced IoT — 2nd Position · IIT Varanasi Technex\'24 · 20–21 May 2024' },
    { src: 'certs/cert_nptel_iot.jpg',                caption: '🎓 NPTEL Elite Certificate: Introduction To Internet Of Things · IIT Kharagpur & Swayam · Jan–Apr 2025' },
    { src: 'certs/cert_google_cloud_ai.png',          caption: '🧠 Applying AI Principles with Google Cloud · Google Cloud · 2025' },
    { src: 'certs/cert_google_cloud_responsible_ai.png', caption: '🤖 Introduction to Responsible AI · Google Cloud · 2025' },
    { src: 'certs/cert_deep_learning.jpg',            caption: '🎓 Deep Learning using Python · MGM\'s COE — Dept. of CSE & IEI Students\' Chapter · 24–25 August 2024' },
    { src: 'certs/cert_abekus_ml.jpg',               caption: '🧠 Machine Learning Fundamentals Challenge · Abekus.ai · June 2026' },
    { src: 'certs/cert_guvi_pygame.png',              caption: '🎮 Game Development using PyGame · GUVI Geek Networks · Google for Education Partner · Dec 2023' },
    { src: 'certs/cert_java_infosys.jpg',             caption: '☕ Programming using Java · Infosys Springboard · Completed Dec 2023' },
    { src: 'certs/cert_python_infosys.jpg',           caption: '🐍 Programming Fundamentals using Python · Infosys Springboard · April 2024' },
    { src: 'certs/cert_gdsc_sparkignite.png',         caption: '🏆 Sparkignite Ideathon 2024 · GDSC MGM\'s College of Engineering · March 22, 2024' },
    { src: 'certs/cert_gdg_solution_challenge.jpg',   caption: '🏆 GDG on Campus Solution Challenge · Google Developer Groups · 2025' },
    { src: 'certs/cert_mgm_iot.jpg',                  caption: '📡 2-day Workshop on Internet of Things · MGM\'s COE — Dept. of CSE & IEI Students\' Chapter · 27–28 Sep 2024' },
    { src: 'certs/cert_mgm_frontend.jpg',             caption: '🖼️ Front-end Technologies Workshop · MGM\'s COE — Dept. of CSE & IEI Students\' Chapter · 26–27 Feb 2024' },
    { src: 'certs/cert_masai_javascript.jpg',         caption: '💻 JavaScript Tutorial Completion · Masai School · December 2023' },
    { src: 'certs/cert_nxtwave_ai_completion.jpg',    caption: '🤖 AI for Students: Build Your Own Generative AI Model — Project Completion · NXT Wave · 1 September 2023' },
    { src: 'certs/cert_nxtwave_ai_participation.jpg', caption: '🤖 AI for Students: Build Your Own Generative AI Model — Participation · NXT Wave · September 2023' },
    { src: 'certs/cert_google_cloud_gemini_security.png', caption: '🔒 Google Cloud: Gemini Security & Safety Principles · 2025' },
    { src: 'certs/cert_google_cloud_image_generation.png', caption: '🎨 Google Cloud: Image Generation with Diffusion Models · 2025' }
  ];

  const lb = document.getElementById('lightbox');
  const bd = document.getElementById('lbBackdrop');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCaption');
  const btnClose = document.getElementById('lbClose');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');
  if (!lb || !bd) return;

  let current = 0;

  function getActiveCertIndices() {
    const indices = [];
    document.querySelectorAll('.cert-card--real').forEach(card => {
      if (!card.classList.contains('hide')) {
        if (card.classList.contains('cert-card--multi')) {
          card.querySelectorAll('.ct-btn').forEach(btn => {
            indices.push(+btn.dataset.cert);
          });
        } else {
          indices.push(+card.dataset.cert);
        }
      }
    });
    return indices;
  }

  function open(idx) {
    const activeIndices = getActiveCertIndices();
    if (!activeIndices.includes(idx)) {
      if (activeIndices.length > 0) {
        idx = activeIndices[0];
      } else {
        return;
      }
    }

    current = idx;
    img.src = realCerts[current].src;
    img.alt = realCerts[current].caption;
    cap.textContent = realCerts[current].caption;
    lb.classList.add('open');
    bd.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    bd.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    const activeIndices = getActiveCertIndices();
    if (activeIndices.length === 0) return;

    const currentIdxInActive = activeIndices.indexOf(current);
    if (currentIdxInActive === -1) {
      open(activeIndices[0]);
    } else {
      const nextIdxInActive = (currentIdxInActive + dir + activeIndices.length) % activeIndices.length;
      open(activeIndices[nextIdxInActive]);
    }
  }

  // Bind real cert cards
  document.querySelectorAll('.cert-card--real').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ct-btn')) return; // Do not trigger lightbox if tab button was clicked
      
      let certIdx;
      if (card.classList.contains('cert-card--multi')) {
        const activeTab = card.querySelector('.ct-btn.active');
        certIdx = +activeTab.dataset.cert;
      } else {
        certIdx = +card.dataset.cert;
      }
      open(certIdx);
    });
  });

  btnClose.addEventListener('click', close);
  bd.addEventListener('click', close);
  btnPrev.addEventListener('click', () => navigate(-1));
  btnNext.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ════════════════════════════════════════════
   BACK TO TOP
   ════════════════════════════════════════════ */
function initBTT() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════════
   SMOOTH SCROLL
   ════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ════════════════════════════════════════════
   CONTACT FORM
   ════════════════════════════════════════════ */
function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn = form.querySelector('.cf-submit');
    const origText = btn.innerHTML;

    // 1. Honeypot Check
    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      console.warn('Spam submission detected.');
      return;
    }

    // 2. Client-Side Validation
    const name = document.getElementById('cfName').value.trim();
    const email = document.getElementById('cfEmail').value.trim();
    const subject = document.getElementById('cfSubject').value.trim();
    const message = document.getElementById('cfMessage').value.trim();

    if (!name || name.length < 2) {
      alert('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!subject || subject.length < 3) {
      alert('Please enter a valid subject.');
      return;
    }
    if (!message || message.length < 10) {
      alert('Please write a message of at least 10 characters.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Sending... ⏳';

    const accessKeyInput = form.querySelector('input[name="access_key"]');
    const accessKey = accessKeyInput ? accessKeyInput.value : '';

    // If key is not custom set, run fallback mailto link immediately
    if (!accessKey || accessKey.includes('YOUR_WEB3FORMS_ACCESS_KEY')) {
      window.location.href = `mailto:ganeshkalapadgk@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Ganesh,\n\nFrom: ${name}\nEmail: ${email}\n\n${message}`)}`;
      
      btn.innerHTML = '✅ Fallback Mail Opened!';
      btn.style.background = 'linear-gradient(135deg, var(--indigo), var(--cyan))';
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = origText;
        btn.style.background = '';
      }, 3000);
      return;
    }

    // Secure async submit to Web3Forms
    try {
      const formData = new FormData(form);
      const json = JSON.stringify(Object.fromEntries(formData));

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });

      const result = await response.json();

      if (response.status === 200) {
        btn.innerHTML = '✅ Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
        form.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      btn.innerHTML = '❌ Error sending!';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = origText;
        btn.style.background = '';
      }, 4000);
    }
  });
}

/* ════════════════════════════════════════════
   BENTO TILT
   ════════════════════════════════════════════ */
function initBentoTilt() {
  if (!window.matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.bento').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      b.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.01)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ════════════════════════════════════════════
   DEV CONSOLE BRANDING
   ════════════════════════════════════════════ */
function logBranding() {
  console.log('%c👨‍💻 Ganesh Sadashiv Kalapad', 'font-size:1.3rem;font-weight:800;color:#06b6d4');
  console.log('%cFull Stack Engineer · Pune · Available for hire\n🔗 github.com/gk155586', 'color:#6366f1;font-size:.9rem');
}

/* ════════════════════════════════════════════
   PUNE LIVE TIME
   ════════════════════════════════════════════ */
function initPuneTime() {
  const el = document.getElementById('liveTime');
  if (!el) return;
  function updateTime() {
    try {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      el.textContent = formatter.format(new Date());
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString();
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ════════════════════════════════════════════
   PROJECT SHOWCASE FILTERING
   ════════════════════════════════════════════ */
function initProjectFilters() {
  const btns = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.proj-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hide');
          // Brief timeout for transition trigger
          setTimeout(() => card.classList.remove('fade-out'), 20);
        } else {
          card.classList.add('fade-out');
          const onTransitionEnd = (e) => {
            if (e.propertyName === 'opacity' && card.classList.contains('fade-out')) {
              card.classList.add('hide');
            }
            card.removeEventListener('transitionend', onTransitionEnd);
          };
          card.addEventListener('transitionend', onTransitionEnd);
        }
      });
      // Force reveal update
      window.dispatchEvent(new Event('scroll'));
    });
  });
}

/* ════════════════════════════════════════════
   RESUME PREVIEW MODAL
   ════════════════════════════════════════════ */
function initResumeModal() {
  const modal = document.getElementById('resumeModal');
  const backdrop = document.getElementById('lbBackdrop');
  const navBtn = document.getElementById('navResumeBtn');
  const heroBtn = document.getElementById('heroResumeBtn');
  const closeBtn = document.getElementById('resumeClose');

  if (!modal || !backdrop) return;

  function open(e) {
    if (e) e.preventDefault();
    modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navBtn) navBtn.addEventListener('click', open);
  if (heroBtn) heroBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (modal.classList.contains('open') && e.key === 'Escape') {
      close();
    }
  });
}

/* ════════════════════════════════════════════
   THEME TOGGLE & DYNAMIC GITHUB STATS
   ════════════════════════════════════════════ */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const githubImg = document.getElementById('githubStatsImg');
  if (!toggle) return;

  function updateGithubStats(theme) {
    if (!githubImg) return;
    if (theme === 'light') {
      githubImg.src = 'https://github-readme-stats.vercel.app/api?username=gk155586&show_icons=true&theme=transparent&title_color=6366f1&icon_color=06b6d4&text_color=334155&hide_border=true';
    } else {
      githubImg.src = 'https://github-readme-stats.vercel.app/api?username=gk155586&show_icons=true&theme=transparent&title_color=06b6d4&icon_color=6366f1&text_color=cbd5e1&hide_border=true';
    }
  }

  // Set initial image theme
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateGithubStats(initialTheme);

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    updateGithubStats(newTheme);
  });
}

/* ════════════════════════════════════════════
   COMMAND PALETTE (CMD+K)
   ════════════════════════════════════════════ */
function initCommandPalette() {
  const palette = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  const items = list ? list.querySelectorAll('.cmd-item') : [];

  if (!palette || !input || !list) return;

  let activeIndex = 0;
  let visibleItems = Array.from(items);

  function open() {
    palette.classList.add('open');
    input.value = '';
    filter('');
    setTimeout(() => input.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    palette.classList.remove('open');
    document.body.style.overflow = '';
  }

  function filter(query) {
    visibleItems = [];
    const lower = query.toLowerCase();

    items.forEach(item => {
      const label = item.querySelector('.cmd-label').textContent.toLowerCase();
      const shortcut = item.querySelector('.cmd-shortcut').textContent.toLowerCase();

      if (label.includes(lower) || shortcut.includes(lower)) {
        item.style.display = 'flex';
        visibleItems.push(item);
      } else {
        item.style.display = 'none';
      }
    });

    activeIndex = 0;
    updateActive();
  }

  function updateActive() {
    items.forEach(item => item.classList.remove('active'));
    if (visibleItems.length > 0) {
      if (activeIndex >= visibleItems.length) activeIndex = 0;
      if (activeIndex < 0) activeIndex = visibleItems.length - 1;
      visibleItems[activeIndex].classList.add('active');
      visibleItems[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function execute(item) {
    if (!item) return;
    const action = item.getAttribute('data-action');
    const target = item.getAttribute('data-target');

    close();

    if (action === 'nav') {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'theme') {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
      
      const githubImg = document.getElementById('githubStatsImg');
      if (githubImg) {
        if (newTheme === 'light') {
          githubImg.src = 'https://github-readme-stats.vercel.app/api?username=gk155586&show_icons=true&theme=transparent&title_color=6366f1&icon_color=06b6d4&text_color=334155&hide_border=true';
        } else {
          githubImg.src = 'https://github-readme-stats.vercel.app/api?username=gk155586&show_icons=true&theme=transparent&title_color=06b6d4&icon_color=6366f1&text_color=cbd5e1&hide_border=true';
        }
      }
    } else if (action === 'resume') {
      const resumeModal = document.getElementById('resumeModal');
      const backdrop = document.getElementById('lbBackdrop');
      if (resumeModal && backdrop) {
        resumeModal.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    } else if (action === 'link') {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  }

  // Bind key shortcut listener
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette.classList.contains('open')) {
        close();
      } else {
        open();
      }
    }
    if (e.key === 'Escape' && palette.classList.contains('open')) {
      close();
    }
  });

  input.addEventListener('input', e => {
    filter(e.target.value);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex++;
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex--;
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleItems.length > 0) {
        execute(visibleItems[activeIndex]);
      }
    }
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      execute(item);
    });
    item.addEventListener('mouseenter', () => {
      activeIndex = visibleItems.indexOf(item);
      updateActive();
    });
  });

  palette.addEventListener('click', e => {
    if (e.target === palette) close();
  });
}

/* ════════════════════════════════════════════
   INIT ALL
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollBar();
  initNav();
  initHeroCanvas();
  initTypewriter();
  initReveal();
  initCounters();
  initCardGlow();
  initCertFilters();
  initCertTabs();
  initLightbox();
  initBTT();
  initSmoothScroll();
  initForm();
  initBentoTilt();
  initPuneTime();
  initThemeToggle();
  initProjectFilters();
  initResumeModal();
  initCommandPalette();
  logBranding();
});

