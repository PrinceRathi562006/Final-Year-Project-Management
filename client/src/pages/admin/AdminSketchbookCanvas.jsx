import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PaperPlate({ plate, index, hovered, setHovered, onSelect }) {
  const group = useRef();
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f2ead9", roughness: 0.83, side: THREE.DoubleSide }), []);
  const titleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#40392f";
    context.textAlign = "center";
    context.textBaseline = "middle";
    let fontSize = 54;
    context.font = `600 ${fontSize}px Georgia, serif`;
    while (context.measureText(plate.title).width > canvas.width - 32 && fontSize > 30) {
      fontSize -= 2;
      context.font = `600 ${fontSize}px Georgia, serif`;
    }
    context.fillText(plate.title, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [plate.title]);
  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const active = hovered === index;
    group.current.position.y += ((plate.position[1] + (active ? 0.17 : 0)) - group.current.position.y) * Math.min(1, delta * 6);
    group.current.rotation.x += ((active ? -0.13 : 0) - group.current.rotation.x) * Math.min(1, delta * 5);
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.45 + index) * 0.012;
  });
  return <group ref={group} position={plate.position} onClick={(event) => { event.stopPropagation(); onSelect(plate); }} onPointerOver={(event) => { event.stopPropagation(); setHovered(index); }} onPointerOut={() => setHovered(null)}>
    <mesh position={[0.055, -0.075, -0.09]} castShadow><boxGeometry args={[plate.size[0], plate.size[1], 0.13]} /><meshStandardMaterial color="#4f4237" roughness={0.9} /></mesh>
    <mesh castShadow receiveShadow material={material}><boxGeometry args={[plate.size[0], plate.size[1], 0.12]} /></mesh>
    <mesh position={[0, 0, 0.066]}><planeGeometry args={[plate.size[0] - 0.13, plate.size[1] - 0.13]} /><meshBasicMaterial color={plate.color} transparent opacity={0.2} /></mesh>
    <mesh position={[0, 0.34, 0.076]}><planeGeometry args={[plate.size[0] - 0.48, 0.93]} /><meshBasicMaterial color={plate.color} transparent opacity={0.58} /></mesh>
    <mesh position={[0, 0.28, 0.09]}><torusGeometry args={[0.31, 0.075, 8, 32]} /><meshStandardMaterial color={plate.color} roughness={0.45} /></mesh>
    <mesh position={[0, -0.25, 0.078]}><planeGeometry args={[plate.size[0] - 0.42, 0.014]} /><meshBasicMaterial color="#665b4e" transparent opacity={0.62} /></mesh>
    <mesh position={[0, -0.39, 0.078]}><planeGeometry args={[plate.size[0] - 0.72, 0.012]} /><meshBasicMaterial color="#887a68" transparent opacity={0.35} /></mesh>
    <mesh position={[0, -0.53, 0.078]}><planeGeometry args={[plate.size[0] - 0.9, 0.012]} /><meshBasicMaterial color="#887a68" transparent opacity={0.27} /></mesh>
    <mesh position={[0, -0.92, 0.082]}><planeGeometry args={[plate.size[0] - 0.28, 0.3]} /><meshBasicMaterial map={titleTexture} transparent toneMapped={false} /></mesh>
  </group>;
}

function SketchbookScene({ plates, hovered, setHovered, onSelect }) {
  const book = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  useFrame(({ pointer: p }, delta) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = Math.min(1, window.scrollY / maxScroll);
    pointer.current.x += (p.x - pointer.current.x) * Math.min(1, delta * 1.6);
    pointer.current.y += (p.y - pointer.current.y) * Math.min(1, delta * 1.6);
    if (book.current) {
      book.current.rotation.y += (pointer.current.x * 0.09 + scrollProgress * 0.22 - book.current.rotation.y) * Math.min(1, delta * 2);
      book.current.rotation.x += (-pointer.current.y * 0.055 + scrollProgress * 0.1 - book.current.rotation.x) * Math.min(1, delta * 2);
      book.current.position.y += ((-0.03 - scrollProgress * 0.38) - book.current.position.y) * Math.min(1, delta * 2);
    }
  });
  return <>
    <color attach="background" args={["#d9d1bf"]} />
    <fog attach="fog" args={["#d9d1bf", 13, 24]} />
    <ambientLight intensity={1.6} />
    <directionalLight position={[-5, 8, 7]} intensity={3.3} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[4, 3, 3]} intensity={25} color="#f0bd83" distance={14} />
    <group ref={book} position={[0, -0.03, 0]}>
      <mesh position={[0, -0.1, -0.45]} receiveShadow rotation={[-0.04, 0, 0]}><boxGeometry args={[9.25, 6.55, 0.24]} /><meshStandardMaterial color="#817461" roughness={0.98} /></mesh>
      <mesh position={[0, -0.015, -0.28]} receiveShadow rotation={[-0.04, 0, 0]}><boxGeometry args={[9.12, 6.48, 0.18]} /><meshStandardMaterial color="#f8f1e3" roughness={0.94} /></mesh>
      <mesh position={[0, -0.01, -0.18]}><boxGeometry args={[0.13, 6.42, 0.05]} /><meshStandardMaterial color="#9c8c73" roughness={0.8} /></mesh>
      {plates.map((plate, i) => <PaperPlate key={plate.title} plate={plate} index={i} hovered={hovered} setHovered={setHovered} onSelect={onSelect} />)}
      <mesh position={[-4.13, 2.84, -0.02]} rotation={[0, 0, -0.03]}><boxGeometry args={[0.85, 0.12, 0.1]} /><meshStandardMaterial color="#bd6b51" roughness={0.7} /></mesh>
      <mesh position={[4.13, -3.05, 0.02]} rotation={[0, 0, 0.04]}><boxGeometry args={[0.72, 0.1, 0.1]} /><meshStandardMaterial color="#6f8c7c" roughness={0.7} /></mesh>
    </group>
  </>;
}

export default function AdminSketchbookCanvas(props) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.7, 12.8], fov: 39 }} gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}>
    <Suspense fallback={null}><SketchbookScene {...props} /></Suspense>
  </Canvas>;
}
