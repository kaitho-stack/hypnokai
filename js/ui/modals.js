/**
 * Interactive Modals & Deep-Dive Drawers
 */

export class ModalManager {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.activeModal = null;
    this.init();
  }

  init() {
    // Drawer triggers
    document.querySelectorAll('[data-open-drawer]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-open-drawer');
        this.openModal(targetId);
      });
    });

    // Close buttons
    document.querySelectorAll('.drawer-close-btn, .modal-backdrop').forEach((btn) => {
      btn.addEventListener('click', () => this.closeAll());
    });

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.closeAll();
    modal.classList.add('is-active');
    document.body.classList.add('modal-open');
    this.activeModal = modal;

    if (this.audio) this.audio.playClick(800);

    // GSAP entrance animation for drawer content
    const sheet = modal.querySelector('.drawer-sheet');
    if (sheet && window.gsap) {
      gsap.fromTo(sheet, 
        { x: '100%', opacity: 0.8 }, 
        { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }

  closeAll() {
    if (!this.activeModal) return;

    const sheet = this.activeModal.querySelector('.drawer-sheet');
    if (sheet && window.gsap) {
      gsap.to(sheet, {
        x: '100%',
        duration: 0.45,
        ease: 'power3.in',
        onComplete: () => {
          this.activeModal.classList.remove('is-active');
          document.body.classList.remove('modal-open');
          this.activeModal = null;
        }
      });
    } else {
      this.activeModal.classList.remove('is-active');
      document.body.classList.remove('modal-open');
      this.activeModal = null;
    }

    if (this.audio) this.audio.playClick(400);
  }
}
