import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE DISTRICT
export const createDistrict = createAsyncThunk(
    'district/createDistrict',
    async (districtData, { rejectWithValue }) => {
        try {
            let res;
            
            // Check if it's FormData (file upload) or JSON
            if (districtData instanceof FormData) {
                res = await axios.post('/api/district', districtData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                res = await axios.post('/api/district', districtData);
            }
            
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

// FETCH DISTRICT STATS
export const fetchDistrictStats = createAsyncThunk(
    'district/fetchDistrictStats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/api/district/stats');
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
    stats: null,
    lastFetched: null,
    // For individual district data caching
    districtCache: {},
    mapLastFetched: null,
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
            state.districtCache = {};
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        // Clear cache for specific district
        clearDistrictCache: (state, action) => {
            if (action.payload) {
                delete state.districtCache[action.payload];
            } else {
                state.districtCache = {};
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE DISTRICT
            .addCase(createDistrict.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.lastFetched = Date.now();
                // Add new district to the list
                if (action.payload.district) {
                    state.districts.unshift(action.payload.district);
                    state.totalDistricts += 1;
                }
            })
            .addCase(createDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create district';
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
                state.lastFetched = Date.now();
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch districts';
            })

            // FETCH DISTRICT BY SLUG
            .addCase(fetchDistrictBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDistrictBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDistrict = action.payload.district;
                // Cache the district data
                if (action.payload.district) {
                    state.districtCache[action.payload.district.slug] = {
                        data: action.payload.district,
                        lastFetched: Date.now()
                    };
                }
                state.lastFetched = Date.now();
            })
            .addCase(fetchDistrictBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch district';
            })

            // FETCH DISTRICT BY ID
            .addCase(fetchDistrictById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDistrictById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDistrict = action.payload.district;
                // Cache the district data
                if (action.payload.district) {
                    state.districtCache[action.payload.district._id] = {
                        data: action.payload.district,
                        lastFetched: Date.now()
                    };
                }
                state.lastFetched = Date.now();
            })
            .addCase(fetchDistrictById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch district';
            })

            // UPDATE DISTRICT
            .addCase(updateDistrict.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(updateDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.lastFetched = Date.now();
                
                // Update district in districts list
                if (action.payload.district) {
                    const index = state.districts.findIndex(d => d._id === action.payload.district._id);
                    if (index !== -1) {
                        state.districts[index] = action.payload.district;
                    }
                    
                    // Update selected district if it's the same
                    if (state.selectedDistrict && state.selectedDistrict._id === action.payload.district._id) {
                        state.selectedDistrict = action.payload.district;
                    }
                    
                    // Update cache
                    state.districtCache[action.payload.district._id] = {
                        data: action.payload.district,
                        lastFetched: Date.now()
                    };
                    if (action.payload.district.slug) {
                        state.districtCache[action.payload.district.slug] = {
                            data: action.payload.district,
                            lastFetched: Date.now()
                        };
                    }
                }
            })
            .addCase(updateDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update district';
            })

            // DELETE DISTRICT
            .addCase(deleteDistrict.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(deleteDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.lastFetched = Date.now();
                
                // Remove district from list
                state.districts = state.districts.filter(d => d._id !== action.payload.districtId);
                state.totalDistricts -= 1;
                
                // Clear selected district if it's the deleted one
                if (state.selectedDistrict && state.selectedDistrict._id === action.payload.districtId) {
                    state.selectedDistrict = null;
                }
                
                // Clear from cache
                delete state.districtCache[action.payload.districtId];
            })
            .addCase(deleteDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete district';
            })

            // FETCH MAP COORDINATES
            .addCase(fetchMapCoordinates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMapCoordinates.fulfilled, (state, action) => {
                state.loading = false;
                state.mapDistricts = action.payload.districts || [];
                state.mapLastFetched = Date.now();
            })
            .addCase(fetchMapCoordinates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch map coordinates';
            })

            // FETCH DISTRICT PANCHAYATS
            .addCase(fetchDistrictPanchayats.fulfilled, (state, action) => {
                if (state.selectedDistrict && action.payload.panchayats) {
                    state.selectedDistrict.panchayats = action.payload.panchayats;
                }
            })

            // FETCH DISTRICT MEDIA
            .addCase(fetchDistrictMedia.fulfilled, (state, action) => {
                if (state.selectedDistrict && action.payload.media) {
                    state.selectedDistrict.media = action.payload.media;
                }
            })

            // FETCH DISTRICT STATS
            .addCase(fetchDistrictStats.fulfilled, (state, action) => {
                state.stats = action.payload.stats;
                state.lastFetched = Date.now();
            });
    }
});

export const { 
    clearError, 
    clearSuccess, 
    clearDistrict, 
    setCurrentPage, 
    clearDistrictCache
} = districtSlice.actions;

export default districtSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // // CREATE DISTRICT
// // export const createDistrict = createAsyncThunk(
// //     'district/createDistrict',
// //     async (districtData, { rejectWithValue }) => {
// //         try {
// //             const res = await axios.post('/api/district', districtData);
// //             return res.data;
// //         } catch (error) {
// //             return rejectWithValue(error.response?.data || error.message);
// //         }
// //     }
// // );
// export const createDistrict = createAsyncThunk(
//     'district/createDistrict',
//     async (districtData, { rejectWithValue }) => {
//         try {
//             let res;
            
//             // Check if it's FormData (file upload) or JSON
//             if (districtData instanceof FormData) {
//                 res = await axios.post('/api/district', districtData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 });
//             } else {
//                 res = await axios.post('/api/district', districtData);
//             }
            
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );
// // FETCH ALL DISTRICTS
// export const fetchDistricts = createAsyncThunk(
//     'district/fetchDistricts',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/district?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH DISTRICT BY SLUG
// export const fetchDistrictBySlug = createAsyncThunk(
//     'district/fetchDistrictBySlug',
//     async (slug, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/district/slug/${slug}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH DISTRICT BY ID
// export const fetchDistrictById = createAsyncThunk(
//     'district/fetchDistrictById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/district/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE DISTRICT
// export const updateDistrict = createAsyncThunk(
//     'district/updateDistrict',
//     async ({ id, districtData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/district/${id}`, districtData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE DISTRICT
// export const deleteDistrict = createAsyncThunk(
//     'district/deleteDistrict',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/district/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH DISTRICT PANCHAYATS
// export const fetchDistrictPanchayats = createAsyncThunk(
//     'district/fetchDistrictPanchayats',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/district/${id}/panchayats`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH DISTRICT MEDIA
// export const fetchDistrictMedia = createAsyncThunk(
//     'district/fetchDistrictMedia',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/district/${id}/media`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MAP COORDINATES
// export const fetchMapCoordinates = createAsyncThunk(
//     'district/fetchMapCoordinates',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/district/map/coordinates');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     districts: [],
//     selectedDistrict: null,
//     mapDistricts: [],
//     loading: false,
//     error: null,
//     success: false,
//     totalDistricts: 0,
//     currentPage: 1,
//     totalPages: 1,
//     lastFetched: null,
//     // For individual district data caching
//     districtCache: {},
//     mapLastFetched: null,
// };

// const districtSlice = createSlice({
//     name: "district",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearDistrict: (state) => {
//             state.districts = [];
//             state.selectedDistrict = null;
//             state.mapDistricts = [];
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // CREATE DISTRICT
//             .addCase(createDistrict.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createDistrict.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(createDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL DISTRICTS
//             .addCase(fetchDistricts.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchDistricts.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.districts = action.payload.districts || [];
//                 state.totalDistricts = action.payload.totalDistricts || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//             })
//             .addCase(fetchDistricts.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH DISTRICT BY SLUG
//             .addCase(fetchDistrictBySlug.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchDistrictBySlug.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedDistrict = action.payload.district;
//             })
//             .addCase(fetchDistrictBySlug.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH DISTRICT BY ID
//             .addCase(fetchDistrictById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchDistrictById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedDistrict = action.payload.district;
//             })
//             .addCase(fetchDistrictById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE DISTRICT
//             .addCase(updateDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateDistrict.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE DISTRICT
//             .addCase(deleteDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteDistrict.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deleteDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH MAP COORDINATES
//             .addCase(fetchMapCoordinates.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMapCoordinates.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.mapDistricts = action.payload.districts || [];
//             })
//             .addCase(fetchMapCoordinates.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearDistrict } = districtSlice.actions;
// export default districtSlice.reducer;