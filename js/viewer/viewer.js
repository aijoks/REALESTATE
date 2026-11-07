// Interactive 3D building viewer with a guided 360° tour.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildPrewarBrick } from './building.js';
import { buildBuffLoft } from './loft.js';
import { buildClassicOffice } from './classic.js';
import { buildLadiesMile } from './mile.js';
import { buildNarrowLoft } from './narrow.js';
import { buildStoneBay } from './bay.js';
import { buildArchLoft } from './arch.js';
import { buildWalkup } from './walkup.js';
import { buildIndustrial } from './industrial.js';
import { buildPavilion } from './pavilion.js';
import { buildFlex } from './flex.js';
import { buildDrugstore } from './drugstore.js';
import { buildGarden } from './garden.js';
import { buildCenter } from './center.js';
import { buildLabFlex } from './labflex.js';
import { buildMission } from './mission.js';
import { buildMonaLisa } from './monalisa.js';
import { buildCourtyard } from './courtyard.js';
import { buildStrip } from './strip.js';
import { buildLand } from './land.js';

const GENERATORS = { prewarBrick: buildPrewarBrick, buffLoft: buildBuffLoft, classicOffice: buildClassicOffice, ladiesMile: buildLadiesMile, narrowLoft: buildNarrowLoft, stoneBay: buildStoneBay, archLoft: buildArchLoft, walkup: buildWalkup, industrial: buildIndustrial, pavilion: buildPavilion, flex: buildFlex, drugstore: buildDrugstore, garden: buildGarden, center: buildCenter, labflex: buildLabFlex, mission: buildMission, monalisa: buildMonaLisa, courtyard: buildCourtyard, stripRetail: buildStrip, land: buildLand };
import { hotspotTexture } from './textures.js';
import { buildContext, updateFades } from './context.js';
import { mergeStatic } from './optimize.js';
import { buildPlanFloor } from './floorplan3d.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class BuildingViewer {
  constructor(container, property, { onHotspot, onChapter, onProgress } = {}) {
    this.container = container;
    this.property = property;
    this.onHotspot = onHotspot;
    this.onChapter = onChapter;
    this.onProgress = onProgress;

    // Logarithmic depth keeps distant kerbs, road markings and trim from
    // flickering (z-fighting); pixel ratio is capped and lowered further if
    // the device can't keep up.
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
    this.coarse = matchMedia('(pointer: coarse)').matches;
    this.maxDpr = Math.min(window.devicePixelRatio, this.coarse ? 1.5 : 1.75);
    this.renderer.setPixelRatio(this.maxDpr);
    this.renderer.shadowMap.enabled = true;
    // The scene is static, so shadows are rendered once instead of every frame.
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    // Floor-plan cut-aways clip the building (and only the building) above a storey.
    this.renderer.localClippingEnabled = true;
    container.appendChild(this.renderer.domElement);

    // Large sites (e.g. raw land) may widen the fog, zoom range and shadow
    // area through model.view = { fog: [near, far], maxDistance, shadow }.
    this.view = property.model.view ?? {};
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#cfdbe6', this.view.fog?.[0] ?? 260, this.view.fog?.[1] ?? 900);

    // Sky dome radius and far plane grow with the allowed zoom-out distance so
    // the far side of the dome is never clipped (which showed as a black disc).
    this.skyR = Math.max(1500, (this.view.maxDistance ?? 360) * 2 + 400);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.3, this.skyR + (this.view.maxDistance ?? 360) + 200);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    // Allow looking up at the building from the street; the ground clamp in
    // _frame keeps the camera from going below street level.
    this.controls.maxPolarAngle = Math.PI - 0.12;
    this.controls.minDistance = 4;
    this.controls.maxDistance = this.view.maxDistance ?? 360;

    this.clock = new THREE.Clock();
    this.tour = { playing: false, index: 0, t: 0, from: null };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hotspots = [];
    this.highlight = null;

    this._setupSky();
    this._setupLights();
    this._loadModel().then(() => {
      // The streetscape is built with the front facing +z and the avenue at +x;
      // for a building whose avenue is on the viewer's left it is mirrored.
      const site = this.property.model.site ?? {};
      const root = new THREE.Group();
      if (site.mirror) root.scale.x = -1;
      this.scene.add(root);
      root.updateMatrixWorld(true);
      this.context = buildContext(root, { W: this.model.width, D: this.model.depth, site });
      this.subjectBox = new THREE.Box3().setFromObject(this.model.group);
      // Give the building its own copies of its materials, so a floor-plan
      // cut-away can clip it without clipping neighbours that share a material.
      this.buildingMats = new Set();
      {
        const copies = new Map();
        const own = (mm) => { if (!copies.has(mm)) { const c = mm.clone(); copies.set(mm, c); this.buildingMats.add(c); } return copies.get(mm); };
        this.model.group.traverse((o) => { if (o.material) o.material = Array.isArray(o.material) ? o.material.map(own) : own(o.material); });
        this._fp = { uFPOn: { value: 0 }, uFPCut: { value: 0 }, uFPFloor: { value: 0 }, uFPHalf: { value: new THREE.Vector2() } };
        for (const mm of this.buildingMats) addCutaway(mm, this._fp);
      }
      // Bake static scenery into a few meshes (hundreds fewer draw calls).
      mergeStatic(this.model.group, { into: this.scene });
      mergeStatic(root, { into: this.scene });
      this.renderer.shadowMap.needsUpdate = true;
      this._dirty = true;
      this._setupHotspots();
      this._buildChapters();
      this.goToChapter(0, true);
      this.play();
    });

    // Any user interaction pauses the guided tour so it never fights the mouse.
    const stop = () => this.pause();
    this.renderer.domElement.addEventListener('pointerdown', stop);
    this.renderer.domElement.addEventListener('wheel', stop, { passive: true });
    // Scrolling the page over the 3D view scrolls the page; zoom needs
    // Ctrl/⌘ + scroll (trackpad pinch sends Ctrl automatically). On touch
    // screens one finger scrolls the page and two fingers move the model.
    container.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) return;
      e.stopImmediatePropagation();
      this.onScrollHint?.();
    }, { capture: true, passive: true });
    // Touch: one finger scrolls the page; two fingers orbit (move together)
    // and zoom (pinch). Handled here with touch events rather than by
    // OrbitControls, because iOS cancels pointer events as soon as the first
    // finger starts a page scroll, which froze the model mid-gesture.
    this.controls.touches = { ONE: null, TWO: null };
    this.renderer.domElement.style.touchAction = 'pan-y';
    {
      const el = this.renderer.domElement;
      let last = null; // { x, y, d } midpoint and finger spacing
      const read = (t) => ({
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2,
        d: Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY),
      });
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 2) { last = null; return; }
        if (e.cancelable) e.preventDefault();
        this.pause();
        last = read(e.touches);
      }, { passive: false });
      el.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 2 || !last) return;
        if (e.cancelable) e.preventDefault();
        const now = read(e.touches);
        const c = this.controls, h = el.clientHeight || 1, k = 2 * Math.PI * c.rotateSpeed / h;
        c._rotateLeft(k * (now.x - last.x));
        c._rotateUp(k * (now.y - last.y));
        if (last.d > 0 && now.d > 0) {
          const s = Math.min(1.25, Math.max(0.8, last.d / now.d));
          if (s > 1) c._dollyOut(1 / s); else if (s < 1) c._dollyIn(s);
        }
        c.update();
        this._dirty = true;
        last = now;
      }, { passive: false });
      const end = (e) => { if (e.touches.length < 2) last = null; };
      el.addEventListener('touchend', end);
      el.addEventListener('touchcancel', end);
    }
    this.controls.addEventListener('change', () => { this._dirty = true; });
    // Only render while the viewer is on screen and the tab is visible.
    this._onScreen = true;
    new IntersectionObserver(([en]) => { this._onScreen = en.isIntersecting; this._syncLoop(); }, { threshold: 0.01 }).observe(container);
    this._onVis = () => this._syncLoop();
    document.addEventListener('visibilitychange', this._onVis);
    this.renderer.domElement.addEventListener('click', (e) => this._onClick(e));
    this.renderer.domElement.addEventListener('pointermove', (e) => this._onMove(e));

    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.resize();
    this._syncLoop();
  }

  // ---------- scene setup ----------
  // Gradient sky dome, also used to build the reflection environment.
  _skyMaterial() {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#3f7fd0') },
        mid: { value: new THREE.Color('#9cc3ea') },
        horizon: { value: new THREE.Color('#e4edf4') },
        bottom: { value: new THREE.Color('#8c8d8f') },
      },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vDir;
        void main(){ float h = vDir.y; vec3 c = h > 0.0 ? mix(horizon, mid, smoothstep(0.0, 0.25, h)) : mix(horizon, bottom, smoothstep(0.0, 0.08, -h));
        if (h > 0.25) c = mix(mid, top, smoothstep(0.25, 0.9, h)); gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        }`,
    });
  }

  _setupSky() {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(this.skyR, 32, 16), this._skyMaterial());
    dome.renderOrder = -1;
    this.scene.add(dome);
  }

  _setupLights() {
    // Reflection environment: sky + a ring of grey/blue "buildings" + a sun
    // patch, so glass and metal reflect a city rather than a studio.
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), this._skyMaterial()));
    const tones = ['#6d7782', '#8d969e', '#4f5a66', '#a7a59f', '#5d6b78'];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const h = 15 + ((i * 37) % 23) * 2.2;
      const b = new THREE.Mesh(new THREE.BoxGeometry(14, h, 14), new THREE.MeshBasicMaterial({ color: tones[i % tones.length] }));
      b.position.set(Math.cos(a) * 60, h / 2 - 8, Math.sin(a) * 60);
      b.lookAt(0, b.position.y, 0);
      env.add(b);
    }
    const sunPatch = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 7.5, 6.5) }));
    sunPatch.position.set(-30, 70, 60);
    env.add(sunPatch);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(env, 0.02).texture;
    this.scene.environmentIntensity = 0.75;

    this.scene.add(new THREE.HemisphereLight('#cfe1f5', '#7a6e62', 0.6));
    const sun = new THREE.DirectionalLight('#fff1dc', 2.6);
    sun.position.set(-45, 95, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(this.coarse ? 2048 : 4096, this.coarse ? 2048 : 4096);
    const s = this.view.shadow ?? 60;
    const k = Math.max(1, s / 60);
    sun.position.multiplyScalar(k);
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 10, far: 320 * k });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    this.scene.add(sun.target);
  }

  async _loadModel() {
    const { model } = this.property;
    if (model.glb) {
      try {
        const gltf = await new GLTFLoader().loadAsync(model.glb);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        gltf.scene.position.y -= box.min.y;
        gltf.scene.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        this.scene.add(gltf.scene);
        this.model = {
          group: gltf.scene, width: size.x, depth: size.z, height: size.y,
          floorRange: (n) => { const fh = size.y / model.procedural.floors; return [(n - 1) * fh, n * fh]; },
          hotspotPosition: ([u, v, face]) => positionOnBox(u, v, face, size.x, size.z, size.y),
        };
        return;
      } catch (e) {
        console.warn('GLB model failed to load, using procedural model instead.', e);
      }
    }
    this.model = (GENERATORS[model.procedural.generator] ?? buildPrewarBrick)(model.procedural);
    this.scene.add(this.model.group);
  }

  _setupHotspots() {
    const tex = hotspotTexture();
    for (const h of this.property.model.hotspots || []) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
      sprite.scale.set(2.2, 2.2, 1);
      sprite.position.copy(this.model.hotspotPosition(h.at));
      sprite.renderOrder = 10;
      sprite.userData.hotspot = h;
      this.scene.add(sprite);
      this.hotspots.push(sprite);
    }
  }

  // The guided 360° tour: a loop of camera stops around the building.
  _buildChapters() {
    const { width: W, depth: D, height: H } = this.model;
    const r = this.property.model.tour?.radius ?? Math.max(H * 1.25, D * 1.3);
    const mid = new THREE.Vector3(0, H * 0.48, 0);
    const look = (y, z = 0, x = 0) => new THREE.Vector3(x, y, z);
    // Front faces +z (north, onto E 56th St); +x is west, -x is east.
    // Per-property tour settings (avenue view, labels, extra stops) come from
    // properties.js; positions there are absolute scene coordinates.
    const tour = this.property.model.tour ?? {};
    const vec = (a) => new THREE.Vector3(...a);
    const avenue = tour.avenue ?? { label: 'From the avenue', pos: [80, 1.7, D / 2 + 10.5], target: [8, 13, D / 2 + 5] };
    this.chapters = [
      { id: 'street', label: 'Street view', pos: new THREE.Vector3(-2, tour.streetY ?? H * 0.43, D / 2 + (tour.streetDist ?? 62)), target: look(H * 0.45, D / 2), fov: 52, hold: 3 },
      { id: 'base', label: 'Storefronts & lobby', pos: new THREE.Vector3(4, 3.2, D / 2 + 13), target: look(4.2, D / 2, 0), fov: 50, hold: 2.5 },
      { id: 'front', label: 'Front facade', pos: new THREE.Vector3(0, H * 0.52, D / 2 + r * 1.3), target: mid, fov: 42, hold: 2.5 },
      { id: 'front-west', label: 'Northwest corner', pos: new THREE.Vector3(r * 0.75, H * 0.6, D / 2 + r * 0.65), target: mid, fov: 40, hold: 1.5 },
      { id: 'avenue', label: avenue.label, pos: vec(avenue.pos), target: vec(avenue.target), fov: avenue.fov ?? 62, hold: 3.5, fade: 'street', targets: avenue.targets?.map(vec) },
      { id: 'west', label: tour.westLabel ?? 'West side', pos: new THREE.Vector3(r * 1.05, H * 0.5, 0), target: mid, fov: 40, hold: 2.5 },
      { id: 'rear-west', label: 'Southwest corner', pos: new THREE.Vector3(r * 0.75, H * 0.62, -D / 2 - r * 0.65), target: mid, fov: 40, hold: 1.5 },
      { id: 'back', label: 'Rear facade', pos: new THREE.Vector3(0, H * 0.5, -D / 2 - r), target: mid, fov: 40, hold: 2.5 },
      { id: 'east', label: 'East side', pos: new THREE.Vector3(-r * 1.05, H * 0.55, 0), target: mid, fov: 40, hold: 2.5 },
      ...(tour.extra ?? []).map((c) => ({ hold: 3, fov: 50, ...c, pos: vec(c.pos), target: vec(c.target), targets: c.targets?.map(vec) })),
      { id: 'roof', label: 'Roof & skyline', pos: new THREE.Vector3(-r * 0.7, H * 1.75, D / 2 + r * 0.6), target: look(H * 0.8), fov: 45, hold: 3 },
      { id: 'crown', label: tour.crownLabel ?? 'Crown & gable', pos: new THREE.Vector3(5, H - 2, D / 2 + 26), target: look(H - 6, D / 2 - 2), fov: 40, hold: 2.5 },
    ].filter((c) => !(tour.omit ?? []).includes(c.id))
      .map((c) => ({
        ...c,
        label: tour.labels?.[c.id] ?? c.label,
        // Per-property camera override for a default stop (sets the orbit
        // pivot, so dragging turns around the property, not around a point
        // next to the camera).
        ...(tour.set?.[c.id] ? { pos: vec(tour.set[c.id].pos), target: vec(tour.set[c.id].target), fov: tour.set[c.id].fov ?? c.fov } : {}),
        // Per-stop sight-lines: only neighbours blocking these points fade.
        ...(tour.fades?.[c.id] ? { fade: 'street', targets: tour.fades[c.id].map(vec) } : {}),
      }));
  }

  // Most stops ghost any neighbour in the foreground; street-level stops
  // (like the view from Park Avenue) keep the real streetscape and only fade
  // what actually blocks the building's front-west corner and banner.
  _chapterFade(ch) {
    const { width: W, depth: D } = this.model;
    this.fadeOpts = ch.fade === 'street'
      ? {
        foreground: false,
        pos: ch.pos,
        targets: ch.targets ?? [
          new THREE.Vector3(W / 2 - 1, 8, D / 2 + 1),
          new THREE.Vector3(W / 2 - 1, 24, D / 2 + 1),
          ...(this.property.model.procedural.leaseBanner ? [new THREE.Vector3(W / 2 + 0.2, 30, D / 2 - 3.3)] : []),
        ],
      }
      : {};
  }

  // ---------- public API ----------
  play() {
    if (!this.chapters) return;
    this.clearPlan();
    this.tour.playing = true;
    this.tour.from = { pos: this.camera.position.clone(), target: this.controls.target.clone(), fov: this._fov ?? this.camera.fov };
    this.tour.t = 0;
    this.tour.phase = 'move';
  }
  pause() {
    this.tour.playing = false;
  }
  toggle() {
    this.tour.playing ? this.pause() : this.play();
    return this.tour.playing;
  }
  goToChapter(i, instant = false) {
    if (!this.chapters) return;
    this.clearPlan();
    this.tour.index = ((i % this.chapters.length) + this.chapters.length) % this.chapters.length;
    const ch = this.chapters[this.tour.index];
    this._chapterFade(ch);
    this.onChapter?.(ch, this.tour.index);
    if (instant) {
      this._setFov(ch.fov);
      this.camera.position.copy(ch.pos);
      this.controls.target.copy(ch.target);
      this.controls.update();
      return;
    }
    this.flyTo(ch.pos, ch.target, 2.2, ch.fov);
  }
  next() { this.goToChapter(this.tour.index + 1); }
  prev() { this.goToChapter(this.tour.index - 1); }

  flyTo(pos, target, duration = 2.2, fov = this._fov ?? this.camera.fov) {
    this.pause();
    this.fly = { from: { pos: this.camera.position.clone(), target: this.controls.target.clone(), fov: this._fov ?? this.camera.fov }, to: { pos, target, fov }, t: 0, duration };
  }
  // Chapter FOVs are authored for a landscape view; on narrow (portrait)
  // screens widen the vertical FOV so the same horizontal framing fits.
  _setFov(f) {
    this._fov = f;
    const k = Math.max(1, 1.5 / this.camera.aspect);
    const eff = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(f) / 2) * k));
    if (Math.abs(this.camera.fov - eff) < 1e-3) return;
    this.camera.fov = Math.min(eff, 100);
    this.camera.updateProjectionMatrix();
  }

  // Highlight a floor and fly the camera to it.
  focusFloor(n) {
    const [y0, y1] = this.model.floorRange(n);
    const { width: W, depth: D } = this.model;
    if (!this.highlight) {
      const geo = new THREE.BoxGeometry(W + 1.4, 1, D + 1.4);
      this.highlight = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.55, depthWrite: false }),
      );
      // Bright outline that is always visible, even through the walls.
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: '#dbeafe', depthTest: false, transparent: true, opacity: 0.95 }),
      );
      this.highlight.add(edges);
      this.scene.add(this.highlight);
    }
    this.highlight.visible = true;
    this.highlight.scale.y = y1 - y0;
    this.highlight.position.y = (y0 + y1) / 2;
    const y = (y0 + y1) / 2;
    this.flyTo(new THREE.Vector3(W * 2.0, y + 8, D / 2 + Math.max(W, D) * 1.5), new THREE.Vector3(0, y, 0), 2.2, 42);
  }
  clearFloor() {
    if (this.highlight) this.highlight.visible = false;
  }

  // Cut the building open just above storey n and lay its published plan in
  // it (drawing on the floor, walls and columns raised from the drawing).
  async showPlan(n, plan) {
    if (!this.model || !plan?.model3d) return this.focusFloor(n);
    const token = (this._planToken = (this._planToken ?? 0) + 1);
    const [y0, y1] = this.model.floorRange(n);
    const { width: W, depth: D } = this.model;
    const key = `${plan.src}|${n}`;
    if (this.plan?.key !== key) {
      const g = await buildPlanFloor({ src: plan.src, model3d: plan.model3d, W, D, maxAniso: this.renderer.capabilities.getMaxAnisotropy() });
      if (token !== this._planToken) { g.userData.dispose(); return; }
      this._removePlan();
      g.position.y = y0 + 0.02;
      this.scene.add(g);
      this.plan = { key, group: g, n };
    }
    if (this.highlight) this.highlight.visible = false;
    const cut = y0 + Math.min(this.plan.group.userData.wallH + 0.35, (y1 - y0) * 0.6);
    this._clip(cut, y0 + 0.03);
    this.hotspots.forEach((h) => (h.visible = false));
    this._hotspotsOff = true;
    this.fadeOpts = {};
    this._dirty = true;
    // Look down into the cut from the street-side corner.
    const r = Math.max(W, D);
    this.flyTo(new THREE.Vector3(W * 0.45, y0 + r * 0.82, D * 0.5 + r * 0.48), new THREE.Vector3(0, y0, -D * 0.06), 2.0, 36);
    this.onPlan?.(n, plan);
  }
  clearPlan() {
    if (!this.plan && !this._clipped) return;
    this._planToken = (this._planToken ?? 0) + 1;
    this._removePlan();
    this._clip(null);
    this._hotspotsOff = false;
    this._dirty = true;
    this.onPlan?.(null);
  }
  _removePlan() {
    if (!this.plan) return;
    this.scene.remove(this.plan.group);
    this.plan.group.userData.dispose();
    this.plan = null;
  }
  // Cut-away: hide the building above `cut`, and everything inside the facade
  // (inset ~0.6 m) above `floor`, leaving the outer walls around the plan.
  _clip(cut, floor) {
    const on = cut != null;
    const u = this._fp;
    if (!u) return;
    u.uFPOn.value = on ? 1 : 0;
    if (on) {
      u.uFPCut.value = cut;
      u.uFPFloor.value = floor;
      u.uFPHalf.value.set(this.model.width / 2 - 0.6, this.model.depth / 2 - 0.6);
    }
    if (on !== !!this._clipped) {
      for (const mm of this.buildingMats ?? []) {
        if (on) { mm.userData.side0 ??= mm.side; mm.side = THREE.DoubleSide; } else mm.side = mm.userData.side0 ?? mm.side;
      }
      this._clipped = on;
    }
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    if (this._fov) this._setFov(this._fov);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this._dirty = true;
  }
  _syncLoop() {
    const run = this._onScreen && !document.hidden;
    if (run === this._running) return;
    this._running = run;
    if (run) { this.clock.getDelta(); this._dirty = true; }
    this.renderer.setAnimationLoop(run ? () => this._frame() : null);
  }

  dispose() {
    document.removeEventListener('visibilitychange', this._onVis);
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._resize);
    this.renderer.dispose();
  }

  // ---------- per-frame ----------
  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    let active = this._dirty;
    this._dirty = false;
    if (this.fly) {
      active = true;
      const f = this.fly;
      f.t += dt / f.duration;
      const k = easeInOut(Math.min(f.t, 1));
      this.camera.position.lerpVectors(f.from.pos, f.to.pos, k);
      this.controls.target.lerpVectors(f.from.target, f.to.target, k);
      this._setFov(f.from.fov + (f.to.fov - f.from.fov) * k);
      if (f.t >= 1) this.fly = null;
    } else if (this.tour.playing && this.chapters) {
      active = true;
      this._stepTour(dt);
    }
    if (this.fadeOpts?.pos && !this.fly && !this.tour.playing && this.camera.position.distanceTo(this.fadeOpts.pos) > 25) this.fadeOpts = {};
    if (this.controls.update()) active = true;
    if (this.camera.position.y < 0.8) this.camera.position.y = 0.8;
    if (this.context && updateFades(this.context.fadeables, this.camera, dt, this.subjectBox, this.fadeOpts)) active = true;
    // Nothing moved: skip the frame entirely (keeps scrolling smooth and
    // laptops cool). Hotspot markers only pulse while the view is moving.
    if (!active) return;
    const pulse = 2 + Math.sin(performance.now() / 350) * 0.15;
    for (const s of this.hotspots) {
      s.scale.set(pulse, pulse, 1);
      const o = THREE.MathUtils.clamp((s.position.distanceTo(this.camera.position) - 8) / 10, 0, 1);
      s.material.opacity = o;
      s.visible = o > 0.02 && !this._hotspotsOff;
    }
    this.renderer.render(this.scene, this.camera);
    this._adaptQuality(dt);
  }

  // If frames are consistently slow, drop the render resolution one step.
  _adaptQuality(dt) {
    this._ft = (this._ft ?? 0.016) * 0.95 + dt * 0.05;
    this._ftN = (this._ftN ?? 0) + 1;
    if (this._ftN > 90 && this._ft > 0.034 && this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(Math.max(1, this.renderer.getPixelRatio() - 0.5));
      this.resize();
      this._ftN = 0;
    }
  }


  _stepTour(dt) {
    const t = this.tour;
    const ch = this.chapters[t.index];
    if (t.phase === 'move') {
      const moveTime = 3.2;
      t.t += dt / moveTime;
      const k = easeInOut(Math.min(t.t, 1));
      // Arc slightly outward mid-flight so the camera never clips through the building.
      const pos = new THREE.Vector3().lerpVectors(t.from.pos, ch.pos, k);
      const bulge = Math.sin(k * Math.PI) * 0.25;
      pos.x *= 1 + bulge;
      pos.z *= 1 + bulge;
      this.camera.position.copy(pos);
      this.controls.target.lerpVectors(t.from.target, ch.target, k);
      this._setFov(t.from.fov + (ch.fov - t.from.fov) * k);
      this.onProgress?.((t.index + k * 0.5) / this.chapters.length);
      if (t.t >= 1) { t.phase = 'hold'; t.t = 0; }
    } else {
      t.t += dt / ch.hold;
      // Slow drift while holding, for a cinematic feel.
      const a = dt * 0.06;
      this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
      this.onProgress?.((t.index + 0.5 + Math.min(t.t, 1) * 0.5) / this.chapters.length);
      if (t.t >= 1) {
        t.index = (t.index + 1) % this.chapters.length;
        t.from = { pos: this.camera.position.clone(), target: this.controls.target.clone(), fov: this._fov ?? this.camera.fov };
        t.t = 0;
        t.phase = 'move';
        this._chapterFade(this.chapters[t.index]);
        this.onChapter?.(this.chapters[t.index], t.index);
      }
    }
  }

  // ---------- picking ----------
  _updatePointer(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.hotspots, false)[0];
  }
  _onMove(e) {
    this.renderer.domElement.style.cursor = this._updatePointer(e) ? 'pointer' : 'grab';
  }
  _onClick(e) {
    const hit = this._updatePointer(e);
    if (!hit) return;
    const h = hit.object.userData.hotspot;
    const p = hit.object.position.clone();
    const dir = p.clone().setY(0).normalize();
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    const camPos = p.clone().add(dir.multiplyScalar(18)).add(new THREE.Vector3(0, 3, 0));
    this.flyTo(camPos, p, 1.6);
    this.onHotspot?.(h, hit.object);
  }
  // Screen-space position of a hotspot (for the HTML tooltip).
  project(obj) {
    const v = obj.position.clone().project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: ((v.x + 1) / 2) * r.width, y: ((1 - v.y) / 2) * r.height, visible: v.z < 1 };
  }
}

function positionOnBox(u, v, face, W, D, H) {
  const y = v * H;
  switch (face) {
    case 'front': return new THREE.Vector3((u - 0.5) * W, y, D / 2 + 0.9);
    case 'back': return new THREE.Vector3((0.5 - u) * W, y, -D / 2 - 0.9);
    case 'right': return new THREE.Vector3(W / 2 + 0.9, y, (0.5 - u) * D);
    case 'left': return new THREE.Vector3(-W / 2 - 0.9, y, (u - 0.5) * D);
    default: return new THREE.Vector3((u - 0.5) * W, y, 0);
  }
}

// Inject the floor-plan cut-away into a built-in material (uniforms are shared,
// so turning it on/off or moving it needs no shader recompile).
function addCutaway(mat, u) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    if (!sh.vertexShader.includes('#include <project_vertex>') || !sh.fragmentShader.includes('void main() {')) return;
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'varying vec3 vFPWorld;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 fpw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        fpw = instanceMatrix * fpw;
      #endif
      vFPWorld = (modelMatrix * fpw).xyz;`);
    sh.fragmentShader = sh.fragmentShader.replace('void main() {', `uniform float uFPOn; uniform float uFPCut; uniform float uFPFloor; uniform vec2 uFPHalf; varying vec3 vFPWorld;
      void main() {
        if (uFPOn > 0.5) {
          if (vFPWorld.y > uFPCut) discard;
          if (vFPWorld.y > uFPFloor && abs(vFPWorld.x) < uFPHalf.x && abs(vFPWorld.z) < uFPHalf.y) discard;
        }`);
  };
  mat.customProgramCacheKey = () => 'fp-cutaway';
}
