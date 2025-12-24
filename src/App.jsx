import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Image, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';


// --- Component: Một tầng lá cây ---
const TreeLayer = ({ position, scale, color }) => (
  <mesh position={position} scale={scale} castShadow receiveShadow>
    <coneGeometry args={[1, 1.5, 16]} />
    <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} flatShading />
  </mesh>
);

// --- Component: HỘP QUÀ TƯƠNG TÁC ---
const GiftBox = ({ position, color, imageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const lidRef = useRef();
  const imageRef = useRef();
  const groupRef = useRef();

  // Hiệu ứng di chuột vào
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    // 1. Animation mở nắp: Xoay trục X
    const targetRotation = isOpen ? -Math.PI / 1.8 : 0; // Mở 100 độ hoặc đóng
    if (lidRef.current) {
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 5);
    }

    // 2. Animation ảnh: Trồi lên và scale to ra
    const targetY = isOpen ? 1.2 : 0.4;
    const targetScale = isOpen ? 1 : 0;
    if (imageRef.current) {
      imageRef.current.position.y = THREE.MathUtils.lerp(imageRef.current.position.y, targetY, delta * 5);
      // imageRef.current.scale.setScalar(THREE.MathUtils.lerp(imageRef.current.scale.x, targetScale, delta * 5)); 
      // (Lưu ý: Component Image của drei xử lý scale hơi khác nên ta chỉ cần chỉnh vị trí là đẹp)
    }
    
    // 3. Hiệu ứng nhún nhảy khi hover chuột
    if (groupRef.current && !isOpen) {
        groupRef.current.position.y = THREE.MathUtils.lerp(
            groupRef.current.position.y, 
            position[1] + (hovered ? 0.2 : 0), 
            delta * 10
        );
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position} 
      onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Thân hộp quà */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Dải ruy băng dọc */}
      <mesh position={[0, 0.4, 0]} castShadow>
         <boxGeometry args={[0.82, 0.8, 0.2]} />
         <meshStandardMaterial color="white" />
      </mesh>
      {/* Dải ruy băng ngang */}
      <mesh position={[0, 0.4, 0]} castShadow>
         <boxGeometry args={[0.2, 0.8, 0.82]} />
         <meshStandardMaterial color="white" />
      </mesh>

      {/* Nắp hộp (Pivot ở cạnh sau để mở giống thật) */}
      <group position={[0, 0.8, -0.4]} ref={lidRef}>
         <group position={[0, 0, 0.4]}> {/* Dời tâm về lại giữa nắp */}
            {/* Phần nắp */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.85, 0.1, 0.85]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
            </mesh>
            {/* Ruy băng trên nắp */}
            <mesh position={[0, 0.06, 0]}>
               <boxGeometry args={[0.86, 0.1, 0.2]} />
               <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
               <boxGeometry args={[0.2, 0.1, 0.86]} />
               <meshStandardMaterial color="white" />
            </mesh>
         </group>
      </group>

      {/* ẢNH BÊN TRONG (Sử dụng Image của drei) */}
      {/* visible={true} để luôn render, nhưng bị hộp che khuất khi đóng */}
      <group position={[0, 0.4, 0]} ref={imageRef} scale={[0.7, 0.7, 1]}>
         <Image url={imageUrl} transparent side={THREE.DoubleSide} />
         {isOpen && (
            <Text position={[0, 0.6, 0.1]} fontSize={0.15} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">
                Merry Christmas!
            </Text>
         )}
      </group>
    </group>
  );
};

// --- Component: Cây Thông (Giữ nguyên logic cũ) ---
const ChristmasTree = (props) => {
  const groupRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) / 8; // Xoay rất nhẹ
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <TreeLayer position={[0, 0.8, 0]} scale={[1.2, 1.2, 1.2]} color="#1e592c" />
      <TreeLayer position={[0, 0, 0]} scale={[1.6, 1.4, 1.6]} color="#166534" />
      <TreeLayer position={[0, -1, 0]} scale={[2.0, 1.6, 2.0]} color="#14532d" />
      <TreeLayer position={[0, -2, 0]} scale={[2.4, 1.8, 2.4]} color="#0d4221" />
      <mesh position={[0, -3.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 1.5, 12]} />
        <meshStandardMaterial color="#451a03" roughness={1} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="yellow" emissive="#ffeb3b" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
};

function App() {
  return (
    <div className="canvas-container">
      {/* FIX LỖI 1: Thêm dpr={[1, 1.5]} 
         Nghĩa là: Máy yếu chạy 1.0, máy mạnh tối đa chỉ chạy 1.5 (thay vì 3.0 hay 4.0)
      */}
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 2, 10], fov: 50 }}>
        
        <Suspense fallback={null}>
          <fog attach="fog" args={['#0f172a', 8, 25]} />
          <color attach="background" args={['#0f172a']} />
          
          <ambientLight intensity={0.4} />
          <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />

          <ChristmasTree position={[0, -0.5, 0]} />

          {/* Các hộp quà giữ nguyên */}
          <GiftBox position={[-2.2, -3.5, 1.5]} color="#ef4444" imageUrl=".\IMG20250707053046.jpg" />
          <GiftBox position={[1.8, -3.5, 2]} color="#3b82f6" imageUrl=".\retouch_2025070916341226.jpg" />
          <GiftBox position={[0, -3.5, 3]} color="#eab308" imageUrl=".\retouch_2025071016472326.jpg" />

          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />
          <Sparkles count={100} scale={10} size={4} speed={0.3} opacity={0.6} color="#fbbf24" />
          
          {/* FIX LỖI 2: Thêm disableNormalPass và multisampling={0}
             Điều này giúp EffectComposer không bị xung đột với phần cứng điện thoại
          */}
          <EffectComposer disableNormalPass multisampling={0}>
            <Bloom luminanceThreshold={1} intensity={0.8} levels={9} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 4} />
        </Suspense>
      </Canvas>
      
      <div className="title-overlay">
        <h1>Merry Christmas!</h1>
        <p>Bấm vào hộp quà để mở 🎁</p>
      </div>
    </div>
  );
}

export default App;