/**
 * GSAP-Powered Fluid Magnetic Cursor & Elastic Interactive Physics
 */

export class FluidCursor {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.cursor = document.getElementById('custom-cursor');
    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorRing = document.getElementById('cursor-ring');
    this.cursorLabel = document.getElementById('cursor-label');

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.init();
  }

  init() {
    // Check for touch device - disable custom cursor on touch
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (this.cursor) this.cursor.style.display = 'none';
      return;
    }

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Start cursor animation loop with GSAP
    gsap.ticker.add(() => this.update());

    // Bind Magnetic Button physics
    this.bindMagneticElements();
  }

  update() {
    // Smooth lerp follow
    this.pos.x += (this.mouse.x - this.pos.x) * 0.22;
    this.pos.y += (this.mouse.y - this.pos.y) * 0.22;

    if (this.cursorDot) {
      gsap.set(this.cursorDot, { x: this.mouse.x, y: this.mouse.y });
    }
    if (this.cursorRing) {
      gsap.set(this.cursorRing, { x: this.pos.x, y: this.pos.y });
    }
  }

  bindMagneticElements() {
    // Select all interactive targets: .pill, .micro-tag, a, button, .interactive-card
    const magneticTargets = document.querySelectorAll('.magnetic, .pill, .micro-tag, .nav-item, button');

    magneticTargets.forEach((el) => {
      // Mouse enter / hover
      el.addEventListener('mouseenter', () => {
        this.cursorRing.classList.add('is-hovering');
        const customText = el.getAttribute('data-cursor-text') || '';
        if (customText && this.cursorLabel) {
          this.cursorLabel.textContent = customText;
          this.cursorRing.classList.add('has-label');
        }
        if (this.audio) this.audio.playHover();
      });

      // Mouse leave
      el.addEventListener('mouseleave', () => {
        this.cursorRing.classList.remove('is-hovering', 'has-label');
        if (this.cursorLabel) this.cursorLabel.textContent = '';
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.38)'
        });
      });

      // Mouse move (magnetic pull)
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.32;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(el, {
          x: deltaX,
          y: deltaY,
          duration: 0.45,
          ease: 'power2.out'
        });
      });

      // Click sound
      el.addEventListener('click', () => {
        if (this.audio) this.audio.playClick();
      });
    });
  }
}
