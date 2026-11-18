import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const fetchStudentProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/student/project");
      return response.data.data.project;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Could not load your proposal.",
      );
    }
  },
);

export const submitProposal = createAsyncThunk(
  "student/submitProposal",
  async (proposal, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/project-proposal",
        proposal,
      );
      return response.data.data.project;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Your proposal could not be submitted.",
      );
    }
  },
);

export const fetchAvailableSupervisors = createAsyncThunk(
  "student/fetchAvailableSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/fetch-supervisors");
      return response.data.data.supervisors || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Could not load the supervisor directory.",
      );
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
    isLoadingProject: false,
    isSubmittingProposal: false,
    projectError: null,
    proposalError: null,
    isLoadingSupervisors: false,
    supervisorsError: null,
  },
  reducers: {
    clearProposalError(state) {
      state.proposalError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProject.pending, (state) => {
        state.isLoadingProject = true;
        state.projectError = null;
      })
      .addCase(fetchStudentProject.fulfilled, (state, action) => {
        state.isLoadingProject = false;
        state.project = action.payload;
      })
      .addCase(fetchStudentProject.rejected, (state, action) => {
        state.isLoadingProject = false;
        state.projectError = action.payload;
      })
      .addCase(submitProposal.pending, (state) => {
        state.isSubmittingProposal = true;
        state.proposalError = null;
      })
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.isSubmittingProposal = false;
        state.project = action.payload;
      })
      .addCase(submitProposal.rejected, (state, action) => {
        state.isSubmittingProposal = false;
        state.proposalError = action.payload;
      })
      .addCase(fetchAvailableSupervisors.pending, (state) => {
        state.isLoadingSupervisors = true;
        state.supervisorsError = null;
      })
      .addCase(fetchAvailableSupervisors.fulfilled, (state, action) => {
        state.isLoadingSupervisors = false;
        state.supervisors = action.payload;
      })
      .addCase(fetchAvailableSupervisors.rejected, (state, action) => {
        state.isLoadingSupervisors = false;
        state.supervisorsError = action.payload;
      });
  },
});

export const { clearProposalError } = studentSlice.actions;

export default studentSlice.reducer;
