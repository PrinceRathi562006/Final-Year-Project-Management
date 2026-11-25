import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowUpRight, Bell, Check, CircleHelp, LoaderCircle, RefreshCw } from "lucide-react";
import { fetchStudentNotifications } from "../../store/slices/notificationSlice";
import "./NotificationsPage.css";

const typeLabels = {
  approval: "Project update",
  rejection: "Project update",
  feedback: "Supervisor feedback",
  deadline: "Deadline reminder",
  meeting: "Meeting",
  request: "Request update",
  system: "Workspace update",
  general: "Notification",
};

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function getInternalLink(link) {
  return typeof link === "string" && link.startsWith("/") && !link.startsWith("//") ? link : null;
}

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { list = [], unreadCount = 0, loading, error } = useSelector((state) => state.notification || {});

  useEffect(() => {
    dispatch(fetchStudentNotifications());
  }, [dispatch]);

  return (
    <main className="student-notifications">
      <div className="student-notifications__inner">
        <header className="student-notifications__masthead"><span><Bell size={15} /> STUDENT FIELDNOTES <i /> WORKSPACE UPDATES</span><small>YOUR WORKSPACE / 05</small></header>
        <section className="student-notifications__intro">
          <span className="student-notifications__kicker"><Bell size={13} /> KEEP IN THE LOOP</span>
          <h1>Notes from your<br /><em>project desk.</em></h1>
          <p>Updates about your project and supervisor are gathered here so you can pick up the thread when you’re ready.</p>
        </section>
        <section className="student-notifications__panel" aria-labelledby="student-notifications-title">
          <header><div><span>RECENT ACTIVITY</span><h2 id="student-notifications-title">Notifications</h2></div><small>{unreadCount} UNREAD</small></header>
          {loading && <div className="student-notifications__state" role="status"><LoaderCircle className="student-notifications__spin" size={17} /> Loading notifications…</div>}
          {!loading && error && <div className="student-notifications__error" role="alert"><CircleHelp size={17} /><span>{error}</span><button type="button" onClick={() => dispatch(fetchStudentNotifications())}><RefreshCw size={13} /> Try again</button></div>}
          {!loading && !error && list.length === 0 && <div className="student-notifications__empty"><span><Check size={20} /></span><h3>You’re all caught up.</h3><p>New project and supervisor updates will appear here.</p></div>}
          {!loading && !error && list.length > 0 && <ul>{list.map((notification) => {
            const content = <><span className={`student-notifications__icon student-notifications__icon--${notification.priority || "low"}`}><Bell size={15} /></span><span className="student-notifications__copy"><small>{typeLabels[notification.type] || "Notification"}</small><strong>{notification.message}</strong><time dateTime={notification.createdAt || undefined}>{formatDate(notification.createdAt)}</time></span><ArrowUpRight className="student-notifications__arrow" size={15} /></>;
            return <li className={notification.isRead ? "is-read" : "is-unread"} key={notification._id}>{getInternalLink(notification.link) ? <Link to={getInternalLink(notification.link)}>{content}</Link> : <div>{content}</div>}</li>;
          })}</ul>}
        </section>
        <footer className="student-notifications__footer"><Link to="/student"><ArrowLeft size={14} /> Back to project desk</Link><Link to="/student/feedback">Supervisor feedback <ArrowUpRight size={13} /></Link></footer>
      </div>
    </main>
  );
}
