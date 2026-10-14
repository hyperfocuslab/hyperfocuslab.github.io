// ── Scroll-triggered reveal animations ──
    (function() {
      const reveals = document.querySelectorAll('.reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });
      reveals.forEach(el => observer.observe(el));
    })();

    // ── Topbar scroll effect ──
    (function() {
      const topbar = document.getElementById('topbar');
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            topbar.classList.toggle('scrolled', window.scrollY > 60);
            ticking = false;
          });
          ticking = true;
        }
      });
    })();

    // ── Floating particles ──
    (function() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const colors = [
        'rgba(99, 102, 241, 0.15)',
        'rgba(139, 92, 246, 0.12)',
        'rgba(52, 211, 153, 0.1)',
        'rgba(34, 211, 238, 0.08)'
      ];
      function createParticle() {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 20 + 25;
        p.style.cssText = `
          width: ${size}px; height: ${size}px;
          left: ${Math.random() * 100}vw;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          animation-duration: ${duration}s;
          animation-delay: ${Math.random() * duration}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), (duration + parseFloat(p.style.animationDelay)) * 1000);
      }
      // Initial batch
      for (let i = 0; i < 8; i++) setTimeout(createParticle, i * 600);
      // Continuous
      setInterval(createParticle, 4000);
    })();

    // ── Smooth scroll for anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // ── OS Detection for CTA Button ──
    (function() {
      const ctaBtn = document.getElementById('nav-cta-btn');
      if (ctaBtn) {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
          ctaBtn.href = "https://play.google.com/store/apps/details?id=com.peakly.android";
        }
      }
    })();
