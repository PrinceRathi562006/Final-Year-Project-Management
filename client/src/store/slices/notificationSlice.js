import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const fetchStudentNotifications = createAsyncThunk(
  "notification/fetchStudentNotifications",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/notifications");
      return response.data.data ?? { notifications: [], unreadCount: 0 };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Could not load notifications.",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount ?? state.list.filter((item) => !item.isRead).length;
      })
      .addCase(fetchStudentNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not load notifications.";
      });
  },
});

export default notificationSlice.reducer;
