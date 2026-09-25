import { useState } from "react";
import { useDispatch } from "react-redux";
import { createStudent } from "../../store/slices/adminSlice";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import { Eye, EyeOff, X } from "lucide-react";

const AddStudent = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createStudent(formData)).unwrap();
      setFormData({ name: "", email: "", department: "", password: "" });
      dispatch(toggleStudentModal());
    } catch {
      // The createStudent thunk displays the error message.
    }
  };

  return (
    <>
        <div className="app-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="app-modal bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Add Student
              </h3>
              <button
                onClick={() => dispatch(toggleStudentModal())}
                className="text-slate-400 hover:to-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              {/* Add Full Name */}
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

              {/* Add email */}
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

              {/* Add password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-field w-full py-1 pr-10 border-b border-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center text-slate-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Add Department */}
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
                  <option value="" disabled>
                    Select Department
                  </option>
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
                  <option value="Civil Engineering">Civil Engineering</option>
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
                  <option value="Management Studies">Management Studies</option>
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
                  onClick={() => dispatch(toggleStudentModal())}
                  className="btn-danger"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
    </>
  );
};

export default AddStudent;
