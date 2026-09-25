import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import "./ManageStudents.css";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);

  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);

  const [showModal, setShowModal] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterDepartment, setFilterDepartment] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      (u) => u.role?.toLowerCase() === "student",
    );

    return studentUsers.map((student) => {
      const studentProject = (projects || []).find(
        (p) => p.student?._id === student._id,
      );
      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((s) => s.department).filter(Boolean),
    );

    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    } else {
      dispatch(createStudent(formData));
    }
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });

    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <div className="manage-students-page">
      <div className="manage-students-content space-y-6">
        {/* HEADER */}
        <div className="students-hero card">
          <div className="students-hero__orb students-hero__orb--one" />
          <div className="students-hero__orb students-hero__orb--two" />
          <div className="students-hero__grid" />
          <div className="students-hero__content card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="students-hero__eyebrow">
                <GraduationCap aria-hidden="true" /> Academic directory
              </div>
              <h1 className="students-hero__title card-title">Manage Students</h1>
              <p className="card-subtitle">
                Add, edit, and manage students accounts
              </p>
            </div>

            <button
              onClick={() => dispatch(toggleStudentModal())}
              className="students-add-button btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <span className="students-add-button__icon"><Plus className="w-5 h-5" /></span>
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="students-stats grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="student-stat student-stat--total card">
            <div className="flex items-center">
              <div className="student-stat__icon p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>

              <div className="student-stat__content ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.length}
                </p>
                <p className="student-stat__detail">Registered in the directory</p>
              </div>
            </div>
            <span className="student-stat__accent" aria-hidden="true" />
          </div>

          <div className="student-stat student-stat--completed card">
            <div className="flex items-center">
              <div className="student-stat__icon p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>

              <div className="student-stat__content ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Completed Projects
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => s.status === "completed").length}
                </p>
                <p className="student-stat__detail">Ready for final review</p>
              </div>
            </div>
            <span className="student-stat__accent" aria-hidden="true" />
          </div>

          <div className="student-stat student-stat--unassigned card">
            <div className="flex items-center">
              <div className="student-stat__icon p-3 bg-blue-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>

              <div className="student-stat__content ml-4">
                <p className="text-sm font-medium text-slate-600">Unassigned</p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => !s.supervisor).length}
                </p>
                <p className="student-stat__detail">Awaiting a supervisor</p>
              </div>
            </div>
            <span className="student-stat__accent" aria-hidden="true" />
          </div>
        </div>

        {/* FILTERS */}
        <div className="students-toolbar card">
          <div className="students-toolbar__heading">
            <SlidersHorizontal aria-hidden="true" />
            <span>Find a student</span>
          </div>
          <div className="students-toolbar__controls flex flex-col md:flex-row gap-4">
            <div className="students-field students-field--search flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="student-search">
                Search Students
              </label>
              <div className="students-search-input">
                <Search aria-hidden="true" />
                <input
                  id="student-search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="students-field students-field--department w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="student-department">
                Department
              </label>
              <select
                id="student-department"
                className="w-full"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Department</option>
                {departments.map((dept) => (
                  <option value={dept} key={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="students-directory card">
          <div className="students-directory__header card-header">
            <div>
              <p className="students-directory__overline">Student registry</p>
              <h2 className="card-title">Student List</h2>
            </div>
            <span className="students-directory__count">
              {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"}
            </span>
          </div>
          <div className="students-table-wrap overflow-x-auto">
            {filteredStudents && filteredStudents.length > 0 ? (
              <table className="students-table w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Department & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredStudents.map((student) => {
                    return (
                      <tr key={student._id} className="student-row hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="student-profile">
                            <span className="student-avatar" aria-hidden="true">
                              {student.name?.charAt(0).toUpperCase() || "S"}
                            </span>
                            <div>
                              <div className="student-profile__name text-sm font-medium text-slate-900">
                              {student.name}
                              </div>
                              <div className="student-profile__email text-sm text-slate-500">
                              {student.email}
                              </div>
                              {student.studentId && (
                                <div className="student-profile__id text-xs text-slate-400">
                                ID: {student.studentId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="student-department text-sm text-slate-900">
                            {student.department || "--"}
                          </div>
                          <div className="student-year text-sm text-slate-500">
                            {student.createdAt
                              ? new Date(student.createdAt).getFullYear()
                              : "--"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.supervisor ? (
                            <span className="student-status student-status--assigned inline-flex items-center px-2 py-0.5 rounded-full text-green-800 bg-gray-100 text-xs font-medium">
                              <span className="student-status__dot" aria-hidden="true" />
                              {typeof student.supervisor === "object"
                                ? student.supervisor.name || "-"
                                : student.supervisor}
                            </span>
                          ) : (
                            <span className="student-status student-status--unassigned inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                              <span className="student-status__dot" aria-hidden="true" />
                              {student.projectStatus === "rejected"
                                ? "Rejected"
                                : "Not Assigned"}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className={`student-project text-sm text-slate-900${student.projectTitle ? "" : " student-project--empty"}`}>
                            {student.projectTitle || <><BookOpen aria-hidden="true" /> Awaiting project</>}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="student-actions flex space-x-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="student-action student-action--edit text-blue-600 hover:text-blue-900"
                              title={`Edit ${student.name}`}
                              aria-label={`Edit ${student.name}`}
                            >
                              <Pencil aria-hidden="true" /> <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="student-action student-action--delete text-red-600 hover:text-red-900"
                              title={`Delete ${student.name}`}
                              aria-label={`Delete ${student.name}`}
                            >
                              <Trash2 aria-hidden="true" /> <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              filteredStudents.length === 0 && (
                <div className="students-empty-state text-center py-8 text-slate-500">
                  <span className="students-empty-state__icon"><Search aria-hidden="true" /></span>
                  <p>No students found matching your criteria.</p>
                  <span>Try a different name, email, or department.</span>
                </div>
              )
            )}
          </div>

          {/* Edit Student Modal */}
          {showModal && (
            <div className="app-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="app-modal bg-white rounded-lg p-6 w-full max-w-md mx-4">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Student
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:to-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Edit Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Edit email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Edit Department */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>

                    <select
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      <option value="Computer Science & Engineering">
                        Computer Science & Engineering
                      </option>
                      <option value="Information Technology">
                        Information Technology
                      </option>
                      <option value="Artificial Intelligence & Machine Learning">
                        Artificial Intelligence & Machine Learning
                      </option>
                      <option value="Data Science">Data Science</option>
                      <option value="Electronics & Communication Engineering">
                        Electronics & Communication Engineering
                      </option>
                      <option value="Electrical Engineering">
                        Electrical Engineering
                      </option>
                      <option value="Mechanical Engineering">
                        Mechanical Engineering
                      </option>
                      <option value="Civil Engineering">
                        Civil Engineering
                      </option>
                      <option value="Chemical Engineering">
                        Chemical Engineering
                      </option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Bachelor of Business Administration">
                        Bachelor of Business Administration
                      </option>
                      <option value="Bachelor of Commerce">
                        Bachelor of Commerce
                      </option>
                      <option value="Bachelor of Computer Applications">
                        Bachelor of Computer Applications
                      </option>
                      <option value="Master of Computer Applications">
                        Master of Computer Applications
                      </option>
                      <option value="Master of Business Administration">
                        Master of Business Administration
                      </option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Management Studies">
                        Management Studies
                      </option>
                      <option value="Law">Law</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Hotel Management">Hotel Management</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-danger"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Student Modal */}
          {showDeleteModal && studentToDelete && (
            <div className="app-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="app-modal bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Delete Student
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure want to delete <span>{studentToDelete.name}? This action cannot be undone</span>
                  </p>

                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">Cancel</button>
                    <button onClick={confirmDelete} className="btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCreateStudentModalOpen && <AddStudent />}
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
