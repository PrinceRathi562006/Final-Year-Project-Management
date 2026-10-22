import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";

const WorkspaceScene = lazy(() => import("./AdminWorkspaceScene"));
const Motion = motion;

const introPanels = [
  { className: "admin-intro-panel--scope", eyebrow: "PROJECT FLOW", title: "From proposal to milestone", bars: ["78%", "54%", "88%"] },
  { className: "admin-intro-panel--team", eyebrow: "TEAM SPACE", title: "One place to move forward", bars: ["65%", "82%", "48%"] },
  { className: "admin-intro-panel--review", eyebrow: "REVIEW QUEUE", title: "Every next step in focus", bars: ["48%", "73%", "60%"] },
];

const IntroPanel = ({ panel, index }) => (
  <Motion.div
    className={`admin-intro-panel ${panel.className}`}
    initial={{ opacity: 0, y: 24, rotateY: index % 2 ? 15 : -15, scale: 0.78 }}
    animate={{ opacity: 1, y: 0, rotateY: index % 2 ? 8 : -8, scale: 1 }}
    transition={{ duration: 0.85, delay: 2.05 + index * 0.48, ease: [0.2, 0.75, 0.3, 1] }}
    aria-hidden="true"
  >
    <div className="admin-intro-panel__top"><span>{panel.eyebrow}</span><i /></div>
    <b>{panel.title}</b>
    <div className="admin-intro-panel__rows">{panel.bars.map((width, row) => <span key={row}><i style={{ width }} /><i /></span>)}</div>
  </Motion.div>
);

const AdminIntro = ({ onFinish, reducedMotion }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", handleKeyDown);

    if (reducedMotion) {
      finish();
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = previousOverflow;
        document.documentElement.style.overflow = previousRootOverflow;
      };
    }
    const welcomeTimer = window.setTimeout(() => setShowWelcome(true), 3100);
    const finishTimer = window.setTimeout(() => finish(), 7300);
    return () => {
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(finishTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [finish, reducedMotion]);

  return createPortal(
    <Motion.div
      className="admin-intro"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to your admin workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.025, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.2, 0.75, 0.3, 1] }}
    >
      <div className="admin-intro__atmosphere" aria-hidden="true" />
      <div className="admin-intro__grid" aria-hidden="true" />
      <div className="admin-intro__stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <button className="admin-intro__skip" type="button" data-no-arrow-animation onClick={finish}>Skip intro <ArrowRight aria-hidden="true" /></button>

      <div className="admin-intro__layout">
        <Motion.div className="admin-intro__copy" initial={{ opacity: 0, x: -34 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.65, ease: [0.2, 0.75, 0.3, 1] }}>
          <span className="admin-intro__eyebrow"><Sparkles aria-hidden="true" /> YOUR WORKSPACE. REIMAGINED.</span>
          <Motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.95 }}>Turn ideas<br />into <span>impact.</span></Motion.h1>
          <Motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.35 }}>Bring projects, people and progress together in one focused academic workspace.</Motion.p>
          <Motion.div className={`admin-intro__actions${showWelcome ? " is-ready" : ""}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: showWelcome ? 1 : 0, y: showWelcome ? 0 : 12 }} transition={{ duration: 0.5 }}>
            <button className="admin-intro__enter" type="button" data-no-arrow-animation onClick={finish}>Enter workspace <ArrowRight aria-hidden="true" /></button>
            <span><i /> Private admin portal</span>
          </Motion.div>
        </Motion.div>

        <div className="admin-intro__visual" role="img" aria-label="Animated 3D illustration of a person working on a laptop">
          <div className="admin-intro__orbit admin-intro__orbit--outer" aria-hidden="true" />
          <div className="admin-intro__orbit admin-intro__orbit--inner" aria-hidden="true" />
          <div className="admin-intro__scene-label"><Compass aria-hidden="true" /> WORKSPACE PREVIEW <span>01 / 03</span></div>
          <Suspense fallback={<div className="admin-intro__loader"><i /> Preparing your workspace</div>}>
            <WorkspaceScene mode="intro" />
          </Suspense>
          {introPanels.map((panel, index) => <IntroPanel key={panel.className} panel={panel} index={index} />)}
          <div className="admin-intro__visual-note">Illustrative interface preview <i /> No project data shown</div>
        </div>
      </div>

      <div className="admin-intro__bottom"><span>PROJECT HUB <i /> ADMIN PORTAL</span><span>DESIGNED FOR MOMENTUM</span></div>
      <div className="admin-intro__light-sweep" aria-hidden="true" />
    </Motion.div>,
    document.body,
  );
};

export default AdminIntro;
