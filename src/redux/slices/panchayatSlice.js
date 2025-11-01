import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE PANCHAYAT
export const createPanchayat = createAsyncThunk(
    'panchayat/createPanchayat',
    async (panchayatData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/panchayat', panchayatData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH ALL PANCHAYATS
export const fetchPanchayats = createAsyncThunk(
    'panchayat/fetchPanchayats',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/panchayat?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// SEARCH PANCHAYATS
export const searchPanchayats = createAsyncThunk(
    'panchayat/searchPanchayats',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/panchayat/search?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH PANCHAYAT BY SLUG
export const fetchPanchayatBySlug = createAsyncThunk(
    'panchayat/fetchPanchayatBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/panchayat/slug/${slug}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH PANCHAYAT BY ID
export const fetchPanchayatById = createAsyncThunk(
    'panchayat/fetchPanchayatById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/panchayat/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE PANCHAYAT
export const updatePanchayat = createAsyncThunk(
    'panchayat/updatePanchayat',
    async ({ id, panchayatData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/panchayat/${id}`, panchayatData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE PANCHAYAT
export const deletePanchayat = createAsyncThunk(
    'panchayat/deletePanchayat',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/panchayat/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ADD RTC REPORT
export const addRTCReport = createAsyncThunk(
    'panchayat/addRTCReport',
    async ({ id, reportData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/panchayat/${id}/rtc-report`, reportData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE PANCHAYAT STATUS
export const updatePanchayatStatus = createAsyncThunk(
    'panchayat/updatePanchayatStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/panchayat/${id}/status`, { status });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH PANCHAYATS BY DISTRICT
export const fetchPanchayatsByDistrict = createAsyncThunk(
    'panchayat/fetchPanchayatsByDistrict',
    async (districtId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/panchayat/district/${districtId}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH PANCHAYATS BY BLOCK
export const fetchPanchayatsByBlock = createAsyncThunk(
    'panchayat/fetchPanchayatsByBlock',
    async (blockName, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/panchayat/block/${blockName}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    panchayats: [],
    selectedPanchayat: null,
    searchResults: [],
    loading: false,
    error: null,
    success: false,
    totalPanchayats: 0,
    currentPage: 1,
    totalPages: 1,
};

const panchayatSlice = createSlice({
    name: "panchayat",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearPanchayat: (state) => {
            state.panchayats = [];
            state.selectedPanchayat = null;
            state.searchResults = [];
            state.error = null;
            state.loading = false;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE PANCHAYAT
            .addCase(createPanchayat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPanchayat.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createPanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL PANCHAYATS
            .addCase(fetchPanchayats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPanchayats.fulfilled, (state, action) => {
                state.loading = false;
                state.panchayats = action.payload.panchayats || [];
                state.totalPanchayats = action.payload.totalPanchayats || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(fetchPanchayats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // SEARCH PANCHAYATS
            .addCase(searchPanchayats.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchPanchayats.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload.panchayats || [];
            })
            .addCase(searchPanchayats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY SLUG
            .addCase(fetchPanchayatBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPanchayatBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPanchayat = action.payload.panchayat;
            })
            .addCase(fetchPanchayatBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY ID
            .addCase(fetchPanchayatById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPanchayatById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPanchayat = action.payload.panchayat;
            })
            .addCase(fetchPanchayatById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE PANCHAYAT
            .addCase(updatePanchayat.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePanchayat.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updatePanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE PANCHAYAT
            .addCase(deletePanchayat.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePanchayat.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(deletePanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ADD RTC REPORT
            .addCase(addRTCReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRTCReport.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(addRTCReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE STATUS
            .addCase(updatePanchayatStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePanchayatStatus.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updatePanchayatStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY DISTRICT
            .addCase(fetchPanchayatsByDistrict.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPanchayatsByDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.panchayats = action.payload.panchayats || [];
            })
            .addCase(fetchPanchayatsByDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY BLOCK
            .addCase(fetchPanchayatsByBlock.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPanchayatsByBlock.fulfilled, (state, action) => {
                state.loading = false;
                state.panchayats = action.payload.panchayats || [];
            })
            .addCase(fetchPanchayatsByBlock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearPanchayat } = panchayatSlice.actions;
export default panchayatSlice.reducer;