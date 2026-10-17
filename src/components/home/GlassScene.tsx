// The home hero's 3D scene: the logo's two glass panes, refracting a ring of
// tool glyphs. Plain three.js (no React renderer) and lazy-loaded, so it never
// touches the main bundle or tool pages.
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

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// A soft light behind the panes, so the glass has color to bend
function lightTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(150,220,240,1)');
  grad.addColorStop(0.55, 'rgba(90,120,255,1)');
  grad.addColorStop(0.98, 'rgba(60,90,230,1)');
  grad.addColorStop(1, 'rgba(60,90,230,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function glyphTexture(text: string) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  // Solid tile colors (alphaTest cuts only the rounded corners)
  g.fillStyle = dark ? '#1a2029' : '#ffffff';
  g.strokeStyle = dark ? '#2c3440' : '#dfe4ea';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(14, 14, size - 28, size - 28, 52);
  g.fill();
  g.stroke();
  g.fillStyle = cssVar('--ink') || '#0e141b';
  g.font = `600 ${text.length > 2 ? 64 : 92}px "Geist Mono", ui-monospace, monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, size / 2, size / 2 + 4);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
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

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // no WebGL: the poster stays
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Lower resolution on modest hardware keeps it smooth at high refresh rates
    const nav = navigator as Navigator & { deviceMemory?: number };
    const modest = (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, modest ? 1 : 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

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
      new MeshPhysicalMaterial({
        color: new Color('#3f5cf0'),
        metalness: 0,
        roughness: 0.18,
        transmission: 0.55,
        thickness: 0.8,
        ior: 1.45,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    );
    back.position.set(-0.62, 0.62, -0.5);
    const front = new Mesh(
      paneGeo,
      new MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.12,
        transmission: 1,
        thickness: 1.4,
        ior: 1.52,
        dispersion: 6,
        attenuationColor: new Color('#cfe8f2'),
        attenuationDistance: 4,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
      }),
    );
    front.position.set(0.55, -0.55, 0.45);
    // Opaque centre with a cutout edge, so the transmissive panes refract it
    // Smaller than the front pane and right behind it, so it is only ever seen through the glass
    const glow = new Mesh(new PlaneGeometry(1.7, 1.7), new MeshBasicMaterial({ map: lightTexture(), alphaTest: 0.5, toneMapped: false }));
    // Child of the front pane, so it stays hidden behind it as the panes move
    glow.position.set(0, 0, -0.6);
    front.add(glow);
    panes.add(back, front);
    panes.rotation.set(-0.18, 0.42, 0.06);
    scene.add(panes);

    // Ring of glyph tiles behind the glass
    const ring = new Group();
    const tileGeo = new PlaneGeometry(0.62, 0.62);
    const count = modest ? 10 : GLYPHS.length;
    const tiles: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
    for (let i = 0; i < count; i++) {
      // Opaque with an alpha cutout: transmissive glass only refracts opaque objects
      const mat = new MeshBasicMaterial({ map: glyphTexture(GLYPHS[i]!), alphaTest: 0.5, toneMapped: false });
      const tile = new Mesh(tileGeo, mat);
      const a = (i / count) * Math.PI * 2;
      tile.userData = { a, r: 2.7 + (i % 2) * 0.55, y: ((i % 3) - 1) * 0.3, z: -2.2 - (i % 4) * 0.5 };
      tiles.push(tile);
      ring.add(tile);
    }
    scene.add(ring);

    // Redraw glyphs when the theme changes
    const themeObs = new MutationObserver(() => {
      tiles.forEach((t, i) => {
        t.material.map?.dispose();
        t.material.map = glyphTexture(GLYPHS[i]!);
        t.material.needsUpdate = true;
      });
      if (reduce) renderer.render(scene, camera);
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Pull back on narrow screens so the panes stay whole
      camera.position.z = w / h < 0.9 ? 12.5 : 9;
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
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

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !reduce) loop();
    });
    io.observe(host);

    const timer = new Timer();
    let t = 0;
    let raf = 0;
    const place = () => {
      const p = Math.min(1, Math.max(0, progress()));
      // Frame-rate independent easing: same feel at 60 or 144 Hz
      timer.update();
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
      renderer.render(scene, camera);
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden) return;
      place();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      timer.update(); // drop the time spent hidden
      if (!document.hidden && !reduce) loop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      loop();
    }
    // Reveal after the first frame so there is never a half-drawn scene
    requestAnimationFrame(() => onReady?.());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          const m = o.material as MeshBasicMaterial | MeshPhysicalMaterial;
          if ('map' in m) m.map?.dispose();
          m.dispose();
        }
      });
      timer.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, onReady]);

  return <div ref={hostRef} aria-hidden style={{ position: 'absolute', inset: 0 }} />;
}
