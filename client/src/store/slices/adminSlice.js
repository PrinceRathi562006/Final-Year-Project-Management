import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { createDeadline } from "./deadlineSlice";
import {toast} from "react-toastify";
import {axiosInstance} from "../../lib/axios"

export const createStudent = createAsyncThunk("createStudent", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/admin/create-student", data);
    toast.success(res.data.message || "Student Created Successfully");
    return res.data.data.user
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to create Student"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const updateStudent = createAsyncThunk("updateStudent", async ({id, data}, thunkAPI) => {
  try {
    const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
    toast.success(res.data.message || "Student Updated Successfully");
    return res.data.data.user
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to update Student"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const deleteStudent = createAsyncThunk("deleteStudent", async (id, thunkAPI) => {
  try {
    const res = await axiosInstance.delete(`/admin/delete-student/${id}`);
    toast.success(res.data.message || "Student deleted Successfully");
    return id;
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to delete Student"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const createTeacher = createAsyncThunk("createTeacher", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/admin/create-teacher", data);
    toast.success(res.data.message || "Teacher Created Successfully");
    return res.data.data.users
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to create Teacher"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const updateTeacher = createAsyncThunk("updateTeacher", async ({id, data}, thunkAPI) => {
  try {
    const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
    toast.success(res.data.message || "Teacher Updated Successfully");
    return res.data.data.users
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to update Teacher"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const deleteTeacher = createAsyncThunk("deleteTeacher", async (id, thunkAPI) => {
  try {
    const res = await axiosInstance.delete(`/admin/delete-teacher/${id}`);
    toast.success(res.data.message || "Teacher deleted Successfully");
    return id;
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to delete Teacher"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

export const getAllUsers = createAsyncThunk("getAllUsers", async (id, thunkAPI) => {
  try {
    const res = await axiosInstance.get(`/admin/users`);
    return res.data.data;
  } catch (error){
    toast.error(
      error.response?.data?.message || "Failed to fetch users"
    );
    return thunkAPI.rejectWithValue(error.message?.data?.message);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(createStudent.fulfilled, (state, action) => {
      if(state.users) state.users.unshift(action.payload);
    })
    .addCase(updateStudent.fulfilled, (state, action) => {
      if(state.users) {
        state.users = state.users.map((u) => u._id === action.payload._id ? {...u, ...action.payload} : u);
      }
    })
    .addCase(deleteStudent.fulfilled, (state, action) => {
      if(state.users) state.users = state.users.filter( (u) => u._id !== action.payload )
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.users = action.payload.users;
    })
    .addCase(createTeacher.fulfilled, (state, action) => {
      if(state.users) state.users.unshift(action.payload);
    })
    .addCase(updateTeacher.fulfilled, (state, action) => {
      if(state.users) {
        state.users = state.users.map((u) => u._id === action.payload._id ? {...u, ...action.payload} : u);
      }
    })
    .addCase(deleteTeacher.fulfilled, (state, action) => {
      if(state.users) state.users = state.users.filter( (u) => u._id !== action.payload )
    })
  }
});

export default adminSlice.reducer;
