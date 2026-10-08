import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { Award, Check, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, Plus, Sparkles, UserRound, X } from "lucide-react";
import "./AddTeacher.css";

const DEPARTMENTS = [
  "Computer Science & Engineering", "Information Technology",
  "Artificial Intelligence & Machine Learning", "Data Science",
  "Electronics & Communication Engineering", "Electrical Engineering",
  "Mechanical Engineering", "Civil Engineering", "Chemical Engineering",
  "Biotechnology", "Bachelor of Business Administration", "Bachelor of Commerce",
  "Bachelor of Computer Applications", "Master of Computer Applications",
  "Master of Business Administration", "Mathematics", "Physics", "Chemistry",
  "English", "Management Studies", "Law", "Pharmacy", "Hotel Management",
  "Architecture", "Design", "Other",
];

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", department: "", experties: "", maxStudents: 10 });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const skills = useMemo(() => formData.experties.split(",").map((skill) => skill.trim()).filter(Boolean), [formData.experties]);
  const close = () => dispatch(toggleTeacherModal());

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") dispatch(toggleTeacherModal()); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const update = (field) => (event) => {
    setError("");
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const experties = skills;
    if (!experties.length) {
      setError("Add at least one area of expertise to continue.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await dispatch(createTeacher({ ...formData, maxStudents: Number(formData.maxStudents), experties })).unwrap();
      close();
    } catch (submitError) {
      setError(typeof submitError === "string" ? submitError : "We couldn’t save this faculty profile. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="at-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <section className="at-modal" role="dialog" aria-modal="true" aria-labelledby="at-title">
      <aside className="at-aside">
        <div className="at-aside__brand"><span><GraduationCap /></span><span>FACULTY<br />ONBOARDING</span></div>
        <div className="at-aside__art"><span className="at-art-orbit at-art-orbit--one" /><span className="at-art-orbit at-art-orbit--two" /><span className="at-art-cap"><Award /></span><Sparkles className="at-art-spark at-art-spark--one" /><Sparkles className="at-art-spark at-art-spark--two" /></div>
        <div className="at-aside__copy"><span>GREAT PROJECTS</span><h2>Start with<br />a great mentor.</h2><p>Give students a guide who knows their field and can help turn bold questions into real work.</p></div>
        <div className="at-aside__foot"><span><Check /> Expertise-led matching</span><span><Check /> Clear mentoring capacity</span></div>
        <span className="at-aside__index">ACADEMIC DIRECTORY <i /> 01</span>
      </aside>

      <div className="at-main">
        <div className="at-main__top"><span><i /> NEW FACULTY PROFILE</span><button type="button" onClick={close} aria-label="Close form"><X /></button></div>
        <div className="at-heading"><span className="at-heading__icon"><UserRound /></span><div><h2 id="at-title">Add a faculty member</h2><p>Build a profile students can discover and learn from.</p></div></div>

        <form className="at-form" onSubmit={handleSubmit}>
          <div className="at-form__section"><span className="at-section-number">01</span><div className="at-section-title"><strong>Personal details</strong><small>How should this mentor appear in the directory?</small></div></div>
          <div className="at-fields at-fields--two">
            <label className="at-field"><span>Full name <i>*</i></span><div><UserRound /><input autoFocus required autoComplete="name" placeholder="e.g. Dr. Asha Mehta" value={formData.name} onChange={update("name")} /></div></label>
            <label className="at-field"><span>Work email <i>*</i></span><div><Mail /><input required type="email" autoComplete="email" placeholder="name@university.edu" value={formData.email} onChange={update("email")} /></div></label>
            <label className="at-field at-field--full"><span>Department <i>*</i></span><div><GraduationCap /><select required value={formData.department} onChange={update("department")}><option value="" disabled>Select an academic department</option>{DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}</select></div></label>
            <label className="at-field at-field--full"><span>Areas of expertise <i>*</i><small>Use commas to separate each area</small></span><div className="at-field__textarea"><Sparkles /><textarea required rows={2} placeholder="e.g. Machine learning, Data visualization, NLP" value={formData.experties} onChange={update("experties")} /></div>{skills.length > 0 && <div className="at-skill-preview" aria-label="Expertise preview">{skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}{skills.length > 5 && <span>+{skills.length - 5}</span>}</div>}</label>
          </div>

          <div className="at-form__section at-form__section--spaced"><span className="at-section-number">02</span><div className="at-section-title"><strong>Account &amp; availability</strong><small>Set up secure access and a manageable student load.</small></div></div>
          <div className="at-fields at-fields--two">
            <label className="at-field"><span>Temporary password <i>*</i></span><div><LockKeyhole /><input required minLength={6} autoComplete="new-password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={formData.password} onChange={update("password")} /><button className="at-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            <label className="at-field"><span>Student capacity <i>*</i></span><div><UserRound /><input required min="1" type="number" inputMode="numeric" value={formData.maxStudents} onChange={update("maxStudents")} /><span className="at-input-suffix">students</span></div></label>
          </div>
          <div className="at-capacity-note"><span><i /></span><p>This mentor can support up to <strong>{formData.maxStudents || 0} students</strong>. You can change the limit any time.</p></div>

          {error && <div className="at-error" role="alert"><X />{error}</div>}
          <div className="at-form__actions"><button type="button" className="at-cancel" onClick={close}>Cancel</button><button type="submit" className="at-submit" disabled={saving}><Plus />{saving ? "Creating profile…" : "Create faculty profile"}<span>↗</span></button></div>
          <p className="at-security"><LockKeyhole /> Profile details are visible to administrators and students in the directory.</p>
        </form>
      </div>
    </section>
  </div>;
};

export default AddTeacher;
