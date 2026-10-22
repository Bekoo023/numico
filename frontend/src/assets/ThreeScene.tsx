import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Decorative, bounded scene: no React updates in the render loop. */
export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 800px)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !compact, powerPreference: "low-power" });
    } catch {
      return; // The CSS aurora remains visible without WebGL.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b18, 0.018);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 23);

    // Keep the original cyan / violet / emerald particle atmosphere.
    const count = compact ? 420 : 950;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color("#70d7eb"), new THREE.Color("#8a83ec"), new THREE.Color("#6dc6b7")];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * 65;
      positions[i * 3 + 1] = (Math.random() - .5) * 45;
      positions[i * 3 + 2] = (Math.random() - .5) * 35;
      const color = palette[i % palette.length];
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = textureCanvas.height = 32;
    const ctx = textureCanvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(.2, "#ffffffcc");
      gradient.addColorStop(1, "#ffffff00");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(textureCanvas);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: .095, map: texture, vertexColors: true, transparent: true, opacity: .72, depthWrite: false, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Fine orbital contours provide a deliberate focal point behind the product.
    const orbit = new THREE.Group();
    orbit.position.set(7, 1, -7);
    orbit.rotation.set(.35, -.3, -.4);
    const resources: Array<THREE.BufferGeometry | THREE.Material> = [geometry, material];
    for (let i = 0; i < 5; i++) {
      const points = Array.from({ length: 181 }, (_, j) => {
        const angle = (j / 180) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * (8 + i * .45), Math.sin(angle) * (8 + i * .45), 0);
      });
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const ringMaterial = new THREE.LineBasicMaterial({ color: i % 2 ? 0x7065d4 : 0x48b5d2, transparent: true, opacity: .13 - i * .015, depthWrite: false, blending: THREE.AdditiveBlending });
      const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
      ring.rotation.x = i * .15;
      ring.rotation.y = i * .09;
      orbit.add(ring);
      resources.push(ringGeometry, ringMaterial);
    }
    scene.add(orbit);
    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const shapeGeometry = new THREE.IcosahedronGeometry(.45 + i * .16, 1);
      const shapeMaterial = new THREE.MeshBasicMaterial({ color: palette[i % 3], wireframe: true, transparent: true, opacity: .11, depthWrite: false });
      const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
      mesh.position.set([-13, 12, -9, 16, 3][i], [5, -6, -8, 8, 10][i], -5 - i);
      scene.add(mesh);
      shapes.push(mesh);
      resources.push(shapeGeometry, shapeMaterial);
    }
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let disposed = false;
    let contextLost = false;
    const pointer = new THREE.Vector2();
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || contextLost || document.hidden) return;
      const delta = last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      if (!reducedMotion.matches) {
        elapsed += delta;
        particles.rotation.y = elapsed * .014;
        particles.rotation.x = Math.sin(elapsed * .09) * .05;
        particles.position.y = Math.sin(elapsed * .16) * .3;
        orbit.rotation.z = -.4 + elapsed * .027;
        orbit.rotation.x = .35 + Math.sin(elapsed * .12) * .08;
        shapes.forEach((mesh, index) => {
          mesh.rotation.x = elapsed * .06 + index;
          mesh.rotation.y = elapsed * .04;
          mesh.position.y = [5, -6, -8, 8, 10][index] + Math.sin(elapsed * .3 + index) * .35;
        });
        const ease = 1 - Math.exp(-delta * 2);
        camera.position.x += (pointer.x * .8 - camera.position.x) * ease;
        camera.position.y += (pointer.y * .5 - camera.position.y) * ease;
      }
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!reducedMotion.matches) frame = requestAnimationFrame(render);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!disposed && !contextLost && !document.hidden) frame = requestAnimationFrame(render);
    };
    const resize = () => {
      const width = mount.clientWidth;
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (reducedMotion.matches) restart();
    };
    const onLost = (event: Event) => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); };
    const onRestored = () => { contextLost = false; restart(); };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.addEventListener("visibilitychange", restart);
    reducedMotion.addEventListener("change", restart);
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    renderer.domElement.addEventListener("webglcontextrestored", onRestored);
    resize();
    restart();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("visibilitychange", restart);
      reducedMotion.removeEventListener("change", restart);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
      resources.forEach(resource => resource.dispose());
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={mountRef} className="three-scene" aria-hidden="true" />;
}
