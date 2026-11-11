import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

const wrap = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg);
  } catch (e) {
    return rejectWithValue(e.message);
  }
};

export const fetchProjects = createAsyncThunk("projects/fetchAll", wrap(async () =>
  (await api("/api/projects")).projects));

export const fetchProject = createAsyncThunk("projects/fetchOne", wrap(async (id) =>
  (await api(`/api/projects/${id}`)).project));

export const createProject = createAsyncThunk("projects/create", wrap(async (body) =>
  (await api("/api/projects", { method: "POST", body })).project));

export const updateProject = createAsyncThunk("projects/update", wrap(async ({ id, ...body }) =>
  (await api(`/api/projects/${id}`, { method: "PUT", body })).project));

export const deleteProject = createAsyncThunk("projects/delete", wrap(async (id) => {
  await api(`/api/projects/${id}`, { method: "DELETE" });
  return id;
}));

const projectsSlice = createSlice({
  name: "projects",
  initialState: { items: [], current: null, loading: false, error: null },
  reducers: {
    clearProjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProjects.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchProject.pending, (s) => { s.current = null; s.error = null; })
     .addCase(fetchProject.fulfilled, (s, a) => { s.current = a.payload; })
     .addCase(fetchProject.rejected, (s, a) => { s.error = a.payload; })
     .addCase(createProject.fulfilled, (s, a) => { s.items.unshift(a.payload); })
     .addCase(updateProject.fulfilled, (s, a) => {
       s.items = s.items.map((p) => (p._id === a.payload._id ? a.payload : p));
       if (s.current && s.current._id === a.payload._id) s.current = a.payload;
     })
     .addCase(deleteProject.fulfilled, (s, a) => {
       s.items = s.items.filter((p) => p._id !== a.payload);
     });
    [createProject, updateProject, deleteProject].forEach((t) =>
      b.addCase(t.rejected, (s, a) => { s.error = a.payload; })
    );
  },
});

export const { clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
