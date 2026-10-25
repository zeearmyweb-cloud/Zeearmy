/**
 * zeearmy - Modern Antigravity Landing Page Script
 * Interactive Physics, Floating Particles, 3D Card Tilt, Form Handlers & Smooth FX
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initAntigravityCanvas();
  initNavbarScroll();
  initMobileMenu();
  initCardTiltAndSpotlight();
  initCounters();
  initFaqAccordion();
  initContactForm();
  initDraggableBadges();
});

/* -------------------------------------------------------------
 * 1. Ambient Cursor Glow Follower
 * ------------------------------------------------------------- */
function initCursorGlow() {
  const cursorGlow = document.querySelector('.cursor-glow');
  if (!cursorGlow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

/* -------------------------------------------------------------
 * 2. Antigravity Hero Canvas Simulation
 * ------------------------------------------------------------- */
function initAntigravityCanvas() {
  const canvas = document.getElementById('antigravity-hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    const hero = canvas.parentElement;
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse tracking on canvas
  const mouse = {
    x: width / 2,
    y: height / 2,
    radius: 140,
    isActive: false
  };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.isActive = true;
  });

  // Shockwaves array
  const shockwaves = [];

  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 10;
      this.maxRadius = 180;
      this.alpha = 0.8;
      this.speed = 5;
    }
    update() {
      this.radius += this.speed;
      this.alpha *= 0.94;
    }
    draw() {
      if (this.alpha <= 0.02) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 121, 249, ${this.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#E879F9';
      ctx.stroke();
      ctx.restore();
    }
  }

  // Trigger shockwave on click
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    shockwaves.push(new Shockwave(clickX, clickY));

    // Push all nodes away from click
    nodes.forEach(node => {
      const dx = node.x - clickX;
      const dy = node.y - clickY;
      const dist = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 150 - dist) / 12;
      node.vx += (dx / dist) * force;
      node.vy += (dy / dist) * force;
    });

    // Also push floating badges
    const badges = document.querySelectorAll('.antigravity-badge-float');
    badges.forEach(b => {
      b.classList.add('pulse-border-glow');
      setTimeout(() => b.classList.remove('pulse-border-glow'), 800);
    });
  });

  // Antigravity Node Definition
  class Node {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 50;
      this.size = Math.random() * 3 + 1.8;
      this.baseVx = (Math.random() - 0.5) * 0.8;
      this.baseVy = -(Math.random() * 0.6 + 0.3); // antigravity upward drift
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      this.alpha = Math.random() * 0.5 + 0.3;
      this.color = Math.random() > 0.4 ? '#C084FC' : '#E879F9';
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseCounter = Math.random() * Math.PI;
    }

    update() {
      // Float up against gravity
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion / antigravity field
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (1 - distance / mouse.radius) * 3;
          const angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force * 0.6;
          this.vy -= Math.sin(angle) * force * 0.6;
        }
      }

      // Smooth damping back to drift speed
      this.vx += (this.baseVx - this.vx) * 0.03;
      this.vy += (this.baseVy - this.vy) * 0.03;

      // Boundary wraps
      if (this.y < -20) {
        this.y = height + 10;
        this.x = Math.random() * width;
      }
      if (this.x < -20) this.x = width + 10;
      if (this.x > width + 20) this.x = -10;

      this.pulseCounter += this.pulseSpeed;
    }

    draw() {
      const currentAlpha = this.alpha + Math.sin(this.pulseCounter) * 0.2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // Generate constellation nodes
  const nodeCount = Math.min(Math.floor(window.innerWidth / 18), 65);
  const nodes = Array.from({ length: nodeCount }, () => new Node());

  function drawLines() {
    const maxDistance = 110;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Draw shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.update();
      sw.draw();
      if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(i, 1);
      }
    }

    drawLines();
    nodes.forEach(node => {
      node.update();
      node.draw();
    });

    requestAnimationFrame(loop);
  }

  loop();
}

/* -------------------------------------------------------------
 * 3. Draggable / Floating Antigravity Badges (Hero Interactive)
 * ------------------------------------------------------------- */
function initDraggableBadges() {
  const badges = document.querySelectorAll('.antigravity-badge-float');
  badges.forEach((badge) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let vx = 0;
    let vy = 0;
    let animId = null;

    // Random initial slight float offset
    const floatPhase = Math.random() * Math.PI * 2;
    const floatSpeed = 0.002 + Math.random() * 0.0015;
    const floatAmp = 10 + Math.random() * 8;

    function applyFloat(time) {
      if (!isDragging) {
        // Natural gentle levitation
        const waveX = Math.cos(time * floatSpeed + floatPhase) * (floatAmp * 0.5);
        const waveY = Math.sin(time * floatSpeed + floatPhase) * floatAmp;
        
        currentX += (targetX + waveX - currentX) * 0.08;
        currentY += (targetY + waveY - currentY) * 0.08;

        badge.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      animId = requestAnimationFrame(applyFloat);
    }
    requestAnimationFrame(applyFloat);

    // Mouse drag events
    badge.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      badge.style.cursor = 'grabbing';
      badge.style.zIndex = '50';
      badge.classList.add('pulse-border-glow');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      badge.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      badge.style.cursor = 'grab';
      badge.style.zIndex = '';
      badge.classList.remove('pulse-border-glow');
      targetX = currentX * 0.85; // gently settle
      targetY = currentY * 0.85;
    });

    // Touch events for mobile
    badge.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      isDragging = true;
      startX = e.touches[0].clientX - currentX;
      startY = e.touches[0].clientY - currentY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      badge.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      targetX = currentX * 0.85;
      targetY = currentY * 0.85;
    });
  });
}

/* -------------------------------------------------------------
 * 4. Navbar Scroll & Dynamic Blur
 * ------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active section spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-item');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-purple-400', 'font-semibold');
      link.classList.add('text-gray-300');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('text-purple-400', 'font-semibold');
        link.classList.remove('text-gray-300');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 5. Mobile Navigation Menu Toggle
 * ------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  function toggleMenu(show) {
    if (show) {
      mobileMenu.classList.remove('hidden');
      setTimeout(() => {
        mobileMenu.classList.remove('opacity-0', 'translate-y-[-10px]');
      }, 10);
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('opacity-0', 'translate-y-[-10px]');
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 300);
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', () => toggleMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* -------------------------------------------------------------
 * 6. 3D Card Tilt & Mouse Spotlight Effect
 * ------------------------------------------------------------- */
function initCardTiltAndSpotlight() {
  const cards = document.querySelectorAll('.card-spotlight, .glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS variables for radial spotlight
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* -------------------------------------------------------------
 * 7. Animated Metric Counters
 * ------------------------------------------------------------- */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-value');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const duration = 2000;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) observer.observe(statsSection);
}

/* -------------------------------------------------------------
 * 8. FAQ Accordion
 * ------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');

      // Close all other accordions
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.querySelector('.faq-content')?.classList.add('hidden');
          otherItem.querySelector('.faq-icon')?.classList.remove('rotate-180');
          otherItem.classList.remove('border-purple-500/50');
        }
      });

      if (isOpen) {
        content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
        item.classList.remove('border-purple-500/50');
      } else {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
        item.classList.add('border-purple-500/50');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 9. Contact Form & Toast Notification & WhatsApp Integration
 * ------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');
  const whatsappQuickBtn = document.getElementById('whatsapp-quick-cta');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name')?.value.trim();
    const email = document.getElementById('form-email')?.value.trim();
    const service = document.getElementById('form-service')?.value;
    const message = document.getElementById('form-message')?.value.trim();

    if (!name || !email || !message) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Animated submitting state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Enviando solicitud...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      // Show toast
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 5000);
      }
    }, 1200);
  });

  // Dynamic WhatsApp quick action
  if (whatsappQuickBtn) {
    whatsappQuickBtn.addEventListener('click', () => {
      const phoneNumber = '584142179693';
      const defaultMsg = encodeURIComponent('¡Hola zeearmy! Me gustaría cotizar un proyecto de Desarrollo Web a medida.');
      window.open(`https://wa.me/${phoneNumber}?text=${defaultMsg}`, '_blank');
    });
  }
}
