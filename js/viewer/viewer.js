// Interactive 3D building viewer with a guided 360° tour.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildPrewarBrick } from './building.js';
import { hotspotTexture } from './textures.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class BuildingViewer {
  constructor(container, property, { onHotspot, onChapter, onProgress } = {}) {
    this.container = container;
    this.property = property;
    this.onHotspot = onHotspot;
    this.onChapter = onChapter;
    this.onProgress = onProgress;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#dfe9f3');
    this.scene.fog = new THREE.Fog('#dfe9f3', 220, 600);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 320;

    this.clock = new THREE.Clock();
    this.tour = { playing: false, index: 0, t: 0, from: null };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hotspots = [];
    this.highlight = null;

    this._setupLights();
    this._setupGround();
    this._loadModel().then(() => {
      this._setupHotspots();
      this._buildChapters();
      this.goToChapter(0, true);
      this.play();
    });

    // Any user interaction pauses the guided tour so it never fights the mouse.
    const stop = () => this.pause();
    this.renderer.domElement.addEventListener('pointerdown', stop);
    this.renderer.domElement.addEventListener('wheel', stop, { passive: true });
    this.renderer.domElement.addEventListener('click', (e) => this._onClick(e));
    this.renderer.domElement.addEventListener('pointermove', (e) => this._onMove(e));

    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.resize();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  // ---------- scene setup ----------
  _setupLights() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const hemi = new THREE.HemisphereLight('#cfe3ff', '#6b5a4a', 0.55);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff4e0', 2.4);
    sun.position.set(-40, 80, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = 70;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 250 });
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
  }

  _setupGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: '#8f8f8f', roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    // Sidewalk + street in front (the +z side).
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(120, 0.15, 5), new THREE.MeshStandardMaterial({ color: '#b9b4ab', roughness: 1 }));
    sidewalk.position.set(0, 0.075, 18);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);
    const street = new THREE.Mesh(new THREE.PlaneGeometry(120, 14), new THREE.MeshStandardMaterial({ color: '#3d3d40', roughness: 1 }));
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0.01, 27.5);
    street.receiveShadow = true;
    this.scene.add(street);
    for (let i = -11; i <= 11; i++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.25), new THREE.MeshBasicMaterial({ color: '#e6d36b' }));
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i * 5, 0.02, 27.5);
      this.scene.add(dash);
    }
    // Ghosted neighbours for scale (the real neighbours are glass/metal towers).
    const ghost = new THREE.MeshStandardMaterial({ color: '#c9d4de', roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.35, depthWrite: false });
    const nbrs = [
      [-26, 90, 36, -1], [26, 110, 36, 1],
      [-10, 60, 28, 0, -50], [12, 75, 28, 0, -50],
    ];
    for (const [x, h, d, , z = 0] of nbrs) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(20, h, d), ghost);
      b.position.set(x, h / 2, z);
      this.scene.add(b);
    }
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
    this.model = buildPrewarBrick(model.procedural);
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
    const r = Math.max(H * 1.35, D * 1.3);
    const mid = new THREE.Vector3(0, H * 0.48, 0);
    const look = (y, z = 0) => new THREE.Vector3(0, y, z);
    this.chapters = [
      { id: 'street', label: 'Street level', pos: new THREE.Vector3(-22, 2.0, D / 2 + 30), target: look(10, D / 2), hold: 2.5 },
      { id: 'front', label: 'Front facade', pos: new THREE.Vector3(0, H * 0.5, D / 2 + r), target: mid, hold: 2.5 },
      { id: 'front-right', label: 'Corner · East', pos: new THREE.Vector3(r * 0.75, H * 0.55, D / 2 + r * 0.65), target: mid, hold: 1.5 },
      { id: 'right', label: 'East side', pos: new THREE.Vector3(r * 1.05, H * 0.5, 0), target: mid, hold: 2.5 },
      { id: 'back-right', label: 'Corner · Rear', pos: new THREE.Vector3(r * 0.75, H * 0.6, -D / 2 - r * 0.65), target: mid, hold: 1.5 },
      { id: 'back', label: 'Rear facade', pos: new THREE.Vector3(0, H * 0.5, -D / 2 - r), target: mid, hold: 2.5 },
      { id: 'left', label: 'West side', pos: new THREE.Vector3(-r * 1.05, H * 0.5, 0), target: mid, hold: 2.5 },
      { id: 'roof', label: 'Roof & skyline', pos: new THREE.Vector3(-r * 0.7, H * 1.9, D / 2 + r * 0.7), target: look(H * 0.85), hold: 3 },
      { id: 'crown', label: 'Crown detail', pos: new THREE.Vector3(8, H + 4, D / 2 + 30), target: look(H - 3, D / 2), hold: 2.5 },
    ];
  }

  // ---------- public API ----------
  play() {
    if (!this.chapters) return;
    this.tour.playing = true;
    this.tour.from = { pos: this.camera.position.clone(), target: this.controls.target.clone() };
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
    this.tour.index = ((i % this.chapters.length) + this.chapters.length) % this.chapters.length;
    const ch = this.chapters[this.tour.index];
    this.onChapter?.(ch, this.tour.index);
    if (instant) {
      this.camera.position.copy(ch.pos);
      this.controls.target.copy(ch.target);
      this.controls.update();
      return;
    }
    this.flyTo(ch.pos, ch.target);
  }
  next() { this.goToChapter(this.tour.index + 1); }
  prev() { this.goToChapter(this.tour.index - 1); }

  flyTo(pos, target, duration = 2.2) {
    this.pause();
    this.fly = { from: { pos: this.camera.position.clone(), target: this.controls.target.clone() }, to: { pos, target }, t: 0, duration };
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
    this.flyTo(new THREE.Vector3(W * 2.2, y + 8, D / 2 + Math.max(W, D) * 1.4), new THREE.Vector3(0, y, 0));
  }
  clearFloor() {
    if (this.highlight) this.highlight.visible = false;
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }
  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._resize);
    this.renderer.dispose();
  }

  // ---------- per-frame ----------
  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (this.fly) {
      const f = this.fly;
      f.t += dt / f.duration;
      const k = easeInOut(Math.min(f.t, 1));
      this.camera.position.lerpVectors(f.from.pos, f.to.pos, k);
      this.controls.target.lerpVectors(f.from.target, f.to.target, k);
      if (f.t >= 1) this.fly = null;
    } else if (this.tour.playing && this.chapters) {
      this._stepTour(dt);
    }
    // Gentle pulse on hotspots.
    const pulse = 2 + Math.sin(performance.now() / 350) * 0.15;
    for (const s of this.hotspots) s.scale.set(pulse, pulse, 1);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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
        t.from = { pos: this.camera.position.clone(), target: this.controls.target.clone() };
        t.t = 0;
        t.phase = 'move';
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
