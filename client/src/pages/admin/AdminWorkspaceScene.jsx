import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const WorkingPerson = ({ mode }) => {
  const arrival = useRef(null);
  const body = useRef(null);
  const head = useRef(null);
  const armLeft = useRef(null);
  const armRight = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (arrival.current && mode === "intro") {
      const progress = Math.min(1, Math.max(0, (time - 0.4) / 1.8));
      const eased = 1 - (1 - progress) ** 3;
      arrival.current.position.x = (1 - eased) * 1.15;
      arrival.current.scale.setScalar(0.88 + eased * 0.14);
    }
    if (body.current) body.current.position.y = Math.sin(time * 1.15) * 0.035;
    if (head.current) head.current.rotation.z = Math.sin(time * 0.58) * 0.035;
    if (armLeft.current) armLeft.current.rotation.z = Math.sin(time * 5.3) * 0.025;
    if (armRight.current) armRight.current.rotation.z = Math.sin(time * 5.3 + 0.9) * 0.025;
  });

  const skin = "#d99978";
  const jacket = "#3155a8";
  const darkCloth = "#17294c";

  return (
    <group ref={arrival} position={[mode === "intro" ? 1.15 : 0, mode === "intro" ? -0.13 : -0.02, 0]} scale={mode === "intro" ? 0.88 : 0.94}>
      {/* Chair */}
      <mesh position={[-0.47, -0.76, -0.12]} castShadow><boxGeometry args={[0.78, 0.92, 0.13]} /><meshStandardMaterial color="#263963" roughness={0.62} /></mesh>
      <mesh position={[-0.45, -1.12, 0.02]} castShadow><boxGeometry args={[0.92, 0.14, 0.62]} /><meshStandardMaterial color="#354e79" roughness={0.45} /></mesh>

      {/* Seated legs */}
      <mesh position={[-0.48, -1.43, 0.38]} rotation={[0, 0, -0.12]} castShadow><capsuleGeometry args={[0.19, 0.67, 5, 10]} /><meshStandardMaterial color={darkCloth} roughness={0.82} /></mesh>
      <mesh position={[0.14, -1.42, 0.38]} rotation={[0, 0, 0.06]} castShadow><capsuleGeometry args={[0.19, 0.67, 5, 10]} /><meshStandardMaterial color={darkCloth} roughness={0.82} /></mesh>
      <mesh position={[-0.45, -1.83, 0.47]} castShadow><capsuleGeometry args={[0.14, 0.36, 4, 9]} /><meshStandardMaterial color="#20365e" roughness={0.78} /></mesh>
      <mesh position={[0.22, -1.81, 0.47]} castShadow><capsuleGeometry args={[0.14, 0.36, 4, 9]} /><meshStandardMaterial color="#20365e" roughness={0.78} /></mesh>

      {/* Torso and shoulders */}
      <group ref={body} position={[0, 0, -0.18]}>
        <mesh position={[-0.1, -0.13, 0.03]} rotation={[0, 0, -0.12]} castShadow><capsuleGeometry args={[0.34, 0.56, 7, 14]} /><meshStandardMaterial color={jacket} roughness={0.58} /></mesh>
        <mesh position={[-0.1, 0.18, 0.035]} castShadow><sphereGeometry args={[0.35, 20, 16]} /><meshStandardMaterial color={jacket} roughness={0.58} /></mesh>
        <mesh position={[-0.06, 0.38, 0.04]} castShadow><cylinderGeometry args={[0.105, 0.13, 0.23, 12]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <group ref={armLeft}>
          <mesh position={[-0.42, -0.04, -0.08]} rotation={[0, 0, -0.62]} castShadow><capsuleGeometry args={[0.12, 0.48, 5, 10]} /><meshStandardMaterial color={jacket} roughness={0.6} /></mesh>
          <mesh position={[-0.35, -0.3, 0.04]} rotation={[0, 0, -0.1]} castShadow><capsuleGeometry args={[0.09, 0.3, 5, 10]} /><meshStandardMaterial color={jacket} roughness={0.62} /></mesh>
          <mesh position={[-0.28, -0.48, 0.1]} rotation={[0.12, 0, -0.08]} castShadow><capsuleGeometry args={[0.065, 0.14, 4, 8]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        </group>
        <group ref={armRight}>
          <mesh position={[0.24, -0.01, -0.06]} rotation={[0, 0, 0.78]} castShadow><capsuleGeometry args={[0.12, 0.5, 5, 10]} /><meshStandardMaterial color={jacket} roughness={0.6} /></mesh>
          <mesh position={[0.32, -0.29, 0.04]} rotation={[0, 0, 0.12]} castShadow><capsuleGeometry args={[0.09, 0.3, 5, 10]} /><meshStandardMaterial color={jacket} roughness={0.62} /></mesh>
          <mesh position={[0.27, -0.48, 0.1]} rotation={[-0.1, 0, 0.08]} castShadow><capsuleGeometry args={[0.065, 0.14, 4, 8]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        </group>
      </group>

      {/* Head, hair and face */}
      <group ref={head} position={[-0.03, 0.77, -0.03]}>
        <mesh castShadow><sphereGeometry args={[0.3, 24, 20]} /><meshStandardMaterial color={skin} roughness={0.57} /></mesh>
        <mesh position={[-0.015, 0.16, -0.015]} rotation={[0.1, 0, 0.04]} castShadow><sphereGeometry args={[0.31, 20, 15]} /><meshStandardMaterial color="#20233b" roughness={0.76} /></mesh>
        <mesh position={[-0.12, 0.075, 0.248]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#19233a" roughness={0.3} /></mesh>
        <mesh position={[0.07, 0.075, 0.248]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#19233a" roughness={0.3} /></mesh>
        <mesh position={[0.015, 0.005, 0.281]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#c57e64" roughness={0.6} /></mesh>
        <mesh position={[0.02, -0.075, 0.256]} rotation={[0, 0, -0.04]}><boxGeometry args={[0.075, 0.013, 0.013]} /><meshStandardMaterial color="#8a514a" roughness={0.7} /></mesh>
      </group>

      {/* Laptop, turned toward the person */}
      <mesh position={[0.02, -0.68, 0.53]} rotation={[-0.08, 0, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.065, 0.72]} /><meshStandardMaterial color="#9ba9c8" metalness={0.74} roughness={0.25} /></mesh>
      <mesh position={[0.02, -0.3, 0.23]} rotation={[-0.08, 0, 0]} castShadow><boxGeometry args={[1.1, 0.7, 0.055]} /><meshStandardMaterial color="#9daaca" metalness={0.62} roughness={0.24} /></mesh>
      <mesh position={[0.02, -0.3, 0.264]}><planeGeometry args={[0.97, 0.58]} /><meshBasicMaterial color="#071b3a" /></mesh>
      <mesh position={[0.02, -0.3, 0.269]}><planeGeometry args={[0.88, 0.014]} /><meshBasicMaterial color="#46d8ff" /></mesh>
      <mesh position={[0.02, -0.375, 0.27]}><planeGeometry args={[0.59, 0.012]} /><meshBasicMaterial color="#856dff" /></mesh>
      <mesh position={[0.02, -0.435, 0.27]}><planeGeometry args={[0.72, 0.01]} /><meshBasicMaterial color="#3e85df" /></mesh>
      <mesh position={[0.02, -0.495, 0.27]}><planeGeometry args={[0.44, 0.009]} /><meshBasicMaterial color="#31d7b2" /></mesh>
      <mesh position={[0.02, -0.641, 0.39]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.68, 0.12]} /><meshBasicMaterial color="#7585a6" /></mesh>
      <mesh position={[0.02, -0.641, 0.67]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.26, 0.18]} /><meshBasicMaterial color="#8291af" /></mesh>

      {/* Desk */}
      <mesh position={[0, -0.78, 0.72]} castShadow receiveShadow><boxGeometry args={[3.35, 0.16, 1.35]} /><meshStandardMaterial color="#233356" roughness={0.47} metalness={0.28} /></mesh>
      <mesh position={[-1.42, -1.47, 0.88]} castShadow><boxGeometry args={[0.11, 1.22, 0.12]} /><meshStandardMaterial color="#283a60" roughness={0.56} metalness={0.2} /></mesh>
      <mesh position={[1.42, -1.47, 0.88]} castShadow><boxGeometry args={[0.11, 1.22, 0.12]} /><meshStandardMaterial color="#283a60" roughness={0.56} metalness={0.2} /></mesh>
    </group>
  );
};

const AmbientParticles = ({ mode }) => {
  const points = useRef(null);
  const positions = useMemo(() => {
    const count = mode === "intro" ? 90 : 48;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (Math.random() - 0.5) * 8;
      values[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      values[i * 3 + 2] = -1.8 - Math.random() * 3;
    }
    return values;
  }, [mode]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#90dfff" size={0.022} transparent opacity={mode === "intro" ? 0.58 : 0.36} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const GroundGlow = () => (
  <mesh position={[0, -1.07, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[2.4, 48]} />
    <meshBasicMaterial color="#3974e6" transparent opacity={0.12} depthWrite={false} />
  </mesh>
);

const Scene = ({ mode, pointer }) => {
  const world = useRef(null);
  useFrame((_, delta) => {
    if (!world.current) return;
    const targetY = pointer.current.x * 0.075;
    const targetX = pointer.current.y * 0.05;
    world.current.rotation.y += (targetY - world.current.rotation.y) * Math.min(1, delta * 2.2);
    world.current.rotation.x += (targetX - world.current.rotation.x) * Math.min(1, delta * 2.2);
  });

  return (
    <>
      <ambientLight intensity={1.15} color="#96b9ff" />
      <directionalLight position={[-3, 4, 5]} intensity={3.1} color="#c9ddff" castShadow shadow-mapSize={[512, 512]} />
      <pointLight position={[2.7, 1.7, -1]} intensity={28} color="#705aff" distance={8} />
      <pointLight position={[-2.8, 0.2, 1.2]} intensity={18} color="#30d6ef" distance={7} />
      <group ref={world}>
        <GroundGlow />
        <WorkingPerson mode={mode} />
        <AmbientParticles mode={mode} />
      </group>
    </>
  );
};

const FallbackArt = () => (
  <div className="admin-3d-fallback" aria-hidden="true">
    <div className="admin-3d-fallback__halo" /><div className="admin-3d-fallback__head" /><div className="admin-3d-fallback__body" />
    <div className="admin-3d-fallback__desk" /><div className="admin-3d-fallback__screen" />
  </div>
);

const AdminWorkspaceScene = ({ mode = "dashboard" }) => {
  const pointer = useRef({ x: 0, y: 0 });
  const onPointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointer.current.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };
  const resetPointer = () => { pointer.current.x = 0; pointer.current.y = 0; };

  return (
    <div className={`admin-workspace-scene admin-workspace-scene--${mode}`} onPointerMove={onPointerMove} onPointerLeave={resetPointer}>
      <Canvas
        shadows
        dpr={[1, 1.4]}
        camera={{ position: [0, 1.45, 7.7], fov: 36 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        fallback={<FallbackArt />}
      >
        <Suspense fallback={null}><Scene mode={mode} pointer={pointer} /></Suspense>
      </Canvas>
    </div>
  );
};

export default AdminWorkspaceScene;
