export const PROFILE_DATA = {
  hero: {
    headline: "KAI THORPE",
    subheadline: "Structuring operations, logic, and sound.",
    location: "Based in Western Australia",
    portrait: "assets/images/kai-professional.png",
    nav: [
      { id: "operations", label: "01 // Operations" },
      { id: "logic", label: "02 // Logic" },
      { id: "hypnokai", label: "03 // HypnoKai" },
      { id: "amoc-section", label: "04 // AMOC Observatory" },
      { id: "audio", label: "05 // Music Player" }
    ]
  },
  sections: [
    {
      id: "operations",
      index: "01",
      title: "Operations & Scale",
      header: "01 — Operations",
      image: "assets/images/kai-professional.png",
      body: "Managing complex environments and retail infrastructure across the metropolitan region. My background is in aligning teams, managing high-volume logistics, and building the internal, modular tools that make daily operations seamless and efficient.",
      tags: [
        { label: "Regional Management", desc: "Cross-facility coordination, staff alignment, and multi-hub operational oversight across Western Australia." },
        { label: "Process Optimization", desc: "Identifying structural friction, reducing cycle latency, and building automated lean workflows." },
        { label: "Custom Sales Tooling", desc: "Developing proprietary internal software, real-time inventory synchronizers, and field POS tooling." }
      ],
      details: {
        subtitle: "Infrastructure & Systems Execution",
        summary: "Operational architecture built around resilience, modular tooling, and clear communication feedback loops.",
        metrics: [
          { label: "Regional Scale", value: "Metro WA Network" },
          { label: "Process Velocity", value: "High-Volume Realtime" },
          { label: "Tooling Philosophy", value: "Modular & Local-First" }
        ],
        pillars: [
          {
            title: "Fleet & Resource Distribution",
            description: "Synchronizing physical logistics pipelines, material movements, and inventory allocation with minimal variance."
          },
          {
            title: "Internal Tooling & Automation",
            description: "Custom-built web utilities and automated scripting replacing legacy manual spreadsheet tracking."
          },
          {
            title: "High-Caliber Team Alignment",
            description: "Structured standard operating procedures (SOPs) that empower autonomous on-the-ground decision making."
          }
        ]
      }
    },
    {
      id: "logic",
      index: "02",
      title: "Code & Computation",
      header: "02 — Logic",
      body: "Exploring the mechanics beneath the interface. My current focus is diving into computer science and physical systems—studying how things actually work at a fundamental level. I build modular, local-first applications and write code to solve tangible problems, treating software as a practical extension of systems thinking.",
      tags: [
        { label: "Systems Architecture", desc: "Modular, state-driven software paradigms prioritizing simplicity, deterministic data flow, and clean boundaries." },
        { label: "Applied Physics & CS", desc: "Simulations of physical phenomena, spatial math, vector fields, and computational geometry." },
        { label: "Local Software Dev", desc: "Local-first utilities, offline resilience, and fast, native-feeling micro-applications without cloud bloat." }
      ],
      details: {
        subtitle: "Computation, Shaders & Physical Systems",
        summary: "Code as applied reasoning. Diving deep into fundamentals—memory, mathematics, graphics pipelines, and resilient state machines.",
        experiments: [
          {
            title: "WebGL / GLSL Chromatic Physics",
            description: "Custom Fresnel shaders calculating view-dependent refraction, dispersion, and real-time surface distortion."
          },
          {
            title: "Deterministic State Engines",
            description: "Event-sourced and localized data stores designed for instantaneous UI response and complete offline autonomy."
          },
          {
            title: "Kinetic Damped Interaction",
            description: "Custom physics-based spring models bridging tactile hardware interfaces with digital screens."
          }
        ]
      }
    },
    {
      id: "hypnokai",
      index: "03",
      title: "HYPNOKAI",
      alterEgo: {
        artistName: "HYPNOKAI",
        image: "assets/images/hypnokai-transparent.png",
        pose: "assets/images/hypnokai-pose.png",
        tagline: "Artist · Lead Vocalist · Multi-Instrumentalist · Original Songwriter",
        bio: "The creative musical identity of Kai Thorpe. Original songwriter, vocalist, multi-instrumental musician, and producer based in Western Australia. Every song is written, sung, and tracked from the ground up—blending raw vocal performance, live instrumentation, and deliberate electronic architecture into distinct master recordings.",
        disciplines: ["Original Songwriting", "Lead Vocals & Phrasing", "Multi-Instrumental Musician", "Studio Tracking & Production"],
        instagram: "@hypno_kai",
        instagramUrl: "https://instagram.com/hypno_kai"
      },
      header: "03 — Audio // HypnoKai Original Discography",
      body: "Original compositions, live instrumentation, and vocal tracking by HypnoKai. Strictly manual, authentic, and deliberate music craft written and produced in Western Australia.",
      tags: [
        { label: "Original Songwriting", desc: "Crafting distinct harmonic structures, vocal melodies, and dynamic multi-track arrangements." },
        { label: "Live Vocals & Instruments", desc: "Organic vocal takes, real-time performance dynamics, and multi-instrumental tracking." },
        { label: "Independent Master Delivery", desc: "End-to-end creative autonomy: writing, recording, multi-track mixing, and master delivery." }
      ],
      playlist: [
        {
                "id": "track-01",
                "title": "All Relative",
                "artist": "HypnoKai",
                "audio": "assets/audio/all-relative.mp3",
                "art": "assets/art/all-relative.png",
                "duration": "04:06",
                "durationSec": 247,
                "desc": "Hypnotic modular textures, rolling bassline, and expansive spatial ambiance."
        },
        {
                "id": "track-02",
                "title": "Appalachia",
                "artist": "HypnoKai",
                "audio": "assets/audio/appalachia.mp3",
                "art": "assets/art/generic-album-art.jpg",
                "duration": "04:03",
                "durationSec": 244,
                "desc": "Subtle organic frequencies with resonant analog synthesis and reflective pacing."
        },
        {
                "id": "track-03",
                "title": "Bass and Rhythm",
                "artist": "HypnoKai",
                "audio": "assets/audio/bass-and-rhythm.mp3",
                "art": "assets/art/generic-album-art.jpg",
                "duration": "03:39",
                "durationSec": 220,
                "desc": "Driving kinetic sub-frequencies and locked groove polyrhythmic movement."
        },
        {
                "id": "track-04",
                "title": "Black Tide",
                "artist": "HypnoKai",
                "audio": "assets/audio/black-tide.mp3",
                "art": "assets/art/black-tide.png",
                "duration": "03:17",
                "durationSec": 197,
                "desc": "Heavy electronic architecture, dark modulated undertones, and psychoacoustic depth."
        },
        {
                "id": "track-05",
                "title": "Boys Own You",
                "artist": "HypnoKai",
                "audio": "assets/audio/boys-own-you.mp3",
                "art": "assets/art/generic-album-art.jpg",
                "duration": "03:00",
                "durationSec": 181,
                "desc": "Dynamic percussion and saturated tape coloration with distinct rhythmic pulse."
        },
        {
                "id": "track-06",
                "title": "Brick",
                "artist": "HypnoKai",
                "audio": "assets/audio/brick.mp3",
                "art": "assets/art/brick.png",
                "duration": "01:57",
                "durationSec": 118,
                "desc": "Punchy modular transients, industrial resonance, and tightly controlled sub-bass."
        },
        {
                "id": "track-07",
                "title": "Busted Custard",
                "artist": "HypnoKai",
                "audio": "assets/audio/busted-custard.mp3",
                "art": "assets/art/busted-custard.png",
                "duration": "04:15",
                "durationSec": 255,
                "desc": "Sonic exploration of saturated textures and intricate groove variations."
        },
        {
                "id": "track-08",
                "title": "Checkin' On My Mind",
                "artist": "HypnoKai",
                "audio": "assets/audio/checkin-on-my-mind.mp3",
                "art": "assets/art/changed-your-mind.jpg",
                "duration": "03:15",
                "durationSec": 195,
                "desc": "Atmospheric pads, syncopated modular patterns, and deep psychoacoustic harmonics."
        },
        {
                "id": "track-09",
                "title": "Clack",
                "artist": "HypnoKai",
                "audio": "assets/audio/clack.mp3",
                "art": "assets/art/clack.png",
                "duration": "04:26",
                "durationSec": 266,
                "desc": "Crisp acoustic transients, modular clock syncopation, and driving momentum."
        },
        {
                "id": "track-10",
                "title": "Drop Bear",
                "artist": "HypnoKai",
                "audio": "assets/audio/drop-bear.mp3",
                "art": "assets/art/drop-bear.png",
                "duration": "03:22",
                "durationSec": 203,
                "desc": "Raw sub-frequency weight, biting acid filters, and hypnotic modular grooves."
        },
        {
                "id": "track-11",
                "title": "Flat White Hole",
                "artist": "HypnoKai",
                "audio": "assets/audio/flat-white-hole.mp3",
                "art": "assets/art/flat-white-hole.png",
                "duration": "02:21",
                "durationSec": 142,
                "desc": "Expansive spatial horizons, ambient shimmer, and deep gravitational sub-bass."
        },
        {
                "id": "track-12",
                "title": "Keep Leading Me On",
                "artist": "HypnoKai",
                "audio": "assets/audio/keep-leading-me-on.mp3",
                "art": "assets/art/leading-me-in.png",
                "duration": "04:39",
                "durationSec": 280,
                "desc": "Melodic motifs layered over deliberate bass architecture and analog warmth."
        },
        {
                "id": "track-13",
                "title": "Mind the Gap",
                "artist": "HypnoKai",
                "audio": "assets/audio/mind-the-gap.mp3",
                "art": "assets/art/mind-the-gap.png",
                "duration": "04:09",
                "durationSec": 250,
                "desc": "Hypnotic filter sequences, polyrhythmic percussion, and tight stereo imaging."
        },
        {
                "id": "track-14",
                "title": "Out of Bounds",
                "artist": "HypnoKai",
                "audio": "assets/audio/out-of-bounds.mp3",
                "art": "assets/art/out-of-bounds.png",
                "duration": "03:24",
                "durationSec": 204,
                "desc": "Unbounded electronic progression with spatial tape delay and resonant sweeps."
        },
        {
                "id": "track-15",
                "title": "See You Next Fall",
                "artist": "HypnoKai",
                "audio": "assets/audio/see-you-next-fall.mp3",
                "art": "assets/art/fall.png",
                "duration": "03:58",
                "durationSec": 238,
                "desc": "Reflective sound design, organic room tone, and subtle harmonic decays."
        },
        {
                "id": "track-16",
                "title": "Space Cowboy",
                "artist": "HypnoKai",
                "audio": "assets/audio/space-cowboy.mp3",
                "art": "assets/art/space-cowboy.png",
                "duration": "02:54",
                "durationSec": 175,
                "desc": "Western Spatial motif intersecting with 124 BPM driving electronic architecture."
        },
        {
                "id": "track-17",
                "title": "Space Cowboy (Extended)",
                "artist": "HypnoKai",
                "audio": "assets/audio/space-cowboy-extended.mp3",
                "art": "assets/art/space-cowboy.png",
                "duration": "03:50",
                "durationSec": 230,
                "desc": "Extended narrative progression with immersive psychoacoustic modular evolution."
        },
        {
                "id": "track-18",
                "title": "The Vibe is the Variable",
                "artist": "HypnoKai",
                "audio": "assets/audio/the-vibe-is-the-variable.mp3",
                "art": "assets/art/generic-album-art.jpg",
                "duration": "04:06",
                "durationSec": 247,
                "desc": "Fluid tempo modulation, analog warmth, and hypnotic rhythmic shifts."
        },
        {
                "id": "track-19",
                "title": "Whatever Boy",
                "artist": "HypnoKai",
                "audio": "assets/audio/whatever-boy.mp3",
                "art": "assets/art/wild-boy.jpg",
                "duration": "03:54",
                "durationSec": 234,
                "desc": "Raw energy, distorted bass harmonics, and driving modular percussion."
        },
        {
                "id": "track-20",
                "title": "Why We Run",
                "artist": "HypnoKai",
                "audio": "assets/audio/why-we-run.mp3",
                "art": "assets/art/why-we-run.png",
                "duration": "04:19",
                "durationSec": 259,
                "desc": "Kinetic tempo, urgent sub-frequencies, and wide stereo spatial field design."
        }
]
    }
  ],
  footer: {
    meta: "Based in Western Australia.",
    status: "Open for select commissions & engineering consultations",
    contactEmail: "kai@example.com"
  }
};
