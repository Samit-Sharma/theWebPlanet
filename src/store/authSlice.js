import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

const wrap = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg);
  } catch (e) {
    return rejectWithValue(e.message);
  }
};

export const signup = createAsyncThunk("auth/signup", wrap(async (body) =>
  (await api("/api/auth/signup", { method: "POST", body })).user));

export const login = createAsyncThunk("auth/login", wrap(async (body) =>
  (await api("/api/auth/login", { method: "POST", body })).user));

export const fetchMe = createAsyncThunk("auth/me", wrap(async () =>
  (await api("/api/auth/me")).user));

export const logout = createAsyncThunk("auth/logout", wrap(async () => {
  await api("/api/auth/logout", { method: "POST" });
  return null;
}));

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    [signup, login].forEach((thunk) => {
      b.addCase(thunk.pending, (s) => { s.loading = true; s.error = null; })
       .addCase(thunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
       .addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    });
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; });
    b.addCase(logout.fulfilled, (s) => { s.user = null; });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
