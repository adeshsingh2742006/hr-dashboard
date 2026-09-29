import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchEmployees = createAsyncThunk("employees/fetch", async () => {
  const { data } = await api.get("/employees");
  return data;
});

const employeeSlice = createSlice({
  name: "employees",
  initialState: { items: [], loading: false },
  reducers: {
    applyStatusChange: (state, action) => {
      const { employeeId, isOnline } = action.payload;
      const emp = state.items.find((e) => e._id === employeeId);
      if (emp) emp.isOnline = isOnline;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; });
  },
});

export const { applyStatusChange } = employeeSlice.actions;
export default employeeSlice.reducer;
