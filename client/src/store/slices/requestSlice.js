import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "request",
  initialState: {
    list: [],
    selected: null,
  },
  reducers: {},
});

export default requestSlice.reducer;
