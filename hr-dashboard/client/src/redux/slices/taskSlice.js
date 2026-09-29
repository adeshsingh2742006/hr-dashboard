import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchTasks = createAsyncThunk("tasks/fetch", async () => {
  const { data } = await api.get("/tasks");
  return data;
});

export const createTask = createAsyncThunk("tasks/create", async (payload) => {
  const { data } = await api.post("/tasks", payload);
  return data;
});

export const startTask = createAsyncThunk("tasks/start", async (id) => {
  const { data } = await api.put(`/tasks/${id}/start`);
  return data;
});

export const pauseTask = createAsyncThunk("tasks/pause", async (id) => {
  const { data } = await api.put(`/tasks/${id}/pause`);
  return data;
});

export const completeTask = createAsyncThunk("tasks/complete", async (id) => {
  const { data } = await api.put(`/tasks/${id}/complete`);
  return data;
});

const taskSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false },
  reducers: {
    applyLiveUpdate: (state, action) => {
      const { taskId, status, timeSpent } = action.payload;
      const task = state.items.find((t) => t._id === taskId);
      if (task) {
        task.status = status;
        if (timeSpent !== undefined) task.timeSpent = timeSpent;
      }
    },
    addLiveTask: (state, action) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(startTask.fulfilled, (state, action) => {
        const i = state.items.findIndex((t) => t._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(pauseTask.fulfilled, (state, action) => {
        const i = state.items.findIndex((t) => t._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const i = state.items.findIndex((t) => t._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
      });
  },
});

export const { applyLiveUpdate, addLiveTask } = taskSlice.actions;
export default taskSlice.reducer;
