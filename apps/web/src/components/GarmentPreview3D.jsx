import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Check, Sparkles } from 'lucide-react';

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
  const [activeView, setActiveView] = useState('front');
  const [isDragging, setIsDragging] = useState(false);

  const targetRotation = useRef({ x: 0.04, y: 0 });
  const currentRotation = useRef({ x: 0.04, y: 0 });
  const pointerPos = useRef({ x: 0, y: 0 });

  // Measurement normalization
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

  const PRESET_COLORS = [
    { label: 'Royal Green', hex: '#1C3A2B' },
    { label: 'Off-White', hex: '#F4EFE6' },
    { label: 'Lattha White', hex: '#FAF9F6' },
    { label: 'Jet Black', hex: '#18181B' },
    { label: 'Navy Blue', hex: '#1E293B' },
    { label: 'Khaddar Brown', hex: '#8C7A6B' },
    { label: 'Pure Boski', hex: '#EADBBE' }
  ];

  const setViewAngle = (view) => {
    setActiveView(view);
    setAutoRotate(false);
    if (view === 'front') targetRotation.current = { x: 0.04, y: 0 };
    else if (view === 'side') targetRotation.current = { x: 0.04, y: Math.PI / 2 };
    else if (view === 'back') targetRotation.current = { x: 0.04, y: Math.PI };
    else if (view === '3/4') targetRotation.current = { x: 0.08, y: Math.PI / 4 };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Realistic Atelier Lighting
    const ambientLight = new THREE.AmbientLight(0xfffcf5, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbe8ff, 0.9);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe8cf, 1.0);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Warm floor shadow disc
    const shadowGeo = new THREE.CircleGeometry(1.4, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.14
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.55;
    scene.add(shadowMesh);

    // Master Group
    const mannequinGroup = new THREE.Group();
    scene.add(mannequinGroup);
    mannequinGroupRef.current = mannequinGroup;

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        targetRotation.current.y += 0.004;
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      if (mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.x = currentRotation.current.x;
        mannequinGroupRef.current.rotation.y = currentRotation.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

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

  // Pointer drag for smooth 360 degree inspection
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

    targetRotation.current.y += deltaX * 0.007;
    targetRotation.current.x = Math.max(-0.25, Math.min(0.25, targetRotation.current.x + deltaY * 0.005));

    pointerPos.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Re-build 3D Mannequin & Realistic Garment
  useEffect(() => {
    const mannequinGroup = mannequinGroupRef.current;
    if (!mannequinGroup) return;

    while (mannequinGroup.children.length > 0) {
      const obj = mannequinGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      mannequinGroup.remove(obj);
    }

    // High quality bespoke materials
    const fabricColor = new THREE.Color(color);
    const fabricMat = new THREE.MeshStandardMaterial({
      color: fabricColor,
      roughness: 0.76,
      metalness: 0.05
    });

    const fabricBackMat = new THREE.MeshStandardMaterial({
      color: fabricColor.clone().multiplyScalar(0.72),
      roughness: 0.85,
      side: THREE.BackSide
    });

    const walnutWoodMat = new THREE.MeshStandardMaterial({
      color: 0x2b1810,
      roughness: 0.4,
      metalness: 0.1
    });

    const polishedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.88
    });

    const buttonMat = buttons === 'metal' ? polishedBrassMat : new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.5,
      metalness: 0.05
    });

    // Scaling factors based on customer measurements
    const chestScale = THREE.MathUtils.clamp(mChest / 42, 0.88, 1.2);
    const waistScale = THREE.MathUtils.clamp(mWaist / 38, 0.88, 1.2);
    const shoulderScale = THREE.MathUtils.clamp(mShoulder / 18, 0.88, 1.15);
    const damanScale = THREE.MathUtils.clamp(mDaman / 23, 0.88, 1.2);
    const lengthScale = THREE.MathUtils.clamp(kLength / 40, 0.9, 1.18);
    const shalwarScale = THREE.MathUtils.clamp(sLength / 39, 0.9, 1.18);

    // 1. Bespoke Atelier Stand (Turned Mahogany & Brushed Brass)
    const baseGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.1, 36);
    const baseMesh = new THREE.Mesh(baseGeo, walnutWoodMat);
    baseMesh.position.y = -2.5;
    mannequinGroup.add(baseMesh);

    const brassCollarGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.08, 24);
    const brassCollar = new THREE.Mesh(brassCollarGeo, polishedBrassMat);
    brassCollar.position.y = -2.42;
    mannequinGroup.add(brassCollar);

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.3, 20);
    const pole = new THREE.Mesh(poleGeo, walnutWoodMat);
    pole.position.y = -1.25;
    mannequinGroup.add(pole);

    // 2. Tailor's Dress Form Finial & Neck (Savile Row Crown)
    const finialCrownGeo = new THREE.CylinderGeometry(0.2, 0.23, 0.14, 32);
    const finialCrown = new THREE.Mesh(finialCrownGeo, polishedBrassMat);
    finialCrown.position.y = 1.76;
    mannequinGroup.add(finialCrown);

    const finialKnobGeo = new THREE.SphereGeometry(0.1, 24, 24);
    const finialKnob = new THREE.Mesh(finialKnobGeo, walnutWoodMat);
    finialKnob.position.y = 1.88;
    mannequinGroup.add(finialKnob);

    // Mannequin Inner Neck
    const innerNeckGeo = new THREE.CylinderGeometry(0.24 * shoulderScale, 0.28 * shoulderScale, 0.32, 32);
    const innerNeck = new THREE.Mesh(innerNeckGeo, walnutWoodMat);
    innerNeck.position.y = 1.58;
    mannequinGroup.add(innerNeck);

    // 3. Tailored Kurta Torso with smooth natural shoulder contours
    const kurtaHeight = 2.35 * lengthScale;
    const chestR = 0.65 * chestScale;
    const waistR = 0.58 * waistScale;
    const damanR = 0.74 * damanScale;

    const bodySegments = 40;
    const bodyHeightSegments = 28;
    const bodyGeo = new THREE.CylinderGeometry(
      chestR * 0.92, // top neck opening
      damanR,        // bottom hem
      kurtaHeight,
      bodySegments,
      bodyHeightSegments,
      true
    );

    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const normY = (y + kurtaHeight / 2) / kurtaHeight; // 0 = bottom hem, 1 = top

      let radiusMultiplier = 1.0;
      if (normY > 0.68) {
        // Shoulder to Chest taper
        const t = (normY - 0.68) / 0.32;
        radiusMultiplier = THREE.MathUtils.lerp(chestR, chestR * 0.92, t) / chestR;
      } else if (normY > 0.38) {
        // Chest to Waist
        const t = (normY - 0.38) / 0.30;
        radiusMultiplier = THREE.MathUtils.lerp(waistR, chestR, t) / chestR;
      } else {
        // Waist to Daman flare
        const t = normY / 0.38;
        radiusMultiplier = THREE.MathUtils.lerp(damanR, waistR, t) / chestR;
      }

      pos.setX(i, pos.getX(i) * radiusMultiplier);

      // Anatomical depth flattening: chest is wider across than deep
      pos.setZ(i, pos.getZ(i) * radiusMultiplier * 0.64);

      // Natural Round Daman (Gool Daman) curve
      if (daman === 'round' && normY < 0.12) {
        const xVal = pos.getX(i);
        const curveArc = (1 - (xVal * xVal) / (damanR * damanR)) * 0.13;
        pos.setY(i, y + Math.max(0, curveArc));
      }
    }
    bodyGeo.computeVertexNormals();

    const kurtaBody = new THREE.Mesh(bodyGeo, fabricMat);
    kurtaBody.position.y = 0.38 - (kurtaHeight - 2.35) * 0.45;
    kurtaBody.castShadow = true;
    kurtaBody.receiveShadow = true;
    mannequinGroup.add(kurtaBody);

    const kurtaInside = new THREE.Mesh(bodyGeo, fabricBackMat);
    kurtaInside.position.copy(kurtaBody.position);
    mannequinGroup.add(kurtaInside);

    // 4. Atelier Sartorial Shoulder Caps (Classic Bespoke Tailor Finish)
    const capGeo = new THREE.SphereGeometry(0.24, 24, 16);
    capGeo.scale(1, 0.45, 0.7);

    const leftCap = new THREE.Mesh(capGeo, walnutWoodMat);
    leftCap.position.set(-0.74 * shoulderScale, 1.34, 0);
    mannequinGroup.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, walnutWoodMat);
    rightCap.position.set(0.74 * shoulderScale, 1.34, 0);
    mannequinGroup.add(rightCap);

    // 5. Natural Draping Sleeves (Resting naturally downwards along sides)
    const sleeveLen = 1.55;
    const sleeveGeo = new THREE.CylinderGeometry(0.2, 0.15, sleeveLen, 24);

    const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
    leftSleeve.position.set(-0.76 * shoulderScale, 1.25 - sleeveLen / 2, 0);
    leftSleeve.rotation.z = 0.05;
    leftSleeve.castShadow = true;
    mannequinGroup.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
    rightSleeve.position.set(0.76 * shoulderScale, 1.25 - sleeveLen / 2, 0);
    rightSleeve.rotation.z = -0.05;
    rightSleeve.castShadow = true;
    mannequinGroup.add(rightSleeve);

    // 6. Cuffs (If Cuff option chosen)
    if (sleeves === 'cuff') {
      const cuffGeo = new THREE.CylinderGeometry(0.165, 0.165, 0.16, 24);

      const leftCuff = new THREE.Mesh(cuffGeo, fabricMat);
      leftCuff.position.set(-0.77 * shoulderScale, 1.25 - sleeveLen + 0.08, 0);
      mannequinGroup.add(leftCuff);

      const rightCuff = new THREE.Mesh(cuffGeo, fabricMat);
      rightCuff.position.set(0.77 * shoulderScale, 1.25 - sleeveLen + 0.08, 0);
      mannequinGroup.add(rightCuff);

      // Small Cuff Buttons
      const cuffBtnGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16);
      cuffBtnGeo.rotateX(Math.PI / 2);

      const leftBtn = new THREE.Mesh(cuffBtnGeo, buttonMat);
      leftBtn.position.set(-0.77 * shoulderScale, 1.25 - sleeveLen + 0.08, 0.17);
      mannequinGroup.add(leftBtn);

      const rightBtn = new THREE.Mesh(cuffBtnGeo, buttonMat);
      rightBtn.position.set(0.77 * shoulderScale, 1.25 - sleeveLen + 0.08, 0.17);
      mannequinGroup.add(rightBtn);
    }

    // 7. Ban / Collar
    if (collar === 'sherwani') {
      const banGeo = new THREE.CylinderGeometry(0.28 * shoulderScale, 0.30 * shoulderScale, 0.22, 32, 1, true);
      const ban = new THREE.Mesh(banGeo, fabricMat);
      ban.position.y = 1.50;
      mannequinGroup.add(ban);
    } else if (collar === 'shirt') {
      const bandGeo = new THREE.CylinderGeometry(0.28 * shoulderScale, 0.30 * shoulderScale, 0.16, 32, 1, true);
      const band = new THREE.Mesh(bandGeo, fabricMat);
      band.position.y = 1.48;
      mannequinGroup.add(band);

      // Folded Collar Wings
      const leafGeo = new THREE.BoxGeometry(0.2, 0.12, 0.025);
      const leftLeaf = new THREE.Mesh(leafGeo, fabricMat);
      leftLeaf.position.set(-0.14, 1.40, 0.26);
      leftLeaf.rotation.set(-0.25, 0.35, -0.3);
      mannequinGroup.add(leftLeaf);

      const rightLeaf = new THREE.Mesh(leafGeo, fabricMat);
      rightLeaf.position.set(0.14, 1.40, 0.26);
      rightLeaf.rotation.set(-0.25, -0.35, 0.3);
      mannequinGroup.add(rightLeaf);
    } else {
      // Soft Mandarin Round Ban
      const roundBanGeo = new THREE.TorusGeometry(0.29 * shoulderScale, 0.04, 16, 32);
      roundBanGeo.rotateX(Math.PI / 2);
      const roundBan = new THREE.Mesh(roundBanGeo, fabricMat);
      roundBan.position.y = 1.48;
      mannequinGroup.add(roundBan);
    }

    // 8. Stitched Front Patti (Placket) & Luxury Buttons
    const pattiLen = 0.98;
    const pattiGeo = new THREE.BoxGeometry(0.08, pattiLen, 0.015);
    const patti = new THREE.Mesh(pattiGeo, fabricMat);
    patti.position.set(0, 1.02, (chestR * 0.64) + 0.01);
    mannequinGroup.add(patti);

    // Front Buttons
    const btnGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 16);
    btnGeo.rotateX(Math.PI / 2);

    for (let b = 0; b < 4; b++) {
      const btn = new THREE.Mesh(btnGeo, buttonMat);
      const btnY = 1.36 - b * (pattiLen / 4.1);
      btn.position.set(0, btnY, (chestR * 0.64) + 0.022);
      mannequinGroup.add(btn);
    }

    // 9. Lower Shalwar (Matching Fall)
    const legLen = 1.25 * shalwarScale;
    const legGeo = new THREE.CylinderGeometry(0.29 * waistScale, 0.15, legLen, 24);

    const leftLeg = new THREE.Mesh(legGeo, fabricMat);
    leftLeg.position.set(-0.22, -0.85 - (kurtaHeight - 2.35) * 0.4 - legLen * 0.45, 0);
    leftLeg.castShadow = true;
    mannequinGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, fabricMat);
    rightLeg.position.set(0.22, -0.85 - (kurtaHeight - 2.35) * 0.4 - legLen * 0.45, 0);
    rightLeg.castShadow = true;
    mannequinGroup.add(rightLeg);

  }, [kLength, mChest, mWaist, mShoulder, mSleeve, mDaman, sLength, collar, neckline, sleeves, daman, buttons, color]);

  return (
    <div className="relative flex flex-col rounded-3xl border border-slate-200/90 bg-gradient-to-b from-[#FCFBF8] via-[#F7F4EE] to-[#EFEBE3] p-4 sm:p-5 shadow-lg overflow-hidden">
      {/* Header Bar with Simple, Natural Wording */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <p className="font-serif text-sm font-bold tracking-wide text-[#1C3A2B]">
            3D Suit Silai Preview
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
            autoRotate
              ? 'bg-[#1C3A2B] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
          title="360 Ghumayein"
        >
          <RotateCw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>360° View</span>
        </button>
      </div>

      {/* 3D Viewport */}
      <div
        className="relative h-[430px] w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div ref={containerRef} className="h-full w-full" />

        {/* Simple & Clean Measurement Box in Plain Urdu/English */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          <div className="rounded-2xl bg-black/80 backdrop-blur-md px-3.5 py-2 text-white shadow-xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#C5A880]">Aapka Naap (Measurements)</p>
            <div className="mt-1 space-y-0.5 text-xs font-medium">
              <p>Lambai: <span className="font-bold text-emerald-400">{measurements.kurtaLength || 40} {unit}</span></p>
              <p>Chhati: <span className="font-bold text-emerald-400">{measurements.chest || 42} {unit}</span></p>
              <p>Teera: <span className="font-bold text-emerald-400">{measurements.shoulder || 18} {unit}</span></p>
              <p>Ghera: <span className="font-bold text-emerald-400">{measurements.damanWidth || 23} {unit}</span></p>
            </div>
          </div>
        </div>

        {/* Selected Styles Tags */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 pointer-events-none">
          <span className="rounded-xl bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200">
            {collar === 'sherwani' ? 'Sherwani Ban' : collar === 'shirt' ? 'Shirt Collar' : 'Gool Ban'}
          </span>
          <span className="rounded-xl bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200">
            {sleeves === 'cuff' ? 'Kaf Bazu' : 'Seedha Bazu'}
          </span>
          <span className="rounded-xl bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200">
            {daman === 'round' ? 'Gool Daman' : 'Chakor Daman'}
          </span>
        </div>

        {/* View Angle Switcher */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 shadow-xl border border-white/10">
          {[
            { id: 'front', label: 'Saamne (Front)' },
            { id: '3/4', label: 'Angle View' },
            { id: 'side', label: 'Side' },
            { id: 'back', label: 'Peechay (Back)' }
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setViewAngle(view.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                activeView === view.id
                  ? 'bg-[#C5A880] text-slate-900 shadow'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric Color Picker */}
      <div className="mt-3 pt-3 border-t border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-700">
            Suit Ka Rang (Fabric Color)
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Touch kar ke 360° ghumayein</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onColorChange && onColorChange(c.hex)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition shadow-sm hover:scale-105 ${
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
