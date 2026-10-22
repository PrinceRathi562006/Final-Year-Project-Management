const User = require("../models/User");

const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

const updateUser = async (id, updateData) =>
  User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

const getUserById = async (id) => {
  return await User.findById(id).select(
    "-password -resetPasswordToken -resetPasswordExpires",
  );
};

const deleteUser = async (id) => {
  const session = await User.startSession();
  let deletedUser;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(id).session(session);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      if (user.role === "Teacher") {
        await User.updateMany(
          { role: "Student", supervisor: user._id },
          { $set: { supervisor: null } },
          { session },
        );
      }

      if (user.role === "Student") {
        await User.updateMany(
          { role: "Teacher" },
          { $pull: { assignedStudents: user._id } },
          { session },
        );
      }

      await user.deleteOne({ session });
      deletedUser = user;
    });
  } finally {
    await session.endSession();
  }

  return deletedUser;
};

const assignSupervisor = async (studentId, supervisorId) => {
  const session = await User.startSession();
  let previousSupervisorId = null;

  try {
    await session.withTransaction(async () => {
      const student = await User.findById(studentId).session(session);
      if (!student || student.role !== "Student") {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
      }

      previousSupervisorId = student.supervisor ? String(student.supervisor) : null;
      if (previousSupervisorId === (supervisorId ? String(supervisorId) : null)) return;

      if (previousSupervisorId && supervisorId) {
        const error = new Error("Remove the current supervisor before assigning a new one");
        error.statusCode = 400;
        throw error;
      }

      if (supervisorId) {
        const teacher = await User.findById(supervisorId).session(session);
        if (!teacher || teacher.role !== "Teacher") {
          const error = new Error("Supervisor not found");
          error.statusCode = 404;
          throw error;
        }

        const assignedCount = await User.countDocuments({
          role: "Student",
          supervisor: teacher._id,
          _id: { $ne: student._id },
        }).session(session);
        if (Number(teacher.maxStudents) > 0 && assignedCount >= Number(teacher.maxStudents)) {
          const error = new Error(`${teacher.name} has reached their student capacity`);
          error.statusCode = 400;
          throw error;
        }

        await User.updateOne(
          { _id: teacher._id, role: "Teacher" },
          { $addToSet: { assignedStudents: student._id } },
          { session },
        );
      }

      if (previousSupervisorId) {
        await User.updateOne(
          { _id: previousSupervisorId, role: "Teacher" },
          { $pull: { assignedStudents: student._id } },
          { session },
        );
      }

      student.supervisor = supervisorId || null;
      await student.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const updatedStudent = await User.findById(studentId)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .populate("supervisor", "name email department role");
  const updatedTeacher = supervisorId
    ? await User.findById(supervisorId).select("-password -resetPasswordToken -resetPasswordExpires")
    : null;
  const previousTeacher = previousSupervisorId && previousSupervisorId !== (supervisorId ? String(supervisorId) : null)
    ? await User.findById(previousSupervisorId).select("-password -resetPasswordToken -resetPasswordExpires")
    : null;
  return { student: updatedStudent, teacher: updatedTeacher, previousTeacher };
};

const getAllUsers = async () => {
  const query = { role: { $ne: "Admin" } };

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .populate("supervisor", "name email department role")
    .sort({ createdAt: -1 });

    return users;
};

module.exports = {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  getAllUsers,
  assignSupervisor,
};
