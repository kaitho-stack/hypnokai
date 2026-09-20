/**
 * HypnoKai Audio Engine
 * Background Audio Playback with Lock-Screen MediaSession Controls,
 * iOS AudioSession Privileges, and Responsive Web Audio Analyser
 */

export class AudioEngine {
  constructor(playlistData = [], autoShuffle = true) {
    this.playlist = [...playlistData];
    if (autoShuffle) {
      this.shufflePlaylist();
    }
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.85;
    this.currentTime = 0;
    this.duration = 0;

    // Detect mobile / touch environment for background audio stability
    this.isMobile = this.detectMobile();

    // Web Audio context & nodes
    this.ctx = null;
    this.sourceNode = null;
    this.analyser = null;
    this.masterGain = null;
    this.clickCtx = null;

    // Callbacks
    this.onTrackChange = null;
    this.onPlayStateChange = null;
    this.onTimeUpdate = null;
    this.onVolumeChange = null;
    this.onEnded = null;

    this.initAudioSession();
    this.initAudioElement();
    this.initMediaSession();

    // Load initial track if available
    if (this.playlist && this.playlist.length > 0) {
      this.loadTrack(0, false);
    }
  }

  detectMobile() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isMobileUA = /iPhone|iPad|iPod|Android|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) || 
      (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches);
    return isMobileUA || isIOS || (hasTouch && typeof window !== 'undefined' && window.innerWidth < 1024);
  }

  shufflePlaylist() {
    if (!this.playlist || this.playlist.length <= 1) return;
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
    this.currentIndex = 0;
  }

  initAudioSession() {
    // Elevate iOS Safari 16.4+ audio session to 'playback'
    // This allows continuous playback when phone locks and prevents silent switch from muting
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try {
        if (navigator.audioSession.type !== 'playback') {
          navigator.audioSession.type = 'playback';
        }
      } catch (e) {
        console.warn('[AudioEngine] audioSession playback setup notice:', e);
      }
    }
  }

  initAudioElement() {
    // Anchor audio element in DOM to prevent iOS garbage-collection when locked
    let el = typeof document !== 'undefined' ? document.getElementById('hypnokai-audio-element') : null;
    if (!el && typeof document !== 'undefined') {
      el = document.createElement('audio');
      el.id = 'hypnokai-audio-element';
      el.style.display = 'none';
      if (document.body) {
        document.body.appendChild(el);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (!document.getElementById('hypnokai-audio-element') && document.body) {
            document.body.appendChild(el);
          }
        });
      }
    }

    this.audio = el || new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.audio.muted = this.isMuted;
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.controlsList = 'nodownload noplaybackrate';
    this.audio.setAttribute('controlsList', 'nodownload noplaybackrate');
    this.audio.setAttribute('oncontextmenu', 'return false;');

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.initAudioSession();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.updateMediaSessionState();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateMediaSessionState();
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      this.duration = this.audio.duration || 0;
      const pct = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration, pct);
      }
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('durationchange', () => {
      this.duration = this.audio.duration || 0;
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio.duration || 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration, 0);
      }
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('ended', () => {
      this.next(true);
      if (this.onEnded) this.onEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[AudioEngine] Audio element stream notification:', e);
    });
  }

  initMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const safeSetHandler = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Safe skip if action is unsupported in this browser
      }
    };

    safeSetHandler('play', () => {
      this.play();
    });

    safeSetHandler('pause', () => {
      this.pause();
    });

    safeSetHandler('previoustrack', () => {
      this.prev();
    });

    safeSetHandler('nexttrack', () => {
      this.next();
    });

    safeSetHandler('stop', () => {
      this.pause();
    });

    safeSetHandler('seekto', (details) => {
      if (details.seekTime !== undefined && details.seekTime !== null) {
        this.seek(details.seekTime);
      } else if (details.fastSeek && this.audio.fastSeek) {
        this.audio.fastSeek(details.seekTime);
      }
    });

    safeSetHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(Math.max(0, this.currentTime - skipTime));
    });

    safeSetHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(Math.min(this.duration || 1000, this.currentTime + skipTime));
    });
  }

  updateMediaSessionMetadata(track) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !window.MediaMetadata || !track) return;
    try {
      const getAbsoluteUrl = (relPath) => {
        try {
          return new URL(relPath, window.location.href).href;
        } catch {
          return relPath;
        }
      };

      const artUrl = getAbsoluteUrl(track.art || 'assets/art/generic-album-art.jpg');

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Original Composition',
        artist: track.artist || 'HypnoKai',
        album: 'HypnoKai Discography',
        artwork: [
          { src: artUrl, sizes: '96x96', type: 'image/png' },
          { src: artUrl, sizes: '128x128', type: 'image/png' },
          { src: artUrl, sizes: '192x192', type: 'image/png' },
          { src: artUrl, sizes: '256x256', type: 'image/png' },
          { src: artUrl, sizes: '384x384', type: 'image/png' },
          { src: artUrl, sizes: '512x512', type: 'image/png' }
        ]
      });
    } catch (e) {
      console.warn('[AudioEngine] MediaMetadata update warning:', e);
    }
  }

  updateMediaSessionState() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }

  updateMediaSessionPosition() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    try {
      if (Number.isFinite(this.duration) && this.duration > 0 && Number.isFinite(this.currentTime)) {
        const cur = Math.max(0, Math.min(this.currentTime, this.duration));
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: this.audio.playbackRate || 1.0,
          position: cur
        });
      }
    } catch (e) {
      // Safe skip during seek transition
    }
  }

  initWebAudio() {
    // If mobile or touch device, do NOT connect createMediaElementSource
    // On iOS Safari / WebKit, connecting createMediaElementSource routes audio through AudioContext,
    // which is suspended when the phone locks, killing all audio output.
    // Native HTML5 audio on mobile bypasses Web Audio suspension and streams continuously in background.
    if (this.ctx || this.isMobile) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (err) {
      console.warn('[AudioEngine] Web Audio graph initialization notice:', err);
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || null;
  }

  loadTrack(index, autoPlay = false) {
    if (!this.playlist || this.playlist.length === 0) return;

    if (index < 0) index = this.playlist.length - 1;
    if (index >= this.playlist.length) index = 0;

    this.currentIndex = index;
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    // Direct audio URL streaming for reliable lock-screen buffering and low memory overhead
    this.audio.src = track.audio;
    this.currentTime = 0;
    this.duration = track.durationSec || 0;

    this.updateMediaSessionMetadata(track);
    this.updateMediaSessionPosition();

    if (this.onTrackChange) {
      this.onTrackChange(track, this.currentIndex);
    }

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.initAudioSession();
    this.initWebAudio();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.log('[AudioEngine] Autoplay/play interaction required:', err);
      });
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  next(auto = false) {
    const nextIdx = (this.currentIndex + 1) % this.playlist.length;
    this.loadTrack(nextIdx, auto || this.isPlaying);
  }

  prev() {
    if (this.currentTime > 3) {
      this.seek(0);
      return;
    }
    const prevIdx = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(prevIdx, this.isPlaying);
  }

  seek(seconds) {
    if (!Number.isFinite(seconds)) return;
    const target = Math.max(0, Math.min(seconds, this.duration || 1000));
    this.audio.currentTime = target;
    this.currentTime = target;
    this.updateMediaSessionPosition();
  }

  seekPercent(pct) {
    if (this.duration > 0) {
      const s = (pct / 100) * this.duration;
      this.seek(s);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.isMuted ? 0 : this.volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.onVolumeChange) {
      this.onVolumeChange(this.volume, this.isMuted);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  // Real-time analysis for 3D sculpture and oscilloscope
  getDeckVisualizationData() {
    if (this.analyser) {
      const freqArray = new Uint8Array(this.analyser.frequencyBinCount);
      const waveArray = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteFrequencyData(freqArray);
      this.analyser.getByteTimeDomainData(waveArray);
      return {
        frequencies: freqArray,
        waveformData: waveArray
      };
    }

    // High-fidelity rhythmic synthetic visualization for mobile & background playback
    const binCount = 64;
    const fftSize = 128;
    const freqArray = new Uint8Array(binCount);
    const waveArray = new Uint8Array(fftSize);

    if (!this.isPlaying) {
      waveArray.fill(128);
      return { frequencies: freqArray, waveformData: waveArray };
    }

    const t = performance.now() * 0.005 + (this.currentTime * 2.5);
    const volScale = this.isMuted ? 0 : this.volume;

    // Dynamic rhythmically modulated frequency bars
    for (let i = 0; i < binCount; i++) {
      const harmonic1 = Math.sin(t * 2.1 + i * 0.28);
      const harmonic2 = Math.cos(t * 1.3 - i * 0.15);
      const beat = Math.pow(Math.max(0, Math.sin(t * 1.8)), 4);
      const bassWeight = Math.max(0, 1 - (i / 20));
      const midWeight = Math.exp(-Math.pow((i - 22) / 14, 2));
      const highWeight = Math.min(1, i / 32) * 0.6;

      const raw = ((harmonic1 * 0.35 + harmonic2 * 0.25 + beat * 0.6 * bassWeight + 0.45) * (bassWeight * 1.3 + midWeight * 0.95 + highWeight * 0.7));
      freqArray[i] = Math.max(6, Math.min(255, Math.floor(raw * 175 * volScale)));
    }

    // Organic flowing time-domain waveform
    for (let i = 0; i < fftSize; i++) {
      const phase = (i / fftSize) * Math.PI * 4;
      const w1 = Math.sin(t * 2.4 + phase);
      const w2 = Math.sin(t * 4.8 + phase * 2) * 0.35;
      const w3 = Math.cos(t * 1.2 + phase * 0.5) * 0.25;
      const waveVal = (w1 + w2 + w3) / 1.6;
      waveArray[i] = Math.floor(128 + waveVal * 52 * volScale);
    }

    return {
      frequencies: freqArray,
      waveformData: waveArray
    };
  }

  // Tactile micro-click sound for UI interactions
  playClick(freq = 600) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.clickCtx) {
        this.clickCtx = new AudioCtx();
      }
      if (this.clickCtx.state === 'suspended') {
        this.clickCtx.resume().catch(() => {});
      }
      const osc = this.clickCtx.createOscillator();
      const g = this.clickCtx.createGain();
      osc.frequency.setValueAtTime(freq, this.clickCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.clickCtx.currentTime + 0.035);
      g.gain.setValueAtTime(0.06, this.clickCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.clickCtx.currentTime + 0.035);
      osc.connect(g);
      g.connect(this.clickCtx.destination);
      osc.start();
      osc.stop(this.clickCtx.currentTime + 0.035);
    } catch (e) {}
  }
}
