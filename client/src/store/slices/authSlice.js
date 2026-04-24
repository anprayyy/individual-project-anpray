import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../constants/url";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${url}/auth/login`, form);
      localStorage.setItem("access_token", data.access_token);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${url}/auth/google-verify`, { token });
      localStorage.setItem("access_token", data.access_token);
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Google login failed";
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    error: "",
    token: localStorage.getItem("access_token") || null,
  },
  reducers: {
    clearError(state) {
      state.error = "";
    },
    setTokenFromUrl(state, action) {
      state.token = action.payload;
      localStorage.setItem("access_token", action.payload);
    },
    logout(state) {
      state.token = null;
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    // ── loginUser ──────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── googleLoginUser ────────────────────────────────────────────────────
    builder
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setTokenFromUrl, logout } = authSlice.actions;
export default authSlice.reducer;
