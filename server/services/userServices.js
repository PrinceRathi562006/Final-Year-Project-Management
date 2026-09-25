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
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return await user.deleteOne();
};

const getAllUsers = async () => {
  const query = { role: { $ne: "Admin" } };

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 });

    return users;
};

module.exports = {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  getAllUsers
};
