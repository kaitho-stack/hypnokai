import * as THREE from 'three';
import { GlassFresnelShader } from './shaders.js';

export class SculptureStage {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.hypnoBlend = 0.0;
    this.targetHypnoBlend = 0.0;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 7.5);

    // Hardware-accelerated WebGL2 Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.createSculptures();
    this.bindEvents();
    this.clock = new THREE.Clock();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(3, 4, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f5d4, 1.1);
    rimLight.position.set(-4, -2, -3);
    this.scene.add(rimLight);
    this.rimLight = rimLight;

    const pointLight = new THREE.PointLight(0x1a2ffb, 1.6, 25);
    pointLight.position.set(0, 0, 4);
    this.scene.add(pointLight);
    this.pointLight = pointLight;
  }

  createSculptures() {
    this.sculptureGroup = new THREE.Group();
    this.scene.add(this.sculptureGroup);

    // Main Glass Sculpture with Quantum-to-Hypno Shader
    this.glassUniforms = THREE.UniformsUtils.clone(GlassFresnelShader.uniforms);
    this.glassMaterial = new THREE.ShaderMaterial({
      uniforms: this.glassUniforms,
      vertexShader: GlassFresnelShader.vertexShader,
      fragmentShader: GlassFresnelShader.fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true
    });

    const torusGeo = new THREE.TorusKnotGeometry(1.22, 0.36, 128, 24);
    this.mainSculpture = new THREE.Mesh(torusGeo, this.glassMaterial);
    this.sculptureGroup.add(this.mainSculpture);

    // Floating Glass Rings
    this.ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8d4ff,
      metalness: 0.1,
      roughness: 0.12,
      transmission: 0.75,
      thickness: 0.8,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.FrontSide,
      depthWrite: true
    });

    const ringGeo1 = new THREE.TorusGeometry(1.85, 0.045, 32, 80);
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat);
    this.ring1.rotation.x = Math.PI / 3;
    this.ring1.rotation.y = Math.PI / 6;
    this.sculptureGroup.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.25, 0.038, 32, 80);
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat);
    this.ring2.rotation.x = -Math.PI / 4;
    this.ring2.rotation.z = Math.PI / 5;
    this.sculptureGroup.add(this.ring2);

    // Floating Chrome Orbit Spheres
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2ffb,
      metalness: 0.85,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      depthWrite: true
    });
    this.sphereMat = sphereMat;

    this.spheres = [];
    const spherePositions = [
      [-1.8, 1.4, 0.5],
      [2.0, -1.2, -0.4],
      [-1.2, -1.8, 0.8],
      [1.6, 1.6, -0.6],
      [-2.4, -0.3, -1.0],
      [2.2, 0.4, 1.0]
    ];

    spherePositions.forEach((pos, i) => {
      const radius = 0.13 + (i % 3) * 0.04;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 18), sphereMat);
      sphere.position.set(pos[0], pos[1], pos[2]);
      sphere.userData = {
        origin: new THREE.Vector3(...pos),
        speed: 0.7 + i * 0.2,
        phase: i * 1.3
      };
      this.sculptureGroup.add(sphere);
      this.spheres.push(sphere);
    });

    // Ambient Micro-Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 14;
      particlePos[i + 1] = (Math.random() - 0.5) * 14;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    this.particleMat = new THREE.PointsMaterial({
      color: 0x1a2ffb,
      size: 0.032,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.particles = new THREE.Points(particleGeo, this.particleMat);
    this.scene.add(this.particles);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);

    if (this.width < 768) {
      this.sculptureGroup.scale.set(0.65, 0.65, 0.65);
    } else {
      this.sculptureGroup.scale.set(1.0, 1.0, 1.0);
    }
  }

  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));

    // Hypnokai section is the final third of the page (progress >= 0.55)
    if (progress >= 0.52) {
      this.targetHypnoBlend = Math.min(1.0, (progress - 0.52) / 0.32);
    } else {
      this.targetHypnoBlend = 0.0;
    }
  }

  setHeroDispersalProgress(progress) {
    if (this.glassUniforms && this.glassUniforms.uDispersion) {
      // Modulate chromatic dispersion from 0.35 up to 0.75 as title letters disperse
      this.glassUniforms.uDispersion.value = 0.35 + progress * 0.4;
    }
  }

  update() {
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse follow
    this.mouse.targetX += (this.mouse.x - this.mouse.targetX) * 0.055;
    this.mouse.targetY += (this.mouse.y - this.mouse.targetY) * 0.055;

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.06;

    // Smooth Hypno-warp blend
    this.hypnoBlend += (this.targetHypnoBlend - this.hypnoBlend) * 0.05;

    // Update shader uniforms
    if (this.glassUniforms) {
      this.glassUniforms.uTime.value = elapsedTime;
      this.glassUniforms.uMouse.value = [this.mouse.targetX, this.mouse.targetY];
      this.glassUniforms.uHypnoBlend.value = this.hypnoBlend;
    }

    // Dynamic light color shifting into Hypno Ultraviolet
    if (this.pointLight) {
      const quantumCol = new THREE.Color(0x1a2ffb);
      const hypnoCol = new THREE.Color(0xa811ff); // Ultraviolet
      this.pointLight.color.lerpColors(quantumCol, hypnoCol, this.hypnoBlend);
    }
    if (this.particleMat) {
      const pCol1 = new THREE.Color(0x1a2ffb);
      const pCol2 = new THREE.Color(0xf72585); // Neon magenta
      this.particleMat.color.lerpColors(pCol1, pCol2, this.hypnoBlend);
    }

    const p = this.scrollProgress;
    const h = this.hypnoBlend;

    // Position choreography
    const targetPosX = Math.sin(p * Math.PI * 1.8) * (1.8 * (1.0 - h * 0.5));
    const targetPosY = (p - 0.3) * -1.2 + h * 0.4;
    const targetPosZ = Math.cos(p * Math.PI * 2.0) * 0.8 + h * 0.6; // Pushes closer in Hypnokai mode!

    this.sculptureGroup.position.x += (targetPosX - this.sculptureGroup.position.x) * 0.08;
    this.sculptureGroup.position.y += (targetPosY - this.sculptureGroup.position.y) * 0.08;
    this.sculptureGroup.position.z += (targetPosZ - this.sculptureGroup.position.z) * 0.08;

    // Dynamic Hypno spin speed
    const spinMultiplier = 1.0 + p * 0.75 + h * 1.8;
    this.mainSculpture.rotation.x += (0.005 + this.mouse.targetY * 0.003) * spinMultiplier;
    this.mainSculpture.rotation.y += (0.008 + this.mouse.targetX * 0.004) * spinMultiplier;
    if (h > 0.1) {
      this.mainSculpture.rotation.z += 0.006 * h;
    }

    // Rings spin into concentric hypno vortex
    this.ring1.rotation.x += (0.006 + this.mouse.targetY * 0.0015) * (1.0 + h * 1.5);
    this.ring1.rotation.y += (0.009 + this.mouse.targetX * 0.002) * (1.0 + h * 1.5);
    this.ring2.rotation.z += 0.004 * (1.0 + h * 2.0);
    this.ring2.rotation.x -= 0.003 * (1.0 + h * 2.0);

    // Orbiting spheres
    this.spheres.forEach((sphere) => {
      const u = sphere.userData;
      const t = elapsedTime * (u.speed * (1.0 + h * 1.2)) + u.phase;
      sphere.position.x = u.origin.x + Math.sin(t) * 0.25 + this.mouse.targetX * 0.25;
      sphere.position.y = u.origin.y + Math.cos(t * 1.2) * 0.25 + this.mouse.targetY * 0.25;
      sphere.position.z = u.origin.z + Math.sin(t * 0.8) * 0.2;
    });

    this.camera.position.x = this.mouse.targetX * 0.4;
    this.camera.position.y = this.mouse.targetY * 0.3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
