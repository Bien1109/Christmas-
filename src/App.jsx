import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Image, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- (GIỮ NGUYÊN) COMPONENT HỘP QUÀ ---
const GiftBox = ({ position, color, imageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const lidRef = useRef();
  const imageRef = useRef();
  const groupRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    const targetRotation = isOpen ? -Math.PI / 1.8 : 0;
    if (lidRef.current) lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 5);
    
    const targetY = isOpen ? 1.2 : 0.4;
    if (imageRef.current) imageRef.current.position.y = THREE.MathUtils.lerp(imageRef.current.position.y, targetY, delta * 5);
    
    if (groupRef.current && !isOpen) {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1] + (hovered ? 0.2 : 0), delta * 10);
    }
  });

  return (
    <group 
      ref={groupRef} position={position} 
      onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, 0.4, 0]}> <boxGeometry args={[0.8, 0.8, 0.8]} /> <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} /> </mesh>
      <mesh position={[0, 0.4, 0]}> <boxGeometry args={[0.82, 0.8, 0.2]} /> <meshStandardMaterial color="white" /> </mesh>
      <mesh position={[0, 0.4, 0]}> <boxGeometry args={[0.2, 0.8, 0.82]} /> <meshStandardMaterial color="white" /> </mesh>
      <group position={[0, 0.8, -0.4]} ref={lidRef}>
         <group position={[0, 0, 0.4]}>
            <mesh position={[0, 0.05, 0]}> <boxGeometry args={[0.85, 0.1, 0.85]} /> <meshStandardMaterial color={color} /> </mesh>
            <mesh position={[0, 0.06, 0]}> <boxGeometry args={[0.86, 0.1, 0.2]} /> <meshStandardMaterial color="white" /> </mesh>
            <mesh position={[0, 0.06, 0]}> <boxGeometry args={[0.2, 0.1, 0.86]} /> <meshStandardMaterial color="white" /> </mesh>
         </group>
      </group>
      <group position={[0, 0.4, 0]} ref={imageRef} scale={[0.7, 0.7, 1]}>
         <Image url={imageUrl} transparent side={THREE.DoubleSide} />
         {isOpen && ( <Text position={[0, 0.6, 0.1]} fontSize={0.15} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">Merry Christmas!</Text> )}
      </group>
    </group>
  );
};

// --- (MỚI) COMPONENT CÂY THÔNG ĐIỂM SÁNG CHI TIẾT ---
const DetailedPointTree = (props) => {
  const treeRef = useRef();
  
  // Xoay nhẹ toàn bộ cây
  useFrame((state, delta) => {
    if (treeRef.current) {
        treeRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={treeRef} {...props}>
      {/* 1. LÕI CÂY (Dense Core): Màu xanh đậm, mật độ cao để tạo khối */}
      <Sparkles count={800} scale={[2.5, 5, 2.5]} position={[0, 1.5, 0]} size={2.5} speed={0.1} color="#064e3b" opacity={1} noise={2} />

      {/* 2. CÁC TẦNG LÁ (Layers): Xanh tươi hơn, xếp tầng từ dưới lên */}
      {/* Tầng 1 (Đáy) */}
      <Sparkles count={400} scale={[5, 1.5, 5]} position={[0, -0.5, 0]} size={3} speed={0.2} color="#10b981" opacity={0.9} noise={1} />
      {/* Tầng 2 */}
      <Sparkles count={350} scale={[4, 1.5, 4]} position={[0, 1, 0]} size={3} speed={0.2} color="#34d399" opacity={0.9} noise={1} />
      {/* Tầng 3 */}
      <Sparkles count={300} scale={[3, 1.5, 3]} position={[0, 2.2, 0]} size={3} speed={0.2} color="#6ee7b7" opacity={0.9} noise={1} />
      {/* Tầng 4 (Ngọn) */}
      <Sparkles count={200} scale={[1.5, 1, 1.5]} position={[0, 3.2, 0]} size={3} speed={0.2} color="#a7f3d0" opacity={0.9} noise={1} />

      {/* 3. GIẢ LẬP ĐÈN TRANG TRÍ (Ornaments): Điểm sáng màu Đỏ và Vàng rắc vào cây */}
      <Sparkles count={100} scale={[4.5, 4, 4.5]} position={[0, 1, 0]} size={5} speed={0.4} color="#ef4444" opacity={1} noise={3} />
      <Sparkles count={80} scale={[4, 4.5, 4]} position={[0, 1.5, 0]} size={5} speed={0.3} color="#fbbf24" opacity={1} noise={3} />

      {/* 4. NGÔI SAO ĐỈNH (Top Star): Cụm sáng vàng lớn */}
      <Sparkles count={120} scale={[0.5, 0.5, 0.5]} position={[0, 4.2, 0]} size={12} speed={1} color="#facc15" noise={0} />
    </group>
  );
};

function App() {
  return (
    <div className="canvas-container">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 2, 11], fov: 50 }}>
        <Suspense fallback={null}>
          <fog attach="fog" args={['#0f172a', 5, 30]} />
          <color attach="background" args={['#0f172a']} />
          
          <ambientLight intensity={1} /> {/* Tăng sáng môi trường lên một chút */}
          <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24"/>

          {/* --- Sử dụng Cây Thông Mới --- */}
          <DetailedPointTree position={[0, -0.8, 0]} />

          {/* Các hộp quà */}
          <GiftBox 
              position={[-2.2, -3.5, 1.5]} color="#ef4444" 
              imageUrl=".\anh1.jpg" 
          />
          <GiftBox 
              position={[1.8, -3.5, 2]} color="#3b82f6" 
              imageUrl=".\anh1.jpg" 
          />
          <GiftBox 
              position={[0, -3.5, 3]} color="#eab308" 
              imageUrl=".\anh1.jpg" 
          />

          <Stars radius={80} depth={60} count={4000} factor={4} saturation={0.5} fade speed={0.5} />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 4} rotateSpeed={0.5} />
        </Suspense>
      </Canvas>
      
      <div className="title-overlay">
        <h1 style={{ textShadow: 'none', color: '#fbbf24' }}>Merry Christmas!</h1>
        <p>Bấm vào hộp quà để mở 🎁</p>
      </div>
    </div>
  );
}

export default App;