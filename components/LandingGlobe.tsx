"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// -----------------------
// Constants
// -----------------------
const POINT_COUNT = 1000;
const RADIUS = 5.65;

// -----------------------
// Camera Component
// -----------------------
const ZoomOutCamera: React.FC = () => {
  const { camera } = useThree();
  const targetZ = 10;

  useEffect(() => {
    camera.position.set(0, 0, targetZ);
  }, [camera]);

  return null;
};

// -----------------------
// Globe Points Component
// -----------------------
const GlobePoints: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, pointer } = useThree();

  // Target + live positions are the same from the start
  const targetPositions = useMemo(() => {
    const arr = new Float32Array(POINT_COUNT * 3);
    for (let i = 0; i < POINT_COUNT; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = RADIUS * Math.cos(phi);
      const j = i * 3;
      arr[j] = x;
      arr[j + 1] = y;
      arr[j + 2] = z;
    }
    return arr;
  }, []);

  const livePositionsRef = useRef<Float32Array>(new Float32Array(targetPositions));
  const originalPositionsRef = useRef<Float32Array>(new Float32Array(targetPositions));

  const colors = useMemo(() => {
    const arr = new Float32Array(POINT_COUNT * 3);
    const c0 = new THREE.Color("#FFFFFF");
    const c1 = new THREE.Color("#BBBBBB");
    for (let i = 0; i < POINT_COUNT; i++) {
      const y = targetPositions[i * 3 + 1];
      const tRaw = (y + RADIUS) / (2 * RADIUS);
      const t = 0.5 - 0.5 * Math.cos(tRaw * Math.PI);
      c0.clone().lerp(c1, t).toArray(arr, i * 3);
    }
    return arr;
  }, [targetPositions]);

  const linePositions = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const ix = i * 3;
      for (let j = i + 1; j < POINT_COUNT; j++) {
        const jx = j * 3;
        const dx = targetPositions[ix] - targetPositions[jx];
        const dy = targetPositions[ix + 1] - targetPositions[jx + 1];
        const dz = targetPositions[ix + 2] - targetPositions[jx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.6) {
          out.push(
            targetPositions[ix],
            targetPositions[ix + 1],
            targetPositions[ix + 2],
            targetPositions[jx],
            targetPositions[jx + 1],
            targetPositions[jx + 2]
          );
        }
      }
    }
    return new Float32Array(out);
  }, [targetPositions]);

  const pointsGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(livePositionsRef.current, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [colors]);

  const linesGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const sphereWorld = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), RADIUS), []);
  const worldHit = useMemo(() => new THREE.Vector3(), []);
  const localHit = useMemo(() => new THREE.Vector3(), []);
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const origVec = useMemo(() => new THREE.Vector3(), []);
  const dirVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const group = groupRef.current;
    const pts = pointsRef.current;
    if (!group || !pts) return;

    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;

    raycaster.setFromCamera(pointer, camera);
    const hasHit = raycaster.ray.intersectSphere(sphereWorld, worldHit);
    if (hasHit) {
      localHit.copy(worldHit);
      group.worldToLocal(localHit);
    }

    const repelRadius = 1.5;
    const repelForce = 0.18;
    const smoothing = 0.09;

    for (let i = 0; i < livePositionsRef.current.length; i += 3) {
      posVec.set(
        livePositionsRef.current[i],
        livePositionsRef.current[i + 1],
        livePositionsRef.current[i + 2]
      );
      origVec.set(
        originalPositionsRef.current[i],
        originalPositionsRef.current[i + 1],
        originalPositionsRef.current[i + 2]
      );

      if (hasHit) {
        const dist = posVec.distanceTo(localHit);
        if (dist < repelRadius) {
          dirVec.copy(posVec).sub(localHit).normalize();
          const push = ((repelRadius - dist) / repelRadius) ** 2 * repelForce;
          posVec.addScaledVector(dirVec, push);
        } else {
          posVec.lerp(origVec, smoothing);
        }
      } else {
        posVec.lerp(origVec, smoothing);
      }

      livePositionsRef.current[i] = posVec.x;
      livePositionsRef.current[i + 1] = posVec.y;
      livePositionsRef.current[i + 2] = posVec.z;
    }

    posAttr.array.set(livePositionsRef.current);
    posAttr.needsUpdate = true;

    group.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          vertexColors
          size={0.04}
          sizeAttenuation
          opacity={0.8}
          transparent
        />
      </points>
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.05} />
      </lineSegments>
    </group>
  );
};

// -----------------------
// Main Exported Component
// -----------------------
const LandingGlobe: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight />
      <ZoomOutCamera />
      <GlobePoints />
    </Canvas>
  );
};

export default LandingGlobe;
