import { PROFILE_DATA } from './data/profile.js';
import { SculptureStage } from './three/scene.js';
import { AudioEngine } from './audio/engine.js';
import { FluidCursor } from './ui/cursor.js';
import { ModalManager } from './ui/modals.js';

class App {
  constructor() {
    this.stage = null;
    this.audio = null;
    this.cursor = null;
    this.modals = null;
    this.lenis = null;

    this.init();
  }

  init() {
    console.log('[HYPNOKAI Experience] Initializing music player & portfolio...');

    // 1. Locate HypnoKai Section Data & Playlist
    const hypnoSection = PROFILE_DATA.sections.find((s) => s.id === 'hypnokai') || PROFILE_DATA.sections[2];
    const playlist = hypnoSection?.playlist || [];

    // 2. Initialize Audio Engine
    this.audio = new AudioEngine(playlist);

    // 3. Initialize 3D Sculpture Stage
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      this.stage = new SculptureStage(canvasContainer);
    }

    // 4. Initialize Lenis Smooth Scroll
    this.initLenis();

    // 5. Initialize Fluid Cursor & Magnetic Physics
    this.cursor = new FluidCursor(this.audio);

    // 6. Initialize Modals
    this.modals = new ModalManager(this.audio);

    // 7. Initialize Clean HypnoKai Music Player Tool
    this.initMusicPlayer();

    // 8. Footer Mini-Visualizer
    this.initFooterVisualizer();

    // 9. Kinetic Hero Headline Letter Dispersal
    this.initHeroHeadlineDispersal();

    // 10. Bind Global Listeners
    this.bindGlobalEvents();

    // 11. Start Animation Loop
    this.startLoop();
  }

  initLenis() {
    if (window.Lenis) {
      this.lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95
      });

      this.lenis.on('scroll', (e) => {
        const scrollPercent = e.progress; // 0.0 to 1.0
        if (this.stage) {
          this.stage.setScrollProgress(scrollPercent);
        }
        this.updateNavHighlight(e.scroll);
        if (this.updateHeroDispersal) {
          this.updateHeroDispersal(e.scroll);
        }
      });
    }

    // Scroll fallback for non-Lenis or native wheel
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (!this.lenis && this.updateHeroDispersal) {
        this.updateHeroDispersal(scrollY);
      }
    }, { passive: true });
  }

  initHeroHeadlineDispersal() {
    const headline = document.getElementById('hero-headline');
    if (!headline) return;

    const chars = Array.from(headline.querySelectorAll('.hero-char'));
    if (!chars.length) return;

    // Custom 3D explosion vectors for each letter
    const vectors = [
      { x: -160, y: -90,  z: 180, rz: -42, rx: 28,  s: 1.45, col: '#00f5d4' }, // K
      { x: -110, y: -150, z: 140, rz: -26, rx: -22, s: 1.30, col: '#2c42fb' }, // A
      { x: -60,  y: -115, z: 220, rz: 20,  rx: 36,  s: 1.50, col: '#9d4edd' }, // I
      { x: -15,  y: -175, z: 160, rz: -30, rx: -32, s: 1.35, col: '#ff0055' }, // T
      { x: 35,   y: -130, z: 200, rz: 34,  rx: 28,  s: 1.40, col: '#00f5d4' }, // H
      { x: 85,   y: -165, z: 140, rz: -20, rx: -25, s: 1.30, col: '#b5179e' }, // O
      { x: 135,  y: -110, z: 250, rz: 28,  rx: 32,  s: 1.55, col: '#2c42fb' }, // R
      { x: 185,  y: -155, z: 170, rz: -38, rx: -22, s: 1.40, col: '#00f5d4' }, // P
      { x: 235,  y: -95,  z: 220, rz: 46,  rx: 38,  s: 1.45, col: '#ff5b94' }, // E
      { x: 285,  y: -190, z: 290, rz: 68,  rx: 48,  s: 1.80, col: '#00f5d4' }  // .
    ];

    this.updateHeroDispersal = (scrollY) => {
      // Calculate title position relative to document
      const headlineTop = headline.offsetTop;
      const headlineHeight = headline.offsetHeight;
      const halfwayPastTitle = headlineTop + headlineHeight * 0.5;

      // When user scrolls halfway past the title text, letters break apart
      const triggerThreshold = Math.max(50, halfwayPastTitle * 0.45);
      const dispersalDistance = 300;

      let progress = 0;
      if (scrollY > triggerThreshold) {
        progress = Math.min(1, Math.max(0, (scrollY - triggerThreshold) / dispersalDistance));
      }

      const easeProgress = Math.pow(progress, 1.25);

      chars.forEach((char, i) => {
        const v = vectors[i % vectors.length];
        if (progress <= 0.001) {
          char.style.transform = '';
          char.style.opacity = '1';
          char.style.filter = '';
          char.style.mixBlendMode = '';
          char.style.textShadow = '';
        } else {
          const dx = v.x * easeProgress;
          const dy = v.y * easeProgress;
          const dz = v.z * easeProgress;
          const rz = v.rz * easeProgress;
          const rx = v.rx * easeProgress;
          const scale = 1 + (v.s - 1) * easeProgress;
          const blur = easeProgress * 16;
          const opacity = Math.max(0, 1 - easeProgress * 1.05);

          char.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, ${dz.toFixed(1)}px) rotateZ(${rz.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
          char.style.opacity = opacity.toFixed(3);
          char.style.filter = `blur(${blur.toFixed(1)}px)`;
          char.style.mixBlendMode = 'screen';
          char.style.textShadow = `0 0 ${Math.round(easeProgress * 20)}px ${v.col}, 0 0 ${Math.round(easeProgress * 40)}px rgba(0, 245, 212, 0.4)`;
        }
      });

      // Mix into 3D glass background graphic
      if (this.stage && typeof this.stage.setHeroDispersalProgress === 'function') {
        this.stage.setHeroDispersalProgress(easeProgress);
      }
    };
  }

  updateNavHighlight(scrollY) {
    const sections = ['operations', 'logic', 'hypnokai', 'amoc-section', 'audio'];
    const navItems = document.querySelectorAll('.nav-index-link');

    let currentSection = '';
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop - window.innerHeight * 0.45;
        if (scrollY >= top) {
          currentSection = id;
        }
      }
    });

    navItems.forEach((link) => {
      const target = link.getAttribute('href')?.replace('#', '');
      if (target === currentSection) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  // ==========================================================================
  // STREAMLINED HYPNOKAI MUSIC PLAYER
  // ==========================================================================
  initMusicPlayer() {
    this.playBtn = document.getElementById('player-play-btn');
    this.prevBtn = document.getElementById('player-prev-btn');
    this.nextBtn = document.getElementById('player-next-btn');
    this.scrubber = document.getElementById('player-scrubber');
    this.scrubberFill = document.getElementById('scrubber-fill');
    this.timeCurrent = document.getElementById('time-current');
    this.timeDuration = document.getElementById('time-duration');
    this.volSlider = document.getElementById('player-volume');
    this.muteBtn = document.getElementById('player-mute-btn');
    this.albumArt = document.getElementById('player-album-art');
    this.albumArtGlow = document.getElementById('album-art-glow');
    this.titleEl = document.getElementById('player-title');
    this.artistEl = document.getElementById('player-artist');
    this.descEl = document.getElementById('player-desc');
    this.playlistContainer = document.getElementById('player-playlist-list');

    // Transport buttons
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.toggleMasterPlay());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.audio.prev();
        this.audio.playClick(500);
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.audio.next();
        this.audio.playClick(700);
      });
    }

    // Scrubber interaction
    if (this.scrubber) {
      this.scrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.scrubberFill) this.scrubberFill.style.width = `${val}%`;
        this.audio.seekPercent(val);
      });
    }

    // Volume slider & mute
    if (this.volSlider) {
      this.volSlider.addEventListener('input', (e) => {
        this.audio.setVolume(parseFloat(e.target.value));
      });
    }
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        this.updateVolumeIcons(isMuted);
      });
    }

    // Shuffle / Randomize button
    this.shuffleBtn = document.getElementById('player-shuffle-btn');
    if (this.shuffleBtn) {
      this.shuffleBtn.addEventListener('click', () => {
        this.audio.shufflePlaylist();
        this.audio.loadTrack(0, this.audio.isPlaying);
        this.renderMusicPlaylist();
        this.audio.playClick(800);
        this.showToast('Discography queue randomized');
      });
    }

    // Audio Engine Callbacks
    this.audio.onPlayStateChange = (isPlaying) => {
      this.updatePlayIcons(isPlaying);
      this.syncFooterAudioButton(isPlaying);
      this.updateActiveTrackHighlight();
      const wrapper = document.getElementById('album-art-wrapper');
      if (wrapper) wrapper.classList.toggle('is-playing', isPlaying);
    };

    this.audio.onTrackChange = (track, index) => {
      this.updateNowPlayingUI(track, index);
      this.updateActiveTrackHighlight();
    };

    this.audio.onTimeUpdate = (currentSec, totalSec, pct) => {
      if (this.scrubber) this.scrubber.value = pct;
      if (this.scrubberFill) this.scrubberFill.style.width = `${pct}%`;
      if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(currentSec);
      if (this.timeDuration && totalSec > 0) this.timeDuration.textContent = this.formatTime(totalSec);
    };

    // Render 20 tracks in playlist queue
    this.renderMusicPlaylist();

    // Set initial track display
    const initialTrack = this.audio.getCurrentTrack();
    if (initialTrack) {
      this.updateNowPlayingUI(initialTrack, 0);
    }

    // Oscilloscope canvas
    this.initMasterOscilloscope();
  }

  formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  updateNowPlayingUI(track, index) {
    if (!track) return;
    if (this.titleEl) this.titleEl.textContent = track.title;
    if (this.artistEl) this.artistEl.textContent = track.artist || 'HypnoKai';
    if (this.descEl) this.descEl.textContent = track.desc || '';
    if (this.albumArt) {
      const artSrc = track.art || 'assets/art/generic-album-art.jpg';
      this.albumArt.src = artSrc;
      this.albumArt.alt = `${track.title} Album Art`;
    }
    if (this.timeDuration) {
      this.timeDuration.textContent = track.duration || '00:00';
    }
    if (this.timeCurrent) {
      this.timeCurrent.textContent = '00:00';
    }
    if (this.scrubber) {
      this.scrubber.value = 0;
    }
    if (this.scrubberFill) {
      this.scrubberFill.style.width = '0%';
    }
  }

  updateActiveTrackHighlight() {
    const rows = document.querySelectorAll('.pl-item-row');
    rows.forEach((row, idx) => {
      const isCurrent = idx === this.audio.currentIndex;
      row.classList.toggle('is-active', isCurrent);
      row.classList.toggle('is-playing', isCurrent && this.audio.isPlaying);
    });
  }

  updateVolumeIcons(isMuted) {
    const onIcon = document.querySelector('.icon-vol-on');
    const mutedIcon = document.querySelector('.icon-vol-muted');
    if (onIcon && mutedIcon) {
      onIcon.style.display = isMuted ? 'none' : 'block';
      mutedIcon.style.display = isMuted ? 'block' : 'none';
    }
  }

  renderMusicPlaylist() {
    if (!this.playlistContainer) return;
    this.playlistContainer.innerHTML = '';

    this.audio.playlist.forEach((track, idx) => {
      const row = document.createElement('div');
      row.className = `pl-item-row magnetic ${idx === this.audio.currentIndex ? 'is-active' : ''}`;
      row.setAttribute('role', 'listitem');
      row.setAttribute('data-cursor-text', 'PLAY');
      const numStr = (idx + 1 < 10) ? `0${idx + 1}` : `${idx + 1}`;

      const artSrc = track.art || 'assets/art/generic-album-art.jpg';

      row.innerHTML = `
        <span class="pl-track-num">${numStr}</span>
        <div class="pl-thumb-frame">
          <img src="${artSrc}" alt="${track.title}" class="pl-thumb-img" loading="lazy" />
          <div class="pl-playing-bars" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="pl-track-details">
          <div class="pl-track-title">${track.title}</div>
          <div class="pl-track-artist">${track.artist}</div>
        </div>
        <div class="pl-track-time">${track.duration}</div>
      `;

      row.addEventListener('click', () => {
        if (this.audio.currentIndex === idx) {
          this.audio.togglePlay();
        } else {
          this.audio.loadTrack(idx, true);
        }
      });

      this.playlistContainer.appendChild(row);
    });

    if (this.cursor) {
      this.cursor.bindMagneticElements();
    }
  }

  toggleMasterPlay() {
    const isPlaying = this.audio.togglePlay();
    this.updatePlayIcons(isPlaying);
  }

  updatePlayIcons(isPlaying) {
    if (!this.playBtn) return;
    const playIcon = this.playBtn.querySelector('.icon-play');
    const pauseIcon = this.playBtn.querySelector('.icon-pause');
    if (playIcon && pauseIcon) {
      playIcon.style.display = isPlaying ? 'none' : 'block';
      pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
  }

  syncFooterAudioButton(isPlaying) {
    document.querySelectorAll('.toggle-audio-btn').forEach((b) => {
      b.classList.toggle('sound-active', isPlaying);
      const textSpan = b.querySelector('.audio-label-text');
      if (textSpan) textSpan.textContent = isPlaying ? 'HypnoKai [ Playing ]' : 'HypnoKai [ Play ]';
    });
  }

  initMasterOscilloscope() {
    const canvas = document.getElementById('deck-oscilloscope-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const visData = this.audio.getDeckVisualizationData();
      const wave = visData.waveformData;
      const freq = visData.frequencies;

      // 1. Stereo Frequency Spectrum Bars
      const numBars = 48;
      const barWidth = width / numBars;
      for (let i = 0; i < numBars; i++) {
        const val = this.audio.isPlaying ? (freq[i % freq.length] || 0) : 6;
        const barH = Math.max(2, (val / 255) * (height * 0.75));
        const x = i * barWidth;
        const y = height - barH;

        ctx.fillStyle = this.audio.isPlaying ? 'rgba(0, 245, 212, 0.3)' : 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(x + 1, y, barWidth - 2, barH);
      }

      // 2. Real-Time Oscilloscope Sine Wave Trace
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = this.audio.isPlaying ? '#00f5d4' : 'rgba(255, 255, 255, 0.2)';
      ctx.shadowBlur = this.audio.isPlaying ? 8 : 0;
      ctx.shadowColor = '#00f5d4';

      const sliceWidth = width / wave.length;
      let curX = 0;

      for (let i = 0; i < wave.length; i++) {
        let v = wave[i] / 128.0; // 0 to 2
        if (!this.audio.isPlaying) {
          v = 1.0 + 0.02 * Math.sin(i * 0.25 + performance.now() * 0.003);
        }
        const curY = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(curX, curY);
        } else {
          ctx.lineTo(curX, curY);
        }
        curX += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      requestAnimationFrame(render);
    };

    render();
  }

  initFooterVisualizer() {
    const canvas = document.getElementById('audio-visualizer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const visData = this.audio.getDeckVisualizationData();
      const freq = visData.frequencies;

      const numBars = 4;
      const barWidth = 3;
      const gap = 2;
      const totalWidth = numBars * barWidth + (numBars - 1) * gap;
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < numBars; i++) {
        let barH = 3;
        if (this.audio.isPlaying) {
          const val = freq[i * 3] || 0;
          barH = Math.max(3, (val / 255) * canvas.height * 0.85);
        }
        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - barH) / 2;

        ctx.fillStyle = this.audio.isPlaying ? '#00f5d4' : 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1.5);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  }

  bindGlobalEvents() {
    // Footer Audio Toggle
    document.querySelectorAll('.toggle-audio-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMasterPlay();
      });
    });

    // Nav anchor smooth scroll targeting card wrappers cleanly
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
       anchor.addEventListener('click', (e) => {
         const href = anchor.getAttribute('href');
         if (href === '#' || !href) return;

         if (href === '#hero') {
           e.preventDefault();
           if (this.lenis) {
             this.lenis.scrollTo(0, { duration: 1.2 });
           } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
           }
           return;
         }

         const target = document.querySelector(href);
         if (target) {
           e.preventDefault();
           // Scroll to the content card wrapper inside section if present, or section
           const card = target.querySelector('.content-card-wrapper') || target;
           const headerOffset = 80;
           if (this.lenis) {
             this.lenis.scrollTo(card, { offset: -headerOffset, duration: 1.2 });
           } else {
             const elementPosition = card.getBoundingClientRect().top;
             const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
             window.scrollTo({
               top: offsetPosition,
               behavior: 'smooth'
             });
           }
         }
       });
     });

    // Anti-theft protection for HypnoKai master audio
    const playerCard = document.getElementById('hypnokai-player');
    if (playerCard) {
      playerCard.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showToast('HypnoKai original master recording · Direct saving disabled');
      });
    }

    // Intercept Save shortcuts (Cmd+S / Ctrl+S)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        this.showToast('HypnoKai original audio content protected');
      }
    });

    // Prevent drag on album art and performer visuals
    document.querySelectorAll('.player-album-art, .pl-thumb-img, .hypnokai-performer-img').forEach((img) => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Tag toasts
    document.querySelectorAll('.micro-tag').forEach((tag) => {
      tag.addEventListener('click', () => {
        const desc = tag.getAttribute('title') || tag.getAttribute('data-desc');
        if (desc) this.showToast(desc);
      });
    });

    // Spacebar to play/pause
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && (e.target === document.body || e.target === document.documentElement)) {
        e.preventDefault();
        this.toggleMasterPlay();
      }
      if (e.key === 'm' || e.key === 'M') {
        this.audio.toggleMute();
        this.updateVolumeIcons(this.audio.isMuted);
      }
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Transmission initiated. Kai Thorpe / HypnoKai will review shortly.');
        setTimeout(() => this.modals.closeAll(), 1200);
      });
    }
  }

  showToast(message) {
    let toast = document.getElementById('hud-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hud-toast';
      toast.className = 'hud-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3500);
  }

  startLoop() {
    const animate = (time) => {
      if (this.lenis) {
        this.lenis.raf(time);
      }
      if (this.stage) {
        this.stage.update();
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.KAI_APP = new App();
});
