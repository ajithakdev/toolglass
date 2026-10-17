// The home hero's 3D scene: the logo's two glass panes over a ring of tool
// glyphs. Plain three.js (no React renderer), lazy-loaded so it never touches
// the main bundle or tool pages.
//
// The world (renderer, environment, compiled shaders) is built once and reused,
// so returning to Home does not rebuild it. Building it is the expensive part.
import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Short marks for tools people use; drawn as text, so no image assets
const GLYPHS = ['{ }', '#', 'Aa', 'QR', '01', '</>', '%', 'UTC', 'PDF', 'JPG', '***', 'px', '.*', 'MD'];

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function glyphTexture(text: string) {
  return canvasTexture(256, (g) => {
    const dark = isDark();
    g.fillStyle = dark ? '#1a2029' : '#ffffff';
    g.strokeStyle = dark ? '#2c3440' : '#dfe4ea';
    g.lineWidth = 4;
    g.beginPath();
    g.roundRect(14, 14, 228, 228, 52);
    g.fill();
    g.stroke();
    g.fillStyle = cssVar('--ink') || '#0e141b';
    g.font = `600 ${text.length > 2 ? 64 : 92}px "Geist Mono", ui-monospace, monospace`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 128, 132);
  });
}

// What you see through the front pane: tool glyphs on the page color, lit by a
// soft accent. Frosted glass over real content.
function plateTexture() {
  return canvasTexture(512, (g) => {
    const dark = isDark();
    g.fillStyle = dark ? '#121722' : '#f3f6f9';
    g.fillRect(0, 0, 512, 512);
    const light = g.createRadialGradient(330, 180, 10, 330, 180, 360);
    light.addColorStop(0, dark ? 'rgba(142,163,255,0.55)' : 'rgba(37,69,220,0.35)');
    light.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = light;
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = dark ? 'rgba(230,235,241,0.75)' : 'rgba(14,20,27,0.7)';
    g.font = '600 46px "Geist Mono", ui-monospace, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    GLYPHS.slice(0, 9).forEach((t, i) => g.fillText(t, 92 + (i % 3) * 164, 96 + Math.floor(i / 3) * 160));
  });
}

interface World {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  panes: Group;
  back: Mesh;
  front: Mesh;
  ring: Group;
  tiles: Mesh<PlaneGeometry, MeshBasicMaterial>[];
  timer: Timer;
  ready: Promise<unknown>;
}

let world: World | null | undefined; // undefined = not built yet, null = no WebGL

function buildWorld(): World | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // no WebGL: the poster stays
  }
  // Lower resolution on modest hardware keeps it smooth at high refresh rates
  const nav = navigator as Navigator & { deviceMemory?: number };
  const modest = (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, modest ? 1 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  scene.add(key);

  // Two panes, like the logo: a tinted back pane and a clear front pane
  const panes = new Group();
  const paneGeo = new RoundedBoxGeometry(2.3, 2.3, 0.42, 6, 0.36);
  const back = new Mesh(
    paneGeo,
    new MeshPhysicalMaterial({ color: new Color('#3f5cf0'), roughness: 0.18, transmission: 0.55, thickness: 0.8, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.1 }),
  );
  back.position.set(-0.62, 0.62, -0.5);
  const front = new Mesh(
    paneGeo,
    new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.16,
      transmission: 1,
      thickness: 1.4,
      ior: 1.52,
      dispersion: 6,
      attenuationColor: new Color('#cfe0f5'),
      attenuationDistance: 5,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  );
  front.position.set(0.55, -0.55, 0.45);
  // Opaque plate right behind the front pane (transmission only refracts opaque
  // objects). A child of the pane, so it moves with it and stays behind it.
  const plate = new Mesh(new PlaneGeometry(2.05, 2.05), new MeshBasicMaterial({ map: plateTexture(), toneMapped: false }));
  plate.position.set(0, 0, -0.5);
  front.add(plate);
  panes.add(back, front);
  panes.rotation.set(-0.18, 0.42, 0.06);
  scene.add(panes);

  // Ring of glyph tiles behind the glass
  const ring = new Group();
  const tileGeo = new PlaneGeometry(0.62, 0.62);
  const count = modest ? 10 : GLYPHS.length;
  const tiles: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  for (let i = 0; i < count; i++) {
    const tile = new Mesh(tileGeo, new MeshBasicMaterial({ map: glyphTexture(GLYPHS[i]!), alphaTest: 0.5, toneMapped: false }));
    tile.userData = { a: (i / count) * Math.PI * 2, r: 2.7 + (i % 2) * 0.55, y: ((i % 3) - 1) * 0.3, z: -2.2 - (i % 4) * 0.5 };
    tiles.push(tile);
    ring.add(tile);
  }
  scene.add(ring);

  const retheme = () => {
    // Dimmer reflections in dark mode, or the glass reads as silver
    scene.environmentIntensity = isDark() ? 0.35 : 1;
    tiles.forEach((t, i) => {
      t.material.map?.dispose();
      t.material.map = glyphTexture(GLYPHS[i]!);
      t.material.needsUpdate = true;
    });
    plate.material.map?.dispose();
    plate.material.map = plateTexture();
    plate.material.needsUpdate = true;
    renderer.render(scene, camera);
  };
  scene.environmentIntensity = isDark() ? 0.35 : 1;
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Compile shaders without blocking the main thread where the browser supports it;
  // elsewhere they compile on the first frame (after the page has already painted)
  const ready = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera).catch(() => undefined)
    : Promise.resolve();

  return { renderer, scene, camera, panes, back, front, ring, tiles, timer: new Timer(), ready };
}

export interface GlassSceneProps {
  /** 0..1 scroll progress through the hero; read every frame */
  progress: () => number;
  onReady?: () => void;
}

export default function GlassScene({ progress, onReady }: GlassSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let alive = true;
    let cleanup = () => {};

    // Build after the page transition has painted, so navigation never hitches
    const start = () => {
      if (!alive) return;
      if (world === undefined) world = buildWorld();
      const w = world;
      if (!w) return;
      const { renderer, scene, camera, panes, back, front, ring, tiles, timer } = w;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      host.appendChild(renderer.domElement);

      const draw = () => renderer.render(scene, camera);
      const resize = () => {
        const wd = host.clientWidth || 1;
        const ht = host.clientHeight || 1;
        renderer.setSize(wd, ht, false);
        camera.aspect = wd / ht;
        // Pull back on narrow screens so the panes stay whole
        camera.position.z = wd / ht < 0.9 ? 12.5 : 9;
        camera.updateProjectionMatrix();
        if (reduce) draw();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      // Pointer parallax, eased toward the target every frame
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('pointermove', onPointer, { passive: true });

      let t = 0;
      let raf = 0;
      let visible = true;
      const place = () => {
        const p = Math.min(1, Math.max(0, progress()));
        timer.update();
        // Frame-rate independent easing: same feel at 60 or 144 Hz
        const dt = Math.min(timer.getDelta(), 0.05);
        t += dt;
        const k = 1 - Math.exp(-dt * 4);
        pointer.x += (pointer.tx - pointer.x) * k;
        pointer.y += (pointer.ty - pointer.y) * k;

        panes.rotation.y = 0.42 + pointer.x * 0.28 + p * 1.1 + Math.sin(t * 0.4) * 0.05;
        panes.rotation.x = -0.18 + pointer.y * 0.18 - p * 0.35;
        panes.position.y = p * 0.7 + Math.sin(t * 0.8) * 0.06;
        // On scroll the panes separate a little: the logo opening up
        back.position.x = -0.62 - p * 0.5;
        front.position.x = 0.55 + p * 0.5;

        ring.rotation.z = t * 0.06;
        tiles.forEach((tile) => {
          const d = tile.userData as { a: number; r: number; y: number; z: number };
          const a = d.a + t * 0.12;
          const r = d.r * (1 + p * 0.35);
          tile.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.62 + d.y * 0.4, d.z);
          tile.rotation.z = -ring.rotation.z;
        });
        draw();
      };
      const loop = () => {
        cancelAnimationFrame(raf);
        if (!alive || !visible || document.hidden || reduce) return;
        place();
        raf = requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible) loop();
      });
      io.observe(host);
      const onVisibility = () => {
        timer.update(); // drop the time spent hidden
        if (!document.hidden) loop();
      };
      document.addEventListener('visibilitychange', onVisibility);

      // Reveal only once shaders are ready and a frame is drawn: no half-built scene
      w.ready.then(() => {
        if (!alive) return;
        timer.update();
        if (reduce) place();
        else loop();
        requestAnimationFrame(() => alive && onReady?.());
      });

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        // Keep the world for the next visit; just take the canvas off the page
        renderer.domElement.remove();
      };
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 400 })
      : window.setTimeout(start, 120);

    return () => {
      alive = false;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup();
    };
  }, [progress, onReady]);

  return <div ref={hostRef} aria-hidden style={{ position: 'absolute', inset: 0 }} />;
}
