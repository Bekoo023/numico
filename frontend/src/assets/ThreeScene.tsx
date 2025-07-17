import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog('#1e293b', 20, 60);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x334155, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x0ea5e9, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 2.5, 25);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2.5, 25);
    pointLight2.position.set(10, -5, 0);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x10b981, 2, 20);
    pointLight3.position.set(0, 10, -5);
    scene.add(pointLight3);

    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.024; // Cyan
        colors[i3 + 1] = 0.714;
        colors[i3 + 2] = 0.831;
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.545; // Purple
        colors[i3 + 1] = 0.361;
        colors[i3 + 2] = 0.965;
      } else {
        colors[i3] = 0.065; // Emerald
        colors[i3 + 1] = 0.725;
        colors[i3 + 2] = 0.506;
      }
      
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      map: createCircleTexture(),
    });

    function createCircleTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 30;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      return new THREE.CanvasTexture(canvas);
    }

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Explicitly type the arrays
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 16, 16);

      const colorChoice = Math.random();
      let color: number;
      if (colorChoice < 0.33) {
        color = 0x06b6d4; // Cyan
      } else if (colorChoice < 0.66) {
        color = 0x8b5cf6; // Purple
      } else {
        color = 0x10b981; // Emerald
      }

      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        shininess: 100,
        wireframe: Math.random() > 0.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      geometries.push(geometry);
      materials.push(material);
      meshes.push(mesh);
      scene.add(mesh);
    }

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    
    for (let i = 0; i < 20; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      
      linePositions.push(start.x, start.y, start.z);
      linePositions.push(end.x, end.y, end.z);
      
      const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.8, 0.6);
      lineColors.push(color.r, color.g, color.b);
      lineColors.push(color.r * 0.3, color.g * 0.3, color.b * 0.3);
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    let time = 0;
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      time += 0.01;

      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3 + 1] += Math.sin(time + i * 0.01) * 0.01;
        particlePositions[i3] += Math.cos(time + i * 0.01) * 0.005;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.005 + index * 0.0005;
        mesh.rotation.y += 0.003 + index * 0.0003;
        mesh.rotation.z += 0.002 + index * 0.0002;
        
        mesh.position.y += Math.sin(time + index) * 0.01;
        mesh.position.x += Math.cos(time + index * 0.5) * 0.005;
      });

      pointLight1.position.x = Math.sin(time * 0.7) * 15;
      pointLight1.position.z = Math.cos(time * 0.5) * 10;
      
      pointLight2.position.x = Math.cos(time * 0.6) * 15;
      pointLight2.position.y = Math.sin(time * 0.8) * 10;
      
      pointLight3.position.z = Math.sin(time * 0.4) * 15;
      pointLight3.position.x = Math.cos(time * 0.9) * 10;

      lines.rotation.y += 0.0003;
      lines.rotation.x += 0.0002;

      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        zIndex: 0,
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeScene;