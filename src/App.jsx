import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Image, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- (GIỮ NGUYÊN) COMPONENT HỘP QUÀ TƯƠNG TÁC DƯỚI ĐẤT ---
const GiftBoxGround = ({ position, color, imageUrl }) => {
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
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh position={[0, 0.4, 0]} castShadow> <boxGeometry args={[0.8, 0.8, 0.8]} /> <meshStandardMaterial color={color} roughness={0.4} /> </mesh>
      <mesh position={[0, 0.4, 0]} castShadow> <boxGeometry args={[0.82, 0.8, 0.2]} /> <meshStandardMaterial color="white" /> </mesh>
      <mesh position={[0, 0.4, 0]} castShadow> <boxGeometry args={[0.2, 0.8, 0.82]} /> <meshStandardMaterial color="white" /> </mesh>
      <group position={[0, 0.8, -0.4]} ref={lidRef}>
         <group position={[0, 0, 0.4]}>
            <mesh position={[0, 0.05, 0]} castShadow> <boxGeometry args={[0.85, 0.1, 0.85]} /> <meshStandardMaterial color={color} roughness={0.4} /> </mesh>
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

// --- COMPONENT: VẬT TRANG TRÍ TRÊN CÂY (Đèn hoặc Quà nhỏ) ---
const TreeDecoration = ({ position, type, color }) => {
    // Tạo dao động ngẫu nhiên nhẹ cho các vật treo
    const ref = useRef();
    const speed = useMemo(() => Math.random() * 2 + 1, []);
    const offset = useMemo(() => Math.random() * Math.PI, []);
    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * speed + offset) * 0.05;
        }
    })

    if (type === 'bulb') {
        return (
            <mesh ref={ref} position={position}>
                <sphereGeometry args={[0.1, 16, 16]} />
                {/* Emissive cao giúp bóng đèn tự phát sáng mạnh mẽ mà không cần Bloom */}
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
                {/* Thêm một đèn point light nhỏ để nó thực sự chiếu sáng vùng xung quanh (tùy chọn, nếu nặng máy thì bỏ đi) */}
                <pointLight color={color} intensity={0.5} distance={1.5} decay={2} />
            </mesh>
        );
    } else if (type === 'gift') {
        return (
            <group ref={ref} position={position} rotation={[Math.random(), Math.random(), Math.random()]}>
                 {/* Dây treo */}
                 <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.4]} />
                    <meshBasicMaterial color="#888" />
                 </mesh>
                 {/* Hộp quà nhỏ */}
                <mesh castShadow>
                    <boxGeometry args={[0.25, 0.25, 0.25]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh castShadow>
                    <boxGeometry args={[0.26, 0.05, 0.26]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
        );
    }
    return null;
};


// --- COMPONENT: CÂY THÔNG HÌNH KHỐI VỚI TRANG TRÍ ---
const SolidDecoratedTree = (props) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 4) / 8;
  });

  // Hàm tạo vị trí ngẫu nhiên trên bề mặt hình nón
  const generateDecorations = (count, bottomRadius, topRadius, height, baseHeight, types, colors) => {
    const items = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2; // Góc ngẫu nhiên vòng quanh cây
        const yRel = Math.random() * height; // Chiều cao ngẫu nhiên trong tầng lá
        // Tính bán kính tại chiều cao đó
        const currentRadius = THREE.MathUtils.lerp(bottomRadius, topRadius, yRel / height);
        const x = Math.cos(angle) * currentRadius;
        const z = Math.sin(angle) * currentRadius;
        const y = yRel + baseHeight;
        
        items.push({
            position: [x, y, z],
            type: types[Math.floor(Math.random() * types.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            id: i + baseHeight // Unique ID
        });
    }
    return items;
  };

  // Tạo danh sách các vật trang trí (Chỉ tính toán 1 lần)
  const decorations = useMemo(() => {
      const bulbColors = ["#ff0000", "#ffff00", "#0000ff", "#ffaa00"];
      const giftColors = ["#ff4444", "#44ff44", "#4444ff", "#ffdd44"];
      
      return [
          // Tầng dưới cùng (Rộng nhất)
          ...generateDecorations(25, 2.2, 1.5, 1.5, -1.5, ['bulb', 'gift'], bulbColors.concat(giftColors)),
          // Tầng 2
          ...generateDecorations(20, 1.8, 1.2, 1.5, 0, ['bulb', 'gift'], bulbColors.concat(giftColors)),
          // Tầng 3
          ...generateDecorations(15, 1.4, 0.8, 1.5, 1.5, ['bulb', 'gift'], bulbColors.concat(giftColors)),
          // Tầng ngọn
          ...generateDecorations(10, 1.0, 0.1, 1.5, 3.0, ['bulb', 'gift'], bulbColors.concat(giftColors)),
      ];
  }, [])


  return (
    <group ref={groupRef} {...props}>
      {/* Các tầng lá cây (Hình nón) */}
      <mesh position={[0, 3.75, 0]} castShadow receiveShadow> <coneGeometry args={[1, 1.5, 16]} /> <meshStandardMaterial color="#14532d" flatShading /> </mesh>
      <mesh position={[0, 2.25, 0]} castShadow receiveShadow> <coneGeometry args={[1.4, 1.5, 16]} /> <meshStandardMaterial color="#15803d" flatShading /> </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow> <coneGeometry args={[1.8, 1.5, 16]} /> <meshStandardMaterial color="#166534" flatShading /> </mesh>
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow> <coneGeometry args={[2.2, 1.5, 16]} /> <meshStandardMaterial color="#1e592c" flatShading /> </mesh>
      
      {/* Thân cây */}
      <mesh position={[0, -2, 0]} castShadow> <cylinderGeometry args={[0.5, 0.5, 1.5]} /> <meshStandardMaterial color="#451a03" /> </mesh>
      
      {/* Ngôi sao đỉnh */}
      <mesh position={[0, 4.8, 0]}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="yellow" emissive="#ffeb3b" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Render các vật trang trí */}
      {decorations.map(dec => (
          <TreeDecoration key={dec.id} position={dec.position} type={dec.type} color={dec.color} />
      ))}

    </group>
  );
};

function App() {
  return (
    <div className="canvas-container">
      {/* Giữ dpr để tối ưu cho điện thoại */}
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 2, 11], fov: 50 }}>
        <Suspense fallback={null}>
          <fog attach="fog" args={['#0f172a', 5, 30]} />
          <color attach="background" args={['#0f172a']} />
          
          <ambientLight intensity={0.5} />
          {/* Đèn chiếu chính tạo bóng đổ */}
          <directionalLight castShadow position={[5, 10, 5]} intensity={2} shadow-mapSize={[1024, 1024]} />
          {/* Đèn phụ màu ấm làm dịu bóng tối */}
          <pointLight position={[-5, 2, -5]} intensity={0.5} color="#ffcc77"/>

          {/* Cây thông hình khối với trang trí */}
          <SolidDecoratedTree position={[0, -1, 0]} />

          {/* Mặt đất để hứng bóng đổ */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#112233" />
          </mesh>

          {/* Hộp quà tương tác dưới đất (Giữ nguyên link ảnh cũ, bạn tự thay lại nhé) */}
          <GiftBoxGround position={[-2.2, -2.5, 1.5]} color="#ef4444" imageUrl=".\anh1.jpg" />
          <GiftBoxGround position={[1.8, -2.5, 2]} color="#3b82f6" imageUrl=".\anh1.jpg" />
          <GiftBoxGround position={[0, -2.5, 3]} color="#eab308" imageUrl=".\anh1.jpg" />

          <Stars radius={80} depth={60} count={4000} factor={4} saturation={0.5} fade speed={0.5} />
          {/* Thêm một chút bụi tiên lấp lánh nhẹ */}
          <Sparkles count={100} scale={10} size={2} speed={0.2} opacity={0.5} color="#ffd700" />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 4} rotateSpeed={0.5} />
        </Suspense>
      </Canvas>
      
      <div className="title-overlay">
        <h1 style={{ textShadow: 'none', color: '#fbbf24' }}>Merry Christmas!</h1>
        <p>Bấm vào hộp quà dưới đất để mở 🎁</p>
      </div>
    </div>
  );
}

export default App;