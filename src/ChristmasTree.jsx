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

function Decorations() {
  const decorations = [];

  // 3 tầng trang trí
  const layers = [
    { y: 0.3, r: 1.2, count: 10 },
    { y: 0.9, r: 0.9, count: 8 },
    { y: 1.5, r: 0.6, count: 6 },
  ];

  const colors = ["#ff4d4d", "#ffd700", "#00ccff", "#ff66ff", "#00ff88"];

  layers.forEach((layer, idx) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2;
      const x = Math.cos(angle) * layer.r * 0.6;
      const z = Math.sin(angle) * layer.r * 0.6;
      const color = colors[(i + idx) % colors.length];

      decorations.push(
        <group key={`${idx}-${i}`} position={[x, layer.y, z]}>
          {/* bóng trang trí */}
          <mesh>
            <sphereGeometry args={[0.1, 24, 24]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={1.5} />
          </mesh>

          {/* ánh sáng phát từ bóng */}
          <pointLight color={color} intensity={1.8} distance={2} decay={2} />
        </group>
      );
    }
  });

  // garland (vòng dây quấn cây)
  decorations.push(
    <mesh rotation={[0, 0, 0]} position={[0, 0.8, 0]}>
      <torusGeometry args={[1, 0.03, 16, 100]} />
      <meshStandardMaterial color="#FFD700" emissive="#ffaa00" emissiveIntensity={0.8}/>
    </mesh>
  );

  decorations.push(
    <mesh rotation={[0, 0.6, 0]} position={[0, 0.2, 0]}>
      <torusGeometry args={[1.2, 0.03, 16, 100]} />
      <meshStandardMaterial color="#ff3333" emissive="#ff4444" emissiveIntensity={0.6}/>
    </mesh>
  );

  return <group>{decorations}</group>;
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
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/christmas.mp3");
    audioRef.current.loop = true;
    audioRef.current.preload = "auto";
  }, []);

  const toggleMusic = async () => {
    try {
      if (!playing) {
        await audioRef.current.play();

        // Fix Android WebAudio policy
        if (typeof window.AudioContext !== "undefined") {
          const ctx = new AudioContext();
          if (ctx.state === "suspended") await ctx.resume();
        }
      } else {
        audioRef.current.pause();
      }
      setPlaying(!playing);
    } catch (e) {
      console.log("Audio blocked", e);
    }
  };

  return (
    <>
      {/* Nút bật nhạc to rõ cho mobile */}
      <button
        onClick={toggleMusic}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: playing
            ? "linear-gradient(45deg,#ff4d4d,#ffcc00)"
            : "linear-gradient(45deg,#00ffaa,#00ccff)",
          color: "#000",
          fontWeight: "bold",
          fontSize: 16
        }}
      >
        {playing ? "🔇 Tắt nhạc" : "🎵 Bật nhạc"}
      </button>

      <Canvas
        shadows
        camera={{ position: [0, 2, 4], fov: 60 }}
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(circle at top, #003366, #000814 70%)"
        }}
      >
        {/* ánh sáng ấm hơn + lung linh */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.4}
          castShadow
        />

        {/* Làm nền mặt đất */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#1b3a4b" />
        </mesh>

        {/* sương cho nền Noel */}
        <fog args={["#000920", 4, 12]} />

        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        <Stars count={4000} />

        <Decorations />
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

