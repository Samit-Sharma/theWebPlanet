import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

const wrap = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg);
  } catch (e) {
    return rejectWithValue(e.message);
  }
};

export const fetchTasks = createAsyncThunk("tasks/fetch", wrap(async ({ projectId, status, sortBy, order }) => {
  const q = new URLSearchParams({ status, sortBy, order }).toString();
  return (await api(`/api/projects/${projectId}/tasks?${q}`)).tasks;
}));

export const createTask = createAsyncThunk("tasks/create", wrap(async ({ projectId, ...body }) =>
  (await api(`/api/projects/${projectId}/tasks`, { method: "POST", body })).task));

export const updateTask = createAsyncThunk("tasks/update", wrap(async ({ id, ...body }) =>
  (await api(`/api/tasks/${id}`, { method: "PUT", body })).task));

export const deleteTask = createAsyncThunk("tasks/delete", wrap(async (id) => {
  await api(`/api/tasks/${id}`, { method: "DELETE" });
  return id;
}));

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearTasks(state) {
      state.items = [];
      state.error = null;
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(updateTask.fulfilled, (s, a) => {
       s.items = s.items.map((t) => (t._id === a.payload._id ? a.payload : t));
     })
     .addCase(deleteTask.fulfilled, (s, a) => {
       s.items = s.items.filter((t) => t._id !== a.payload);
     });
    [createTask, updateTask, deleteTask].forEach((t) =>
      b.addCase(t.rejected, (s, a) => { s.error = a.payload; })
    );
  },
});

export const { clearTasks, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
