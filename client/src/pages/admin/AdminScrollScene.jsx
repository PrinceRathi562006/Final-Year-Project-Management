import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingFolios() {
  const folios = useRef(null);
  const scroll = useRef(0);
  useFrame(({ clock }, delta) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scroll.current += (Math.min(1, window.scrollY / maxScroll) - scroll.current) * Math.min(1, delta * 2.2);
    if (!folios.current) return;
    const t = clock.elapsedTime;
    folios.current.rotation.y += ((scroll.current * 0.38 + Math.sin(t * 0.2) * 0.025) - folios.current.rotation.y) * Math.min(1, delta * 2.5);
    folios.current.rotation.x += ((-0.08 + scroll.current * 0.24) - folios.current.rotation.x) * Math.min(1, delta * 2);
    folios.current.position.y += ((0.15 - scroll.current * 2.15 + Math.sin(t * 0.45) * 0.08) - folios.current.position.y) * Math.min(1, delta * 2.4);
  });

  const sheets = [
    { position: [3.45, 1.62, -1.5], rotation: [0.06, -0.2, -0.08], color: "#f8f0df" },
    { position: [3.83, 0.7, -0.4], rotation: [-0.08, 0.08, 0.07], color: "#e9dfca" },
    { position: [3.5, -0.22, 0.35], rotation: [0.07, -0.16, -0.04], color: "#f6eddb" },
    { position: [3.82, -1.15, -0.55], rotation: [-0.06, 0.12, 0.09], color: "#e8ddc6" },
  ];

  return <group ref={folios}>
    {sheets.map((sheet, index) => <group key={index} position={sheet.position} rotation={sheet.rotation}>
      <mesh castShadow receiveShadow><boxGeometry args={[2.05, 1.35, 0.095]} /><meshStandardMaterial color={sheet.color} roughness={0.92} /></mesh>
      <mesh position={[0, 0.34, 0.051]}><planeGeometry args={[1.56, 0.018]} /><meshBasicMaterial color={index % 2 ? "#a9855f" : "#87927d"} /></mesh>
      <mesh position={[-0.04, 0.08, 0.052]}><planeGeometry args={[1.42, 0.012]} /><meshBasicMaterial color="#8a7b65" transparent opacity={0.5} /></mesh>
      <mesh position={[0.12, -0.12, 0.052]}><planeGeometry args={[1.18, 0.012]} /><meshBasicMaterial color="#8a7b65" transparent opacity={0.33} /></mesh>
      <mesh position={[-0.43, -0.42, 0.052]}><circleGeometry args={[0.16, 28]} /><meshBasicMaterial color={index % 2 ? "#c68b65" : "#82917a"} transparent opacity={0.78} /></mesh>
    </group>)}
    <mesh position={[3.65, 0.1, -1.85]} rotation={[0, 0, 0.05]}><torusGeometry args={[1.82, 0.012, 5, 96]} /><meshBasicMaterial color="#a68b69" transparent opacity={0.46} /></mesh>
  </group>;
}

export default function AdminScrollScene() {
  return <Canvas dpr={[1, 1.25]} camera={{ position: [0, 0, 10], fov: 42 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}>
    <ambientLight intensity={1.7} />
    <directionalLight position={[-3, 5, 7]} intensity={2.5} />
    <pointLight position={[4, 2, 3]} intensity={15} color="#e8b77e" distance={12} />
    <FloatingFolios />
  </Canvas>;
}
