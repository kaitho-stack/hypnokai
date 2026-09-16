/**
 * HypnoKai Audio Engine
 * Clean HTML5 Audio streaming with Web Audio Analyser & UI tactile feedback
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

    // Web Audio context & nodes
    this.ctx = null;
    this.sourceNode = null;
    this.analyser = null;
    this.masterGain = null;

    // Callbacks
    this.onTrackChange = null;
    this.onPlayStateChange = null;
    this.onTimeUpdate = null;
    this.onVolumeChange = null;
    // Anti-theft blob memory management
    this.currentBlobUrl = null;
    this.blobCache = new Map();

    this.initAudioElement();
  }

  shufflePlaylist() {
    if (!this.playlist || this.playlist.length <= 1) return;
    // Fisher-Yates randomization
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
    this.currentIndex = 0;
  }

  initAudioElement() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume;
    this.audio.controlsList = 'nodownload noplaybackrate';
    this.audio.setAttribute('controlsList', 'nodownload noplaybackrate');
    this.audio.setAttribute('oncontextmenu', 'return false;');

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      this.duration = this.audio.duration || 0;
      const pct = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration, pct);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio.duration || 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration, 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.next(true);
      if (this.onEnded) this.onEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[AudioEngine] Audio element encountered an error:', e);
    });

    // Load initial track if available
    if (this.playlist && this.playlist.length > 0) {
      this.loadTrack(0, false);
    }
  }

  initWebAudio() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (err) {
      console.warn('[AudioEngine] Web Audio graph initialization warning:', err);
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || null;
  }

  async loadTrack(index, autoPlay = false) {
    if (!this.playlist || this.playlist.length === 0) return;

    if (index < 0) index = this.playlist.length - 1;
    if (index >= this.playlist.length) index = 0;

    this.currentIndex = index;
    const track = this.playlist[this.currentIndex];

    if (!track) return;

    // Stream via ephemeral in-memory Blob URL to prevent direct audio asset scraping
    try {
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }

      let blob = this.blobCache.get(track.audio);
      if (!blob) {
        const resp = await fetch(track.audio);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        blob = await resp.blob();
        this.blobCache.set(track.audio, blob);
      }

      this.currentBlobUrl = URL.createObjectURL(blob);
      this.audio.src = this.currentBlobUrl;
    } catch (err) {
      // Fallback to direct path in case fetch is restricted
      console.warn('[AudioEngine] Blob streaming fallback:', err);
      this.audio.src = track.audio;
    }

    this.audio.load();
    this.currentTime = 0;
    this.duration = track.durationSec || 0;

    if (this.onTrackChange) {
      this.onTrackChange(track, this.currentIndex);
    }

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.log('[AudioEngine] Autoplay/play prevented:', err);
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
    if (!isFinite(seconds)) return;
    this.audio.currentTime = Math.max(0, Math.min(seconds, this.duration || 1000));
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
    this.setVolume(this.volume);
    return this.isMuted;
  }

  // Real-time analysis for 3D sculpture and oscilloscope
  getDeckVisualizationData() {
    if (!this.analyser) {
      const emptyFreq = new Uint8Array(64);
      const emptyWave = new Uint8Array(64).fill(128);
      return { frequencies: emptyFreq, waveformData: emptyWave };
    }
    const freqArray = new Uint8Array(this.analyser.frequencyBinCount);
    const waveArray = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteFrequencyData(freqArray);
    this.analyser.getByteTimeDomainData(waveArray);
    return {
      frequencies: freqArray,
      waveformData: waveArray
    };
  }

  // Tactile micro-click sound for UI interactions
  playClick(freq = 600) {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.035);
      g.gain.setValueAtTime(0.06, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }
}
