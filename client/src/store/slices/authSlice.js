import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// login
export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json"},
    });
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";

    toast.error(message);

    return thunkAPI.rejectWithValue(message);
  }
});

// forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/password/forgot",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/password/forgot", email);
      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send password reset link.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset Password.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// get user
export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get(`/auth/me`);
    return res.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch user",
    );
  }
});

// logout user
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.post(`/auth/logout`);
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to logout",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      // get user
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = null;
        state.error = action.payload;
      })
      // logout
      .addCase(logout.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoggingOut = false;
        state.authUser = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoggingOut = false;
        state.error = action.payload;
      })
      // forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isRequestingForToken = false;
        state.error = action.payload;
      })
      // reset password
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
        state.error = action.payload;
      })
  },
});

export default authSlice.reducer;
