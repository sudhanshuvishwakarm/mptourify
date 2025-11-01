import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE DISTRICT
export const createDistrict = createAsyncThunk(
    'district/createDistrict',
    async (districtData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/district', districtData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH ALL DISTRICTS
export const fetchDistricts = createAsyncThunk(
    'district/fetchDistricts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/district?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH DISTRICT BY SLUG
export const fetchDistrictBySlug = createAsyncThunk(
    'district/fetchDistrictBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/district/slug/${slug}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH DISTRICT BY ID
export const fetchDistrictById = createAsyncThunk(
    'district/fetchDistrictById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/district/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE DISTRICT
export const updateDistrict = createAsyncThunk(
    'district/updateDistrict',
    async ({ id, districtData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/district/${id}`, districtData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE DISTRICT
export const deleteDistrict = createAsyncThunk(
    'district/deleteDistrict',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/district/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH DISTRICT PANCHAYATS
export const fetchDistrictPanchayats = createAsyncThunk(
    'district/fetchDistrictPanchayats',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/district/${id}/panchayats`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH DISTRICT MEDIA
export const fetchDistrictMedia = createAsyncThunk(
    'district/fetchDistrictMedia',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/district/${id}/media`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH MAP COORDINATES
export const fetchMapCoordinates = createAsyncThunk(
    'district/fetchMapCoordinates',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/api/district/map/coordinates');
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    districts: [],
    selectedDistrict: null,
    mapDistricts: [],
    loading: false,
    error: null,
    success: false,
    totalDistricts: 0,
    currentPage: 1,
    totalPages: 1,
};

const districtSlice = createSlice({
    name: "district",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearDistrict: (state) => {
            state.districts = [];
            state.selectedDistrict = null;
            state.mapDistricts = [];
            state.error = null;
            state.loading = false;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE DISTRICT
            .addCase(createDistrict.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDistrict.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL DISTRICTS
            .addCase(fetchDistricts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.loading = false;
                state.districts = action.payload.districts || [];
                state.totalDistricts = action.payload.totalDistricts || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH DISTRICT BY SLUG
            .addCase(fetchDistrictBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDistrictBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDistrict = action.payload.district;
            })
            .addCase(fetchDistrictBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH DISTRICT BY ID
            .addCase(fetchDistrictById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDistrictById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDistrict = action.payload.district;
            })
            .addCase(fetchDistrictById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE DISTRICT
            .addCase(updateDistrict.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateDistrict.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE DISTRICT
            .addCase(deleteDistrict.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteDistrict.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(deleteDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH MAP COORDINATES
            .addCase(fetchMapCoordinates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMapCoordinates.fulfilled, (state, action) => {
                state.loading = false;
                state.mapDistricts = action.payload.districts || [];
            })
            .addCase(fetchMapCoordinates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearDistrict } = districtSlice.actions;
export default districtSlice.reducer;