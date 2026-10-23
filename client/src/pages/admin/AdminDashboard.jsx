import { createElement, Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, BookOpen, Compass, GraduationCap, LogOut, Network, UsersRound } from "lucide-react";
import * as THREE from "three";
import { getAllUsers } from "../../store/slices/adminSlice";
import { logout } from "../../store/slices/authSlice";
import AdminIntro from "./AdminIntro";
import "./AdminPortal.css";
import "./AdminDashboard.css";
import "./AdminBookOpening.css";

const plates = [
  { title: "Students", note: "The people behind the work", path: "/admin/students", icon: "01", color: "#e5a875", position: [-2.45, 0.2, 0.1], size: [2.45, 2.8] },
  { title: "Faculty", note: "Guides, mentors & reviewers", path: "/admin/teachers", icon: "02", color: "#91a9c8", position: [0, 0.15, 0.3], size: [2.45, 2.8] },
  { title: "Project atlas", note: "Ideas taking shape", path: "/admin/projects", icon: "03", color: "#a7b58e", position: [2.45, 0.2, 0.1], size: [2.45, 2.8] },
  { title: "Mentor matches", note: "Bring the right minds together", path: "/admin/assign-supervisor", icon: "04", color: "#d08c80", position: [-1.23, -2.95, 0.18], size: [2.45, 2.45] },
  { title: "Milestones", note: "A timeline for every big idea", path: "/admin/deadlines", icon: "05", color: "#c4a568", position: [1.23, -2.95, 0.18], size: [2.45, 2.45] },
];

function PaperPlate({ plate, index, hovered, setHovered, onSelect }) {
  const group = useRef();
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f2ead9", roughness: 0.83, side: THREE.DoubleSide }), []);
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
  </group>;
}

function SketchbookScene({ hovered, setHovered, onSelect }) {
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

export default function AdminDashboard() {
  const { theme = "dark" } = useOutletContext() || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { authUser } = useSelector((state) => state.auth);
  const { users = [] } = useSelector((state) => state.admin || {});
  const [hovered, setHovered] = useState(null);
  const [openingPlate, setOpeningPlate] = useState(null);
  const navigationTimer = useRef(null);
  const [introOpen, setIntroOpen] = useState(() => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => { dispatch(getAllUsers()); }, [dispatch]);
  useEffect(() => () => window.clearTimeout(navigationTimer.current), []);
  const openPlate = (plate) => {
    if (openingPlate) return;
    if (reducedMotion) {
      navigate(plate.path);
      return;
    }
    setOpeningPlate(plate);
    navigationTimer.current = window.setTimeout(() => navigate(plate.path), 2750);
  };
  const students = users.filter((user) => user.role?.toLowerCase() === "student");
  const teachers = users.filter((user) => user.role?.toLowerCase() === "teacher");
  const assigned = students.filter((student) => student.supervisor).length;
  const metricData = [["Student authors", students.length, GraduationCap], ["Faculty guides", teachers.length, UsersRound], ["Waiting for a guide", Math.max(0, students.length - assigned), Network]];
  return <main className="sketch-admin" data-theme={theme}>
    <div className="sketch-admin__scene" aria-hidden="true"><Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.7, 12.8], fov: 39 }} gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}><Suspense fallback={null}><SketchbookScene hovered={hovered} setHovered={setHovered} onSelect={openPlate} /></Suspense></Canvas></div>
    <header className="sketch-header"><Link className="sketch-brand" to="/admin"><span className="sketch-brand__mark"><BookOpen size={18} /></span><span>FIELDNOTES <small>PROJECT OFFICE · VOL. 01</small></span></Link><span className="sketch-header__center">A living record of ideas in progress</span><button className="sketch-header__user" type="button" onClick={async () => { try { await dispatch(logout()).unwrap(); navigate("/login", { replace: true }); } catch { /* Keep the current workspace when sign out fails. */ } }} title="Sign out"><i /> {authUser?.name || "Administrator"}<LogOut size={14} /></button></header>
    <section className="sketch-intro"><span className="sketch-kicker"><Compass size={13} /> THE ACADEMIC YEAR, IN MOTION</span><h1>Every great project<br />begins with a <em>page.</em></h1><p>Welcome back, {authUser?.name?.split(" ")[0] || "Admin"}. Pick up the thread and keep good work moving.</p></section>
    <nav className="sketch-index" aria-label="Workspace index">{plates.map((plate, i) => <Link className={`sketch-index__item${hovered === i ? " is-active" : ""}`} key={plate.path} to={plate.path} onClick={(event) => { event.preventDefault(); openPlate(plate); }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}><span className="sketch-index__number">{plate.icon}</span><span><b>{plate.title}</b><small>{plate.note}</small></span><ArrowUpRight size={15} /></Link>)}</nav>
    <section className="sketch-metrics" aria-label="Workspace directory summary">{metricData.map(([label, value, Icon]) => <div className="sketch-metric" key={label}>{createElement(Icon, { size: 15 })}<span>{label}</span><b>{value.toLocaleString()}</b><ArrowDownRight size={13} /></div>)}</section>
    <footer className="sketch-footer"><span>PROJECT HUB <i /> ADMIN FIELDNOTES</span><span>OPEN A PLATE TO CONTINUE <b>↗</b></span></footer>
    <div className="sketch-mobile-links">{plates.map((plate) => <Link key={plate.path} to={plate.path} onClick={(event) => { event.preventDefault(); openPlate(plate); }}>{plate.icon} · {plate.title}</Link>)}</div>
    {openingPlate && <div className="book-opening" role="status" aria-live="polite"><div className="book-opening__sky" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="book-opening__book"><span className="book-opening__cover" /><span className="book-opening__pages" /><span className="book-opening__scratch" /></div><div className="book-opening__title"><small>OPENING FIELDNOTE {openingPlate.icon}</small><strong>{openingPlate.title}</strong><span>{openingPlate.note}</span></div><div className="book-opening__fire" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>}
    <AnimatePresence>{introOpen && <AdminIntro key="admin-intro" onFinish={() => setIntroOpen(false)} reducedMotion={Boolean(reducedMotion)} />}</AnimatePresence>
  </main>;
}
