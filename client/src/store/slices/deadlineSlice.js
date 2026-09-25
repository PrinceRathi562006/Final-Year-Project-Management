import { createSlice } from "@reduxjs/toolkit";

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default deadlineSlice.reducer;
