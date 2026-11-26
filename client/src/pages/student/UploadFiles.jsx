import { createElement, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileText,
  FolderUp,
  Presentation,
  FileCode2,
  LoaderCircle,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  clearUploadError,
  fetchStudentProject,
  uploadProjectFiles,
} from "../../store/slices/studentSlice";
import "./UploadFiles.css";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".rar", ".tar",
  ".jpg", ".jpeg", ".png", ".gif", ".txt", ".js", ".css", ".html", ".json",
]);
const FILE_SECTIONS = [
  { id: "report", title: "Report", description: "Upload your project report (PDF, DOC)", extensions: [".pdf", ".doc", ".docx"], Icon: FileText },
  { id: "presentation", title: "Presentation", description: "Upload your presentation (PPT, PPTX, PDF)", extensions: [".ppt", ".pptx", ".pdf"], Icon: Presentation },
  { id: "code", title: "Code Files", description: "Upload your source code (ZIP, RAR, TAR)", extensions: [".zip", ".rar", ".tar", ".js", ".css", ".html", ".json"], Icon: FileCode2 },
];

function getExtension(name = "") {
  return name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "Recently uploaded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently uploaded";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function fileIcon(fileName) {
  const extension = getExtension(fileName);
  if (extension === ".pdf") return FileText;
  if ([".ppt", ".pptx"].includes(extension)) return Presentation;
  if ([".doc", ".docx"].includes(extension)) return FileText;
  if ([".zip", ".rar", ".tar"].includes(extension)) return FileArchive;
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) return FileImage;
  if ([".js", ".css", ".html", ".json"].includes(extension)) return FileCode2;
  return FileText;
}

function fileIconClass(fileName) {
  const extension = getExtension(fileName);
  if (extension === ".pdf") return "pdf";
  if ([".ppt", ".pptx"].includes(extension)) return "presentation";
  if ([".doc", ".docx"].includes(extension)) return "document";
  if ([".zip", ".rar", ".tar"].includes(extension)) return "archive";
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) return "image";
  if ([".js", ".css", ".html", ".json"].includes(extension)) return "code";
  return "text";
}

function FileTypeIcon({ fileName, size = 18 }) {
  const Icon = fileIcon(fileName);
  const extension = getExtension(fileName).replace(".", "").slice(0, 4).toUpperCase() || "FILE";
  return <span className={`file-type-icon file-type-icon--${fileIconClass(fileName)}`} aria-hidden="true">
    <Icon size={size} strokeWidth={1.9} />
    <small>{extension}</small>
  </span>;
}

export default function UploadFiles() {
  const dispatch = useDispatch();
  const sectionInputRefs = useRef({});
  const { project, isLoadingProject, projectError, isUploadingFiles, uploadError } = useSelector((state) => state.student || {});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [fileActionError, setFileActionError] = useState("");
  const [fileAction, setFileAction] = useState(null);
  const [pendingDeleteFile, setPendingDeleteFile] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentProject());
  }, [dispatch]);

  const addFiles = (incomingFiles) => {
    setLocalError("");
    dispatch(clearUploadError());
    const validFiles = [];
    const errors = [];
    for (const file of incomingFiles) {
      if (!ACCEPTED_EXTENSIONS.has(getExtension(file.name))) {
        errors.push(`${file.name}: file type is not supported.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: maximum file size is 10 MB.`);
      } else {
        validFiles.push(file);
      }
    }
    const existingKeys = new Set(selectedFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    const uniqueFiles = validFiles.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    });
    const availableSlots = Math.max(0, MAX_FILES - selectedFiles.length);
    if (uniqueFiles.length > availableSlots) {
      errors.push(`You can upload up to ${MAX_FILES} files at a time.`);
    }
    setSelectedFiles((current) => [...current, ...uniqueFiles.slice(0, availableSlots)]);
    setLocalError(errors.join(" "));
  };

  const openSectionPicker = (section) => {
    const input = sectionInputRefs.current[section.id];
    if (input) input.click();
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles((current) => current.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!project?._id || selectedFiles.length === 0 || isUploadingFiles) return;
    setLocalError("");
    try {
      const updatedProject = await dispatch(uploadProjectFiles({
        projectId: project._id,
        files: selectedFiles,
      })).unwrap();
      const submittedCount = selectedFiles.length;
      setSelectedFiles([]);
      toast.success(`${submittedCount} ${submittedCount === 1 ? "file was" : "files were"} added to your project.`);
      if (!updatedProject) dispatch(fetchStudentProject());
    } catch {
      // Keep the selected files so the student can retry.
    }
  };

  const handleSavedFileAction = async (file, mode) => {
    if (!project?._id || !file?._id || fileAction) return;
    setFileAction({ fileId: file._id, mode });
    setFileActionError("");
    const previewWindow = mode === "view" ? window.open("about:blank", "_blank") : null;
    if (previewWindow) previewWindow.opener = null;
    if (mode === "view" && !previewWindow) {
      setFileActionError("Allow pop-ups to preview this file, or use Download instead.");
      setFileAction(null);
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/student/project/${encodeURIComponent(project._id)}/files/${encodeURIComponent(file._id)}${mode === "download" ? "/download" : ""}`,
        { responseType: "blob" },
      );
      const objectUrl = URL.createObjectURL(response.data);
      if (mode === "view") {
        previewWindow.location.replace(objectUrl);
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = file.originalName || "project-file";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      previewWindow?.close();
      let message = error.response?.data?.message || "The file could not be opened.";
      if (error.response?.data instanceof Blob) {
        try {
          const payload = JSON.parse(await error.response.data.text());
          message = payload.message || payload.error || message;
        } catch {
          // Keep the general message when the server response is not JSON.
        }
      }
      setFileActionError(message);
    } finally {
      setFileAction(null);
    }
  };

  const handleDeleteFile = async (file) => {
    if (!project?._id || !file?._id || fileAction) return;

    setFileAction({ fileId: file._id, mode: "delete" });
    setFileActionError("");
    try {
      await axiosInstance.delete(
        `/student/project/${encodeURIComponent(project._id)}/files/${encodeURIComponent(file._id)}`,
      );
      await dispatch(fetchStudentProject()).unwrap();
      setPendingDeleteFile(null);
      toast.success(`${file.originalName || "File"} was deleted from your project.`);
    } catch (error) {
      setFileActionError(error.response?.data?.message || "The file could not be deleted.");
    } finally {
      setFileAction(null);
    }
  };

  const savedFiles = project?.files || [];

  return (
    <main className="upload-files-page">
      <div className="upload-files-page__ambient" aria-hidden="true"><i /><i /><span /></div>
      <div className="upload-files-page__inner">
        <header className="upload-files-page__masthead"><span><BookOpen size={15} /> STUDENT FIELDNOTES <i /> PROJECT MATERIALS</span><small>UPLOAD / 03</small></header>
        <section className="upload-files-page__intro">
          <span className="upload-files-page__kicker"><FolderUp size={13} /> SUPPORTING MATERIAL</span>
          <h1>Bring your work<br />onto the <em>page.</em></h1>
          <p>Keep research, drafts, and project resources together. Add files to your current project whenever you’re ready.</p>
        </section>

        {isLoadingProject ? (
          <div className="upload-files-state" role="status"><LoaderCircle className="upload-files-state__spin" size={18} /> Loading your project...</div>
        ) : projectError ? (
          <div className="upload-files-state upload-files-state--error" role="alert"><CircleHelp size={18} /><span>{projectError}</span><button type="button" onClick={() => dispatch(fetchStudentProject())}>Try again</button></div>
        ) : !project ? (
          <section className="upload-files-empty">
            <span className="upload-files-empty__icon"><FileText size={22} /></span>
            <span className="upload-files-page__eyebrow">NO PROJECT REGISTERED</span>
            <h2>Start with a project proposal.</h2>
            <p>You’ll be able to upload supporting files after your proposal has been created.</p>
            <Link to="/student/submit-proposal">Go to proposal <ArrowRight size={15} /></Link>
          </section>
        ) : (
          <div className="upload-files-layout">
            <section className="upload-files-compose" aria-labelledby="upload-heading">
              <header className="upload-files-compose__heading"><span>01</span><div><small>PROJECT FILES</small><h2 id="upload-heading">Add material</h2></div><Upload size={19} /></header>
              <div className="upload-files-project"><span><FileText size={15} /></span><div><small>UPLOADING TO</small><strong>{project.title}</strong></div></div>

              <form onSubmit={handleSubmit}>
                <div className="upload-file-sections">
                  {FILE_SECTIONS.map(({ id, title, description, extensions, Icon }) => (
                    <section
                      className={`upload-file-section${isDragging ? " is-dragging" : ""}`}
                      key={id}
                      onDragOver={(event) => { event.preventDefault(); setIsDragging(id); }}
                      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
                      onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}
                    >
                      {createElement(Icon, { className: "upload-file-section__icon", size: 27, strokeWidth: 1.8 })}
                      <strong>{title}</strong>
                      <small>{description}</small>
                      <button type="button" onClick={() => openSectionPicker({ id })} disabled={isUploadingFiles}>Choose File</button>
                      <input
                        ref={(element) => { sectionInputRefs.current[id] = element; }}
                        className="upload-files-visually-hidden"
                        type="file"
                        multiple
                        accept={extensions.join(",")}
                        onChange={(event) => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }}
                      />
                    </section>
                  ))}
                </div>
                <small className="upload-file-guidance">Up to {MAX_FILES} files total · 10 MB per file</small>

                {selectedFiles.length > 0 && <div className="upload-queue"><div className="upload-queue__heading"><span>Ready to Upload</span><b>{selectedFiles.length}/{MAX_FILES}</b></div>{selectedFiles.map((file) => {
                  return <div className="upload-queue__item" key={`${file.name}-${file.size}-${file.lastModified}`}><FileTypeIcon fileName={file.name} /><span className="upload-queue__name"><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></span><button type="button" onClick={() => removeFile(file)} disabled={isUploadingFiles} aria-label={`Remove ${file.name}`}>Remove</button></div>;
                })}</div>}

                {(localError || uploadError) && <div className="upload-files-message upload-files-message--error" role="alert"><CircleHelp size={16} /><span>{localError || uploadError}</span></div>}
                <div className="upload-files-form-footer"><span><Paperclip size={13} /> Files stay attached to this project</span><button type="submit" disabled={!selectedFiles.length || isUploadingFiles}>{isUploadingFiles ? <><LoaderCircle className="upload-files-state__spin" size={15} /> Uploading...</> : <>Upload {selectedFiles.length || "files"} <ArrowRight size={15} /></>}</button></div>
              </form>
            </section>

            <aside className="upload-files-aside">
              <div className="upload-files-aside__art"><div className="upload-files-aside__folder"><span /><i /><i /><i /></div><div className="upload-files-aside__stamp"><Upload size={14} /> FILE<br />NOTES</div><div className="upload-files-aside__shadow" /></div>
              <span className="upload-files-page__eyebrow">A LITTLE ORGANIZATION</span>
              <h2>Good work, gathered.</h2>
              <p>Add helpful labels in each filename so your supervisor can quickly find the latest draft, dataset, or reference.</p>
              <div className="upload-files-aside__rules"><span><Check size={13} /> One upload can include up to 10 files</span><span><Check size={13} /> Each file can be up to 10 MB</span><span><Check size={13} /> Keep a copy of your originals</span></div>
            </aside>
          </div>
        )}

        {project && <section className="upload-files-saved" aria-labelledby="saved-files-heading">
          <header><div><span className="upload-files-page__eyebrow">PROJECT ARCHIVE</span><h2 id="saved-files-heading">Shared files</h2></div><span className="upload-files-saved__count">{savedFiles.length} {savedFiles.length === 1 ? "FILE" : "FILES"}</span></header>
          {fileActionError && !pendingDeleteFile && <div className="upload-files-message upload-files-message--error" role="alert"><CircleHelp size={16} /><span>{fileActionError}</span></div>}
          {pendingDeleteFile && <div className="upload-delete-confirm" role="alertdialog" aria-modal="false" aria-labelledby="upload-delete-title" aria-describedby="upload-delete-description">
            <span className="upload-delete-confirm__icon"><Trash2 size={18} /></span>
            <div className="upload-delete-confirm__copy"><strong id="upload-delete-title">Delete this project file?</strong><span id="upload-delete-description">“{pendingDeleteFile.originalName || "Project file"}” will be removed from your project archive.</span></div>
            <div className="upload-delete-confirm__actions"><button type="button" onClick={() => setPendingDeleteFile(null)} disabled={Boolean(fileAction)}>Keep file</button><button type="button" onClick={() => handleDeleteFile(pendingDeleteFile)} disabled={Boolean(fileAction)}>{fileAction?.mode === "delete" ? <><LoaderCircle className="upload-files-state__spin" size={14} /> Deleting…</> : "Delete file"}</button></div>
          </div>}
          {savedFiles.length ? <ul>{savedFiles.map((file, index) => {
            const isFileActionActive = fileAction?.fileId === file._id;
            return <li key={file._id || `${file.originalName}-${file.uploadedAt || index}`}><span className="upload-files-saved__icon"><FileTypeIcon fileName={file.originalName || ""} size={18} /></span><span className="upload-files-saved__name"><strong>{file.originalName || "Project file"}</strong><small>{formatDate(file.uploadedAt)} · {file.fileType || "File"}</small></span><span className="upload-files-saved__actions"><button type="button" onClick={() => handleSavedFileAction(file, "view")} disabled={!file._id || Boolean(fileAction)} title="View file" aria-label={`View ${file.originalName || "project file"}`}>{isFileActionActive && fileAction.mode === "view" ? <LoaderCircle className="upload-files-state__spin" size={15} /> : <Eye size={15} />}</button><button type="button" onClick={() => handleSavedFileAction(file, "download")} disabled={!file._id || Boolean(fileAction)} title="Download file" aria-label={`Download ${file.originalName || "project file"}`}>{isFileActionActive && fileAction.mode === "download" ? <LoaderCircle className="upload-files-state__spin" size={15} /> : <Download size={15} />}</button><button type="button" onClick={() => setPendingDeleteFile(file)} disabled={!file._id || Boolean(fileAction)} title="Delete file" aria-label={`Delete ${file.originalName || "project file"}`}>{isFileActionActive && fileAction.mode === "delete" ? <LoaderCircle className="upload-files-state__spin" size={15} /> : <Trash2 size={15} />}</button></span></li>;
          })}</ul> : <p className="upload-files-saved__empty">Files you upload will appear here.</p>}
        </section>}

        <footer className="upload-files-page__footer"><Link to="/student"><ArrowLeft size={14} /> Back to project desk</Link><span>PROJECT HUB <i /> STUDENT FIELDNOTES</span></footer>
      </div>
    </main>
  );
}
