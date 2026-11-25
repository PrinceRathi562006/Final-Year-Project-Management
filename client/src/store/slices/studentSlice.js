import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || error.message || fallback;

export const fetchStudentProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/project");
      return response.data.data?.project ?? null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not load your project."),
      );
    }
  },
);

export const fetchStudentDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/fetch-dashboard-stats");
      return response.data.data ?? {};
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not load your student dashboard."),
      );
    }
  },
);

export const fetchStudentFeedback = createAsyncThunk(
  "student/fetchFeedback",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/student/feedback/${encodeURIComponent(projectId)}`);
      return {
        projectId,
        feedback: response.data.data?.feedback ?? [],
        project: response.data.data?.project ?? null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not load project feedback."),
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
      return response.data.data?.project ?? null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Your proposal could not be submitted."),
      );
    }
  },
);

export const uploadProjectFiles = createAsyncThunk(
  "student/uploadProjectFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const response = await axiosInstance.post(
        `/student/upload/${projectId}`,
        formData,
      );
      return response.data.data?.project ?? null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Your files could not be uploaded."),
      );
    }
  },
);

export const fetchAvailableSupervisors = createAsyncThunk(
  "student/fetchAvailableSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/fetch-supervisors");
      return response.data.data?.supervisors ?? [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not load the supervisor directory."),
      );
    }
  },
);

export const fetchProject = fetchStudentProject;
export const fetchAllSupervisors = fetchAvailableSupervisors;

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/supervisor");
      return response.data.data?.supervisor ?? null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not load your supervisor."),
      );
    }
  },
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (request, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/request-supervisor",
        request,
      );
      return response.data.data?.request ?? null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Could not send your supervisor request."),
      );
    }
  },
);

export const uploadFiles = uploadProjectFiles;

const initialState = {
  project: null,
  files: [],
  supervisors: [],
  dashboardStats: null,
  isLoadingDashboardStats: false,
  dashboardStatsError: null,
  feedback: [],
  feedbackProject: null,
  isLoadingFeedback: false,
  feedbackError: null,
  supervisor: null,
  supervisorRequest: null,
  deadlines: [],
  status: null,
  isLoadingProject: false,
  isSubmittingProposal: false,
  isUploadingFiles: false,
  uploadError: null,
  projectError: null,
  proposalError: null,
  isLoadingSupervisors: false,
  supervisorsError: null,
  isLoadingSupervisor: false,
  supervisorError: null,
  isRequestingSupervisor: false,
  supervisorRequestError: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearProposalError(state) {
      state.proposalError = null;
    },
    clearSupervisorRequestError(state) {
      state.supervisorRequestError = null;
    },
    clearUploadError(state) {
      state.uploadError = null;
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
        state.projectError = action.payload || "Could not load your project.";
      })
      .addCase(fetchStudentDashboardStats.pending, (state) => {
        state.isLoadingProject = true;
        state.isLoadingDashboardStats = true;
        state.projectError = null;
        state.dashboardStatsError = null;
      })
      .addCase(fetchStudentDashboardStats.fulfilled, (state, action) => {
        state.isLoadingProject = false;
        state.isLoadingDashboardStats = false;
        state.dashboardStats = action.payload;
        state.project = action.payload.project ?? null;
      })
      .addCase(fetchStudentDashboardStats.rejected, (state, action) => {
        state.isLoadingProject = false;
        state.isLoadingDashboardStats = false;
        state.projectError = action.payload || "Could not load your student dashboard.";
        state.dashboardStatsError = state.projectError;
      })
      .addCase(fetchStudentFeedback.pending, (state) => {
        state.isLoadingFeedback = true;
        state.feedbackError = null;
        state.feedback = [];
        state.feedbackProject = null;
      })
      .addCase(fetchStudentFeedback.fulfilled, (state, action) => {
        state.isLoadingFeedback = false;
        state.feedback = action.payload.feedback;
        state.feedbackProject = action.payload.project;
      })
      .addCase(fetchStudentFeedback.rejected, (state, action) => {
        state.isLoadingFeedback = false;
        state.feedbackError = action.payload || "Could not load project feedback.";
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
        state.proposalError = action.payload || "Your proposal could not be submitted.";
      })
      .addCase(uploadProjectFiles.pending, (state) => {
        state.isUploadingFiles = true;
        state.uploadError = null;
      })
      .addCase(uploadProjectFiles.fulfilled, (state, action) => {
        state.isUploadingFiles = false;
        if (action.payload) state.project = action.payload;
      })
      .addCase(uploadProjectFiles.rejected, (state, action) => {
        state.isUploadingFiles = false;
        state.uploadError = action.payload || "Your files could not be uploaded.";
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
        state.supervisorsError = action.payload || "Could not load the supervisor directory.";
      })
      .addCase(getSupervisor.pending, (state) => {
        state.isLoadingSupervisor = true;
        state.supervisorError = null;
      })
      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.isLoadingSupervisor = false;
        state.supervisor = action.payload;
      })
      .addCase(getSupervisor.rejected, (state, action) => {
        state.isLoadingSupervisor = false;
        state.supervisorError = action.payload || "Could not load your supervisor.";
      })
      .addCase(requestSupervisor.pending, (state) => {
        state.isRequestingSupervisor = true;
        state.supervisorRequestError = null;
      })
      .addCase(requestSupervisor.fulfilled, (state, action) => {
        state.isRequestingSupervisor = false;
        state.supervisorRequest = action.payload;
      })
      .addCase(requestSupervisor.rejected, (state, action) => {
        state.isRequestingSupervisor = false;
        state.supervisorRequestError = action.payload || "Could not send your supervisor request.";
      });
  },
});

export const {
  clearProposalError,
  clearSupervisorRequestError,
  clearUploadError,
} = studentSlice.actions;

export default studentSlice.reducer;
