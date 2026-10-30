import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Maximize2, Sparkles, Sliders, Check } from 'lucide-react';

export default function GarmentPreview3D({
  collar = 'sherwani',
  neckline = 'placket',
  sleeves = 'cuff',
  daman = 'round',
  buttons = 'metal',
  color = '#1C3A2B',
  measurements = {},
  unit = 'inches',
  onColorChange
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const mannequinGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [activeView, setActiveView] = useState('front'); // 'front', 'side', 'back', '3/4'
  const [isDragging, setIsDragging] = useState(false);

  // Target rotation for smooth interpolation
  const targetRotation = useRef({ x: 0.1, y: 0 });
  const currentRotation = useRef({ x: 0.1, y: 0 });
  const pointerPos = useRef({ x: 0, y: 0 });

  // Measurement numerical values (normalized to inches for geometry scaling)
  const toInches = (val, fallback) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return fallback;
    return unit === 'cm' ? num / 2.54 : num;
  };

  const kLength = toInches(measurements.kurtaLength, 40);
  const mChest = toInches(measurements.chest, 42);
  const mWaist = toInches(measurements.waist, 38);
  const mShoulder = toInches(measurements.shoulder, 18);
  const mSleeve = toInches(measurements.sleeveLength, 24);
  const mDaman = toInches(measurements.damanWidth, 23);
  const sLength = toInches(measurements.shalwarLength, 39);
  const sBottom = toInches(measurements.shalwarBottom, 8.5);

  // Color Swatches
  const PRESET_COLORS = [
    { label: 'Royal Emerald', hex: '#1C3A2B' },
    { label: 'Off-White / Cream', hex: '#F4EFE6' },
    { label: 'Pristine Lattha', hex: '#FAF9F6' },
    { label: 'Jet Black', hex: '#18181B' },
    { label: 'Midnight Navy', hex: '#1E293B' },
    { label: 'Kamalia Sand', hex: '#A89F91' },
    { label: 'Heritage Boski', hex: '#EADBBE' }
  ];

  // Set view presets
  const setViewAngle = (view) => {
    setActiveView(view);
    setAutoRotate(false);
    if (view === 'front') {
      targetRotation.current = { x: 0.05, y: 0 };
    } else if (view === 'side') {
      targetRotation.current = { x: 0.05, y: Math.PI / 2 };
    } else if (view === 'back') {
      targetRotation.current = { x: 0.05, y: Math.PI };
    } else if (view === '3/4') {
      targetRotation.current = { x: 0.15, y: Math.PI / 4 };
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6.2);
    cameraRef.current = camera;

    // 3. Renderer with high-DPI and antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xdce7ff, 0.9);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc5a880, 0.8);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // 5. Ground Studio Pedestal & Shadow Disc
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18241d,
      roughness: 0.4,
      metalness: 0.6
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -2.7;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(1.62, 1.75, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc5a880, side: THREE.DoubleSide });
    const goldRing = new THREE.Mesh(ringGeo, ringMat);
    goldRing.rotation.x = -Math.PI / 2;
    goldRing.position.y = -2.63;
    scene.add(goldRing);

    // 6. Master Mannequin Group
    const mannequinGroup = new THREE.Group();
    scene.add(mannequinGroup);
    mannequinGroupRef.current = mannequinGroup;

    // 7. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        targetRotation.current.y += 0.006;
      }

      // Smooth damping interpolation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      if (mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.x = currentRotation.current.x;
        mannequinGroupRef.current.rotation.y = currentRotation.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Pointer / Drag controls for 360 rotation
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    pointerPos.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - pointerPos.current.x;
    const deltaY = clientY - pointerPos.current.y;

    targetRotation.current.y += deltaX * 0.008;
    targetRotation.current.x = Math.max(-0.4, Math.min(0.4, targetRotation.current.x + deltaY * 0.006));

    pointerPos.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Re-build 3D Mannequin & Garment Meshes on parameter changes
  useEffect(() => {
    const mannequinGroup = mannequinGroupRef.current;
    if (!mannequinGroup) return;

    // Clear previous children
    while (mannequinGroup.children.length > 0) {
      const obj = mannequinGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      mannequinGroup.remove(obj);
    }

    // Material definitions
    const fabricMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.65,
      metalness: 0.08,
      bumpScale: 0.02
    });

    const innerLiningMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).clone().multiplyScalar(0.7),
      roughness: 0.8,
      side: THREE.BackSide
    });

    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.35,
      metalness: 0.4
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      roughness: 0.25,
      metalness: 0.85
    });

    const buttonMat = buttons === 'metal' ? goldAccentMat : new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5,
      metalness: 0.1
    });

    // Normalized scale multipliers relative to base (Chest: 42, Waist: 38, Shoulder: 18, KurtaLen: 40)
    const chestScale = mChest / 42;
    const waistScale = mWaist / 38;
    const shoulderScale = mShoulder / 18;
    const damanScale = mDaman / 23;
    const lengthScale = kLength / 40;
    const sleeveScale = mSleeve / 24;
    const shalwarScale = sLength / 39;
    const paichaScale = sBottom / 8.5;

    // 1. Mannequin Stand Pole & Base
    const standPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 16);
    const standPole = new THREE.Mesh(standPoleGeo, mannequinMat);
    standPole.position.y = -1.3;
    mannequinGroup.add(standPole);

    // 2. Mannequin Head / Finial Cap
    const finialCapGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.35, 32);
    const finialCap = new THREE.Mesh(finialCapGeo, goldAccentMat);
    finialCap.position.y = 1.95;
    mannequinGroup.add(finialCap);

    const neckGeo = new THREE.CylinderGeometry(0.26 * shoulderScale, 0.30 * shoulderScale, 0.45, 32);
    const neck = new THREE.Mesh(neckGeo, mannequinMat);
    neck.position.y = 1.65;
    mannequinGroup.add(neck);

    // 3. Kurta Torso Body (Custom Parametric Mesh with smooth tapering)
    // Upper chest width, waist width, daman width, and length
    const kurtaHeight = 2.4 * lengthScale;
    const upperRadius = 0.72 * chestScale;
    const waistRadius = 0.65 * waistScale;
    const damanRadius = 0.82 * damanScale;

    // Use dynamic cylinder with segments to sculpt the Kurta
    const bodyGeo = new THREE.CylinderGeometry(
      upperRadius,
      damanRadius,
      kurtaHeight,
      36,
      16,
      true // open-ended for realistic hem
    );

    // Displace vertices to create chest-to-waist shape and daman hem curve
    const posAttr = bodyGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const normalizedY = (y + kurtaHeight / 2) / kurtaHeight; // 0 (bottom) to 1 (top)

      // Apply waist taper in mid-section
      let currentR = waistRadius;
      if (normalizedY > 0.5) {
        // Upper torso interpolation (waist to chest)
        const t = (normalizedY - 0.5) * 2;
        currentR = THREE.MathUtils.lerp(waistRadius, upperRadius, t);
      } else {
        // Lower torso interpolation (waist to daman)
        const t = (0.5 - normalizedY) * 2;
        currentR = THREE.MathUtils.lerp(waistRadius, damanRadius, t);
      }

      // Slightly flatten Z (chest is broader horizontally than front-to-back)
      posAttr.setZ(i, posAttr.getZ(i) * 0.68);

      // Round Daman curvature at the hem (if daman === 'round')
      if (daman === 'round' && normalizedY < 0.15) {
        const x = posAttr.getX(i);
        const curveOffset = Math.sin((Math.PI * (x + damanRadius)) / (2 * damanRadius)) * 0.12;
        posAttr.setY(i, y + curveOffset);
      }
    }
    bodyGeo.computeVertexNormals();

    const kurtaBody = new THREE.Mesh(bodyGeo, fabricMat);
    kurtaBody.position.y = 0.35 - (kurtaHeight - 2.4) * 0.5;
    kurtaBody.castShadow = true;
    kurtaBody.receiveShadow = true;
    mannequinGroup.add(kurtaBody);

    // Inside lining for realistic thickness
    const kurtaLining = new THREE.Mesh(bodyGeo, innerLiningMat);
    kurtaLining.position.copy(kurtaBody.position);
    mannequinGroup.add(kurtaLining);

    // 4. Shoulder Yoke & Sleeves
    const shoulderSpan = 1.6 * shoulderScale;
    const sleeveLen = 1.7 * sleeveScale;

    // Left Sleeve
    const sleeveGeo = new THREE.CylinderGeometry(0.25 * chestScale, 0.19, sleeveLen, 24);
    sleeveGeo.rotateZ(Math.PI / 12);
    const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
    leftSleeve.position.set(-0.88 * shoulderScale, 0.65 - sleeveLen * 0.45, 0);
    leftSleeve.rotation.z = 0.22;
    leftSleeve.castShadow = true;
    mannequinGroup.add(leftSleeve);

    // Right Sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
    rightSleeve.position.set(0.88 * shoulderScale, 0.65 - sleeveLen * 0.45, 0);
    rightSleeve.rotation.z = -0.22;
    rightSleeve.castShadow = true;
    mannequinGroup.add(rightSleeve);

    // 5. Cuffs (If cuff option is selected)
    if (sleeves === 'cuff') {
      const cuffGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.22, 24);
      
      const leftCuff = new THREE.Mesh(cuffGeo, fabricMat);
      leftCuff.position.set(-1.08 * shoulderScale, 0.65 - sleeveLen * 0.95, 0);
      leftCuff.rotation.z = 0.22;
      mannequinGroup.add(leftCuff);

      const rightCuff = new THREE.Mesh(cuffGeo, fabricMat);
      rightCuff.position.set(1.08 * shoulderScale, 0.65 - sleeveLen * 0.95, 0);
      rightCuff.rotation.z = -0.22;
      mannequinGroup.add(rightCuff);

      // Cuff buttons
      const cuffBtnGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
      cuffBtnGeo.rotateX(Math.PI / 2);
      const leftCuffBtn = new THREE.Mesh(cuffBtnGeo, buttonMat);
      leftCuffBtn.position.set(-1.08 * shoulderScale, 0.65 - sleeveLen * 0.95, 0.21);
      mannequinGroup.add(leftCuffBtn);

      const rightCuffBtn = new THREE.Mesh(cuffBtnGeo, buttonMat);
      rightCuffBtn.position.set(1.08 * shoulderScale, 0.65 - sleeveLen * 0.95, 0.21);
      mannequinGroup.add(rightCuffBtn);
    }

    // 6. Collar / Ban Styles
    if (collar === 'sherwani') {
      // Stand-up Mandarin / Sherwani ban band
      const banGeo = new THREE.CylinderGeometry(0.33 * shoulderScale, 0.35 * shoulderScale, 0.28, 32, 1, true);
      const ban = new THREE.Mesh(banGeo, fabricMat);
      ban.position.y = 1.55;
      mannequinGroup.add(ban);
    } else if (collar === 'shirt') {
      // Folded spread shirt collar
      const collarBandGeo = new THREE.CylinderGeometry(0.33 * shoulderScale, 0.35 * shoulderScale, 0.22, 32, 1, true);
      const collarBand = new THREE.Mesh(collarBandGeo, fabricMat);
      collarBand.position.y = 1.52;
      mannequinGroup.add(collarBand);

      // Left collar point
      const flapGeo = new THREE.BoxGeometry(0.26, 0.18, 0.04);
      const leftFlap = new THREE.Mesh(flapGeo, fabricMat);
      leftFlap.position.set(-0.18, 1.42, 0.32);
      leftFlap.rotation.set(-0.3, 0.4, -0.35);
      mannequinGroup.add(leftFlap);

      // Right collar point
      const rightFlap = new THREE.Mesh(flapGeo, fabricMat);
      rightFlap.position.set(0.18, 1.42, 0.32);
      rightFlap.rotation.set(-0.3, -0.4, 0.35);
      mannequinGroup.add(rightFlap);
    } else {
      // Mandarin (Soft Round Ban)
      const softBanGeo = new THREE.TorusGeometry(0.34 * shoulderScale, 0.05, 16, 32);
      softBanGeo.rotateX(Math.PI / 2);
      const softBan = new THREE.Mesh(softBanGeo, fabricMat);
      softBan.position.y = 1.50;
      mannequinGroup.add(softBan);
    }

    // 7. Center Front Placket (Patti) & Buttons
    const pattiHeight = 1.1;
    const pattiGeo = new THREE.BoxGeometry(0.12, pattiHeight, 0.02);
    const patti = new THREE.Mesh(pattiGeo, fabricMat);
    patti.position.set(0, 1.0, upperRadius * 0.69 + 0.01);
    mannequinGroup.add(patti);

    // Front Placket Buttons
    const numButtons = 4;
    const btnGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.025, 16);
    btnGeo.rotateX(Math.PI / 2);

    for (let b = 0; b < numButtons; b++) {
      const btn = new THREE.Mesh(btnGeo, buttonMat);
      const btnY = 1.38 - b * (pattiHeight / (numButtons + 0.2));
      btn.position.set(0, btnY, upperRadius * 0.69 + 0.025);
      mannequinGroup.add(btn);
    }

    // 8. Lower Shalwar / Trousers (Matching Traditional Bottom)
    const legLength = 1.4 * shalwarScale;
    const paichaRadius = 0.18 * paichaScale;
    const shalwarLegGeo = new THREE.CylinderGeometry(0.38 * waistScale, paichaRadius, legLength, 24);

    // Left Leg
    const leftLeg = new THREE.Mesh(shalwarLegGeo, fabricMat);
    leftLeg.position.set(-0.28, -0.95 - (kurtaHeight - 2.4) * 0.4 - legLength * 0.45, 0);
    leftLeg.castShadow = true;
    mannequinGroup.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(shalwarLegGeo, fabricMat);
    rightLeg.position.set(0.28, -0.95 - (kurtaHeight - 2.4) * 0.4 - legLength * 0.45, 0);
    rightLeg.castShadow = true;
    mannequinGroup.add(rightLeg);

  }, [kLength, mChest, mWaist, mShoulder, mSleeve, mDaman, sLength, sBottom, collar, neckline, sleeves, daman, buttons, color]);

  return (
    <div className="relative flex flex-col rounded-3xl border-2 border-[#1C3A2B]/15 bg-gradient-to-b from-[#FBFBF9] via-[#F5F2EB] to-[#ECE7DE] p-5 shadow-xl overflow-hidden">
      {/* Top Header Badge & Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-serif text-sm font-bold tracking-wide text-[#1C3A2B]">
            3D Interactive Tailoring Mannequin
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              autoRotate
                ? 'bg-[#1C3A2B] text-white shadow-sm'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-300'
            }`}
            title="Toggle 360 Turntable Auto-Rotation"
          >
            <RotateCw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>360° Auto</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        className="relative h-[420px] w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div ref={containerRef} className="h-full w-full" />

        {/* Live Measurement HUD Badges on 3D Model */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="rounded-xl bg-black/75 backdrop-blur-md px-3 py-1.5 text-white shadow-lg border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#C5A880]">Live Fit Specs</p>
            <p className="text-xs font-bold leading-tight">
              Length: <span className="text-emerald-400">{measurements.kurtaLength || 40} {unit}</span>
            </p>
            <p className="text-xs font-bold leading-tight">
              Chest: <span className="text-emerald-400">{measurements.chest || 42} {unit}</span>
            </p>
            <p className="text-xs font-bold leading-tight">
              Shoulder: <span className="text-emerald-400">{measurements.shoulder || 18} {unit}</span>
            </p>
            <p className="text-xs font-bold leading-tight">
              Daman: <span className="text-emerald-400">{measurements.damanWidth || 23} {unit}</span>
            </p>
          </div>
        </div>

        {/* Style Tag Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none">
          <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 uppercase">
            {collar === 'sherwani' ? 'Sherwani Ban' : collar === 'shirt' ? 'Shirt Collar' : 'Mandarin Ban'}
          </span>
          <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 uppercase">
            {sleeves === 'cuff' ? 'French Cuffs' : 'Straight Bazu'}
          </span>
          <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 uppercase">
            {daman === 'round' ? 'Gol Daman' : 'Chakor Daman'}
          </span>
        </div>

        {/* Quick Angle Camera Controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 shadow-xl border border-white/10">
          {[
            { id: 'front', label: 'Front' },
            { id: '3/4', label: '3/4 View' },
            { id: 'side', label: 'Side' },
            { id: 'back', label: 'Back' }
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setViewAngle(view.id)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase transition ${
                activeView === view.id
                  ? 'bg-[#C5A880] text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric Color Swatches for 3D Model */}
      <div className="mt-3 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            3D Fabric Tone
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Drag 3D model to inspect drape</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onColorChange && onColorChange(c.hex)}
              className={`group relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition shadow-sm hover:scale-110 ${
                color.toLowerCase() === c.hex.toLowerCase()
                  ? 'border-[#1C3A2B] ring-2 ring-[#C5A880] scale-110'
                  : 'border-slate-300'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            >
              {color.toLowerCase() === c.hex.toLowerCase() && (
                <Check className={`h-3.5 w-3.5 ${c.hex === '#FAF9F6' || c.hex === '#F4EFE6' || c.hex === '#EADBBE' ? 'text-slate-900' : 'text-white'}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
