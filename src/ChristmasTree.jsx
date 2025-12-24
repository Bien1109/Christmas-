import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Effects } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function SnowStickOnTree() {
  const group = useRef();

  useEffect(() => {
    group.current.children.forEach(mesh => {
      mesh.material = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.8
      });
    });
  }, []);

  return (
    <group ref={group}>
      {[2, 1.4, 0.8].map((size, i) => (
        <mesh key={i} position={[0, i * 0.6 - 0.2 + 0.2, 0]}>
          <coneGeometry args={[size * 0.9, 0.1, 16]} />
        </mesh>
      ))}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.1, 16]} />
      </mesh>
    </group>
  );
}

function Snow() {
  const ref = useRef();
  const count = 650;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 10;
    return arr;
  }, []);

  useFrame((state) => {
    const { clock } = state;
    const pos = ref.current.array;

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] += Math.sin(clock.elapsedTime + i) * 0.002;
      pos[i + 2] += Math.cos(clock.elapsedTime + i) * 0.002;
      pos[i + 1] -= 0.02;
      if (pos[i + 1] < -3) pos[i + 1] = 6;
    }

    ref.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={ref}
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="white" />
    </points>
  );
}

function InsideGift() {
  return (
    <mesh position={[0, 0.15, 0]}>
      <icosahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial emissive="gold" emissiveIntensity={2} />
    </mesh>
  );
}

function Gift({ position, color }) {
  const [open, setOpen] = useState(false);
  const lidRef = useRef();

  useFrame(() => {
    if (open && lidRef.current.rotation.x > -1.2)
      lidRef.current.rotation.x -= 0.03;
  });

  return (
    <group
      position={position}
      onClick={() => setOpen(true)}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={lidRef} position={[0, 0.28, 0]}>
        <boxGeometry args={[0.62, 0.12, 0.62]} />
        <meshStandardMaterial color="gold" />
      </mesh>

      {open && <InsideGift />}
    </group>
  );
}

function Tree() {
  const ref = useRef();
  const colors = ["red", "yellow", "blue", "green", "orange"];

  useFrame(() => {
    ref.current.rotation.y += 0.003;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, -1, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 1, 16]} />
        <meshStandardMaterial color="#5c3b1e" />
      </mesh>

      {[2, 1.4, 0.8].map((size, i) => (
        <mesh key={i} position={[0, i * 0.6 - 0.2, 0]}>
          <coneGeometry args={[size, 1.2, 16]} />
          <meshStandardMaterial color="#0f8a2d" />
        </mesh>
      ))}

      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const color = colors[Math.floor((Date.now() / 300 + i) % 5)];
        return (
          <mesh key={i} position={[Math.cos(angle), 0.4 + Math.sin(i) * 1, Math.sin(angle)]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={2} />
            <pointLight color={color} intensity={1.5} distance={2} />
          </mesh>
        );
      })}

      <mesh position={[0, 2.4, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial emissive="gold" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

export default function ChristmasTree() {
  const [audio] = useState(() => new Audio("/christmas.mp3"));
  const [playing, setPlaying] = useState(false);

  const toggleMusic = () => {
    if (!playing) audio.play();
    else audio.pause();
    setPlaying(!playing);
  };

  return (
    <>
      <button
        onClick={toggleMusic}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          padding: 10,
          borderRadius: 10,
          border: "none",
          background: "gold",
          fontWeight: "bold"
        }}
      >
        {playing ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>

      <Canvas
        shadows
        camera={{ position: [0, 2, 4], fov: 60 }}
        style={{ width: "100vw", height: "100vh", background: "#00111f" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.3}
          castShadow
        />

       <EffectComposer>
  <Bloom
    intensity={1.2}
    luminanceThreshold={0.2}
    luminanceSmoothing={0.9}
  />
</EffectComposer>


        <Stars count={4000} />
        <SnowStickOnTree />
        <Snow />
        <Tree />

        <Gift position={[1, -1.1, 0.5]} color="red" />
        <Gift position={[-1, -1.1, -0.3]} color="blue" />
        <Gift position={[0.6, -1.1, -0.8]} color="purple" />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </>
  );
}
