import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CREATE PANCHAYAT
export const createPanchayat = createAsyncThunk(
    'panchayat/createPanchayat',
    async (panchayatData, { rejectWithValue }) => {
        try {
            let res;
            
            // Check if it's FormData (file upload) or JSON
            if (panchayatData instanceof FormData) {
                res = await axios.post('/api/panchayat', panchayatData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                res = await axios.post('/api/panchayat', panchayatData);
            }
            
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
export const fetchPanchayatsByDistrict = createAsyncThunk(
    'panchayat/fetchPanchayatsByDistrict',
    async (districtId, { rejectWithValue, getState }) => {
        const state = getState().panchayat;
        const now = Date.now();
        const cacheKey = `district_${districtId}`;
        
        if (state.panchayatsCache[cacheKey] && (now - state.panchayatsCache[cacheKey].lastFetched < CACHE_DURATION)) {
            return { ...state.panchayatsCache[cacheKey].data, fromCache: true };
        }
        
        try {
            const res = await axios.get(`/api/panchayat/district/${districtId}`);
            return { ...res.data, fromCache: false, cacheKey };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH ALL PANCHAYATS with caching
export const fetchPanchayats = createAsyncThunk(
    'panchayat/fetchPanchayats',
    async (params = {}, { rejectWithValue, getState }) => {
        const state = getState().panchayat;
        const now = Date.now();
        const cacheKey = JSON.stringify(params);
        
        // Check if we have cached data
        if (state.panchayatsCache[cacheKey] && (now - state.panchayatsCache[cacheKey].lastFetched < CACHE_DURATION)) {
            return { ...state.panchayatsCache[cacheKey].data, fromCache: true };
        }
        
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/panchayat?${queryString}`);
            return { ...res.data, fromCache: false, cacheKey };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH PANCHAYAT BY ID with caching
export const fetchPanchayatById = createAsyncThunk(
    'panchayat/fetchPanchayatById',
    async (id, { rejectWithValue, getState }) => {
        const state = getState().panchayat;
        const now = Date.now();
        
        // Check cache by ID
        if (state.panchayatCache[id] && (now - state.panchayatCache[id].lastFetched < CACHE_DURATION)) {
            return { panchayat: state.panchayatCache[id].data, fromCache: true };
        }
        
        try {
            const res = await axios.get(`/api/panchayat/${id}`);
            return { ...res.data, fromCache: false, id };
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
            return { ...res.data, id };
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
            let res;
            
            // Check if it's FormData (file upload) or JSON
            if (panchayatData instanceof FormData) {
                res = await axios.put(`/api/panchayat/${id}`, panchayatData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                res = await axios.put(`/api/panchayat/${id}`, panchayatData);
            }
            
            return { ...res.data, id };
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
            return { ...res.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    panchayats: [],
    selectedPanchayat: null,
    loading: false,
    error: null,
    success: false,
    totalPanchayats: 0,
    currentPage: 1,
    totalPages: 1,
    lastFetched: null,
    panchayatsCache: {},
    panchayatCache: {},
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
            state.error = null;
            state.loading = false;
            state.success = false;
            state.panchayatsCache = {};
            state.panchayatCache = {};
            state.lastFetched = null;
        },
        clearCache: (state) => {
            state.panchayatsCache = {};
            state.panchayatCache = {};
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE PANCHAYAT
            .addCase(createPanchayat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPanchayat.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Add to list if returned
                if (action.payload.panchayat) {
                    state.panchayats.unshift(action.payload.panchayat);
                    state.totalPanchayats += 1;
                }
                // Clear cache
                state.panchayatsCache = {};
            })
            .addCase(createPanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL PANCHAYATS
            .addCase(fetchPanchayats.pending, (state) => {
                // Only show loading if no cached data
                if (!state.panchayats.length) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchPanchayats.fulfilled, (state, action) => {
                state.loading = false;
                state.panchayats = action.payload.panchayats || [];
                state.totalPanchayats = action.payload.totalPanchayats || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                
                // Cache the data
                if (!action.payload.fromCache && action.payload.cacheKey) {
                    state.panchayatsCache[action.payload.cacheKey] = {
                        data: {
                            panchayats: action.payload.panchayats,
                            totalPanchayats: action.payload.totalPanchayats,
                            currentPage: action.payload.currentPage,
                            totalPages: action.payload.totalPages
                        },
                        lastFetched: Date.now()
                    };
                }
                
                if (!action.payload.fromCache) {
                    state.lastFetched = Date.now();
                }
            })
            .addCase(fetchPanchayats.rejected, (state, action) => {
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
                
                // Cache by ID
                if (!action.payload.fromCache && action.payload.id) {
                    state.panchayatCache[action.payload.id] = {
                        data: action.payload.panchayat,
                        lastFetched: Date.now()
                    };
                    // Also cache by slug if available
                    if (action.payload.panchayat?.slug) {
                        state.panchayatCache[action.payload.panchayat.slug] = {
                            data: action.payload.panchayat,
                            lastFetched: Date.now()
                        };
                    }
                }
            })
            .addCase(fetchPanchayatById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            //  ADD RTC REPORT
            .addCase(addRTCReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRTCReport.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update cache if available
                if (action.payload.panchayat && action.payload.id) {
                    state.panchayatCache[action.payload.id] = {
                        data: action.payload.panchayat,
                        lastFetched: Date.now()
                    };
                }
            })
            .addCase(addRTCReport.rejected, (state, action) => {
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
                
                // Cache the data
                if (!action.payload.fromCache && action.payload.cacheKey) {
                    state.panchayatsCache[action.payload.cacheKey] = {
                        data: { panchayats: action.payload.panchayats },
                        lastFetched: Date.now()
                    };
                }
            })
            .addCase(fetchPanchayatsByDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE PANCHAYAT
            .addCase(updatePanchayat.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePanchayat.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update in list
                if (action.payload.panchayat) {
                    const idx = state.panchayats.findIndex(p => p._id === action.payload.id);
                    if (idx !== -1) {
                        state.panchayats[idx] = action.payload.panchayat;
                    }
                    
                    // Update selected
                    if (state.selectedPanchayat && state.selectedPanchayat._id === action.payload.id) {
                        state.selectedPanchayat = action.payload.panchayat;
                    }
                    
                    // Update cache
                    state.panchayatCache[action.payload.id] = {
                        data: action.payload.panchayat,
                        lastFetched: Date.now()
                    };
                    if (action.payload.panchayat.slug) {
                        state.panchayatCache[action.payload.panchayat.slug] = {
                            data: action.payload.panchayat,
                            lastFetched: Date.now()
                        };
                    }
                }
                
                // Clear list cache
                state.panchayatsCache = {};
            })
            .addCase(updatePanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE PANCHAYAT
            .addCase(deletePanchayat.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePanchayat.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Remove from list
                state.panchayats = state.panchayats.filter(p => p._id !== action.payload.deletedId);
                state.totalPanchayats -= 1;
                
                // Clear from cache
                delete state.panchayatCache[action.payload.deletedId];
                
                // Clear list cache
                state.panchayatsCache = {};
            })
            .addCase(deletePanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearPanchayat, clearCache } = panchayatSlice.actions;
export default panchayatSlice.reducer;



// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// // CREATE PANCHAYAT
// export const createPanchayat = createAsyncThunk(
//     'panchayat/createPanchayat',
//     async (panchayatData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/panchayat', panchayatData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL PANCHAYATS with caching
// export const fetchPanchayats = createAsyncThunk(
//     'panchayat/fetchPanchayats',
//     async (params = {}, { rejectWithValue, getState }) => {
//         const state = getState().panchayat;
//         const now = Date.now();
//         const cacheKey = JSON.stringify(params);
        
//         // Check if we have cached data
//         if (state.panchayatsCache[cacheKey] && (now - state.panchayatsCache[cacheKey].lastFetched < CACHE_DURATION)) {
//             return { ...state.panchayatsCache[cacheKey].data, fromCache: true };
//         }
        
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/panchayat?${queryString}`);
//             return { ...res.data, fromCache: false, cacheKey };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // SEARCH PANCHAYATS
// export const searchPanchayats = createAsyncThunk(
//     'panchayat/searchPanchayats',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/panchayat/search?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYAT BY SLUG with caching
// export const fetchPanchayatBySlug = createAsyncThunk(
//     'panchayat/fetchPanchayatBySlug',
//     async (slug, { rejectWithValue, getState }) => {
//         const state = getState().panchayat;
//         const now = Date.now();
        
//         // Check cache by slug
//         if (state.panchayatCache[slug] && (now - state.panchayatCache[slug].lastFetched < CACHE_DURATION)) {
//             return { panchayat: state.panchayatCache[slug].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/panchayat/slug/${slug}`);
//             return { ...res.data, fromCache: false, slug };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYAT BY ID with caching
// export const fetchPanchayatById = createAsyncThunk(
//     'panchayat/fetchPanchayatById',
//     async (id, { rejectWithValue, getState }) => {
//         const state = getState().panchayat;
//         const now = Date.now();
        
//         // Check cache by ID
//         if (state.panchayatCache[id] && (now - state.panchayatCache[id].lastFetched < CACHE_DURATION)) {
//             return { panchayat: state.panchayatCache[id].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/panchayat/${id}`);
//             return { ...res.data, fromCache: false, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PANCHAYAT
// export const updatePanchayat = createAsyncThunk(
//     'panchayat/updatePanchayat',
//     async ({ id, panchayatData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}`, panchayatData);
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE PANCHAYAT
// export const deletePanchayat = createAsyncThunk(
//     'panchayat/deletePanchayat',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/panchayat/${id}`);
//             return { ...res.data, deletedId: id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // ADD RTC REPORT
// export const addRTCReport = createAsyncThunk(
//     'panchayat/addRTCReport',
//     async ({ id, reportData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}/rtc-report`, reportData);
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PANCHAYAT STATUS
// export const updatePanchayatStatus = createAsyncThunk(
//     'panchayat/updatePanchayatStatus',
//     async ({ id, status }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}/status`, { status });
//             return { ...res.data, id, status };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYATS BY DISTRICT with caching
// export const fetchPanchayatsByDistrict = createAsyncThunk(
//     'panchayat/fetchPanchayatsByDistrict',
//     async (districtId, { rejectWithValue, getState }) => {
//         const state = getState().panchayat;
//         const now = Date.now();
//         const cacheKey = `district_${districtId}`;
        
//         if (state.panchayatsCache[cacheKey] && (now - state.panchayatsCache[cacheKey].lastFetched < CACHE_DURATION)) {
//             return { ...state.panchayatsCache[cacheKey].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/panchayat/district/${districtId}`);
//             return { ...res.data, fromCache: false, cacheKey };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYATS BY BLOCK with caching
// export const fetchPanchayatsByBlock = createAsyncThunk(
//     'panchayat/fetchPanchayatsByBlock',
//     async (blockName, { rejectWithValue, getState }) => {
//         const state = getState().panchayat;
//         const now = Date.now();
//         const cacheKey = `block_${blockName}`;
        
//         if (state.panchayatsCache[cacheKey] && (now - state.panchayatsCache[cacheKey].lastFetched < CACHE_DURATION)) {
//             return { ...state.panchayatsCache[cacheKey].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/panchayat/block/${blockName}`);
//             return { ...res.data, fromCache: false, cacheKey };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     panchayats: [],
//     selectedPanchayat: null,
//     searchResults: [],
//     loading: false,
//     error: null,
//     success: false,
//     totalPanchayats: 0,
//     currentPage: 1,
//     totalPages: 1,
//     lastFetched: null,
//     panchayatsCache: {},
//     panchayatCache: {},
// };

// const panchayatSlice = createSlice({
//     name: "panchayat",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearPanchayat: (state) => {
//             state.panchayats = [];
//             state.selectedPanchayat = null;
//             state.searchResults = [];
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//             state.panchayatsCache = {};
//             state.panchayatCache = {};
//             state.lastFetched = null;
//         },
//         clearCache: (state) => {
//             state.panchayatsCache = {};
//             state.panchayatCache = {};
//             state.lastFetched = null;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // CREATE PANCHAYAT
//             .addCase(createPanchayat.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createPanchayat.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 // Add to list if returned
//                 if (action.payload.panchayat) {
//                     state.panchayats.unshift(action.payload.panchayat);
//                     state.totalPanchayats += 1;
//                 }
//                 // Clear cache
//                 state.panchayatsCache = {};
//             })
//             .addCase(createPanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL PANCHAYATS
//             .addCase(fetchPanchayats.pending, (state) => {
//                 // Only show loading if no cached data
//                 if (!state.panchayats.length) {
//                     state.loading = true;
//                 }
//                 state.error = null;
//             })
//             .addCase(fetchPanchayats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
//                 state.totalPanchayats = action.payload.totalPanchayats || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
                
//                 // Cache the data
//                 if (!action.payload.fromCache && action.payload.cacheKey) {
//                     state.panchayatsCache[action.payload.cacheKey] = {
//                         data: {
//                             panchayats: action.payload.panchayats,
//                             totalPanchayats: action.payload.totalPanchayats,
//                             currentPage: action.payload.currentPage,
//                             totalPages: action.payload.totalPages
//                         },
//                         lastFetched: Date.now()
//                     };
//                 }
                
//                 if (!action.payload.fromCache) {
//                     state.lastFetched = Date.now();
//                 }
//             })
//             .addCase(fetchPanchayats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // SEARCH PANCHAYATS
//             .addCase(searchPanchayats.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(searchPanchayats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.searchResults = action.payload.panchayats || [];
//             })
//             .addCase(searchPanchayats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY SLUG
//             .addCase(fetchPanchayatBySlug.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatBySlug.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedPanchayat = action.payload.panchayat;
                
//                 // Cache by slug
//                 if (!action.payload.fromCache && action.payload.slug) {
//                     state.panchayatCache[action.payload.slug] = {
//                         data: action.payload.panchayat,
//                         lastFetched: Date.now()
//                     };
//                     // Also cache by ID if available
//                     if (action.payload.panchayat?._id) {
//                         state.panchayatCache[action.payload.panchayat._id] = {
//                             data: action.payload.panchayat,
//                             lastFetched: Date.now()
//                         };
//                     }
//                 }
//             })
//             .addCase(fetchPanchayatBySlug.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY ID
//             .addCase(fetchPanchayatById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedPanchayat = action.payload.panchayat;
                
//                 // Cache by ID
//                 if (!action.payload.fromCache && action.payload.id) {
//                     state.panchayatCache[action.payload.id] = {
//                         data: action.payload.panchayat,
//                         lastFetched: Date.now()
//                     };
//                     // Also cache by slug if available
//                     if (action.payload.panchayat?.slug) {
//                         state.panchayatCache[action.payload.panchayat.slug] = {
//                             data: action.payload.panchayat,
//                             lastFetched: Date.now()
//                         };
//                     }
//                 }
//             })
//             .addCase(fetchPanchayatById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE PANCHAYAT
//             .addCase(updatePanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updatePanchayat.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 // Update in list
//                 if (action.payload.panchayat) {
//                     const idx = state.panchayats.findIndex(p => p._id === action.payload.id);
//                     if (idx !== -1) {
//                         state.panchayats[idx] = action.payload.panchayat;
//                     }
                    
//                     // Update selected
//                     if (state.selectedPanchayat && state.selectedPanchayat._id === action.payload.id) {
//                         state.selectedPanchayat = action.payload.panchayat;
//                     }
                    
//                     // Update cache
//                     state.panchayatCache[action.payload.id] = {
//                         data: action.payload.panchayat,
//                         lastFetched: Date.now()
//                     };
//                     if (action.payload.panchayat.slug) {
//                         state.panchayatCache[action.payload.panchayat.slug] = {
//                             data: action.payload.panchayat,
//                             lastFetched: Date.now()
//                         };
//                     }
//                 }
                
//                 // Clear list cache
//                 state.panchayatsCache = {};
//             })
//             .addCase(updatePanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE PANCHAYAT
//             .addCase(deletePanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deletePanchayat.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 // Remove from list
//                 state.panchayats = state.panchayats.filter(p => p._id !== action.payload.deletedId);
//                 state.totalPanchayats -= 1;
                
//                 // Clear from cache
//                 delete state.panchayatCache[action.payload.deletedId];
                
//                 // Clear list cache
//                 state.panchayatsCache = {};
//             })
//             .addCase(deletePanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // ADD RTC REPORT
//             .addCase(addRTCReport.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(addRTCReport.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 // Update cache if available
//                 if (action.payload.panchayat && action.payload.id) {
//                     state.panchayatCache[action.payload.id] = {
//                         data: action.payload.panchayat,
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(addRTCReport.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE STATUS
//             .addCase(updatePanchayatStatus.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updatePanchayatStatus.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 // Update in list
//                 const idx = state.panchayats.findIndex(p => p._id === action.payload.id);
//                 if (idx !== -1 && action.payload.panchayat) {
//                     state.panchayats[idx] = action.payload.panchayat;
//                 }
                
//                 // Update cache
//                 if (state.panchayatCache[action.payload.id]) {
//                     state.panchayatCache[action.payload.id].data.status = action.payload.status;
//                 }
                
//                 // Clear list cache
//                 state.panchayatsCache = {};
//             })
//             .addCase(updatePanchayatStatus.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY DISTRICT
//             .addCase(fetchPanchayatsByDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatsByDistrict.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
                
//                 // Cache the data
//                 if (!action.payload.fromCache && action.payload.cacheKey) {
//                     state.panchayatsCache[action.payload.cacheKey] = {
//                         data: { panchayats: action.payload.panchayats },
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(fetchPanchayatsByDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY BLOCK
//             .addCase(fetchPanchayatsByBlock.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatsByBlock.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
                
//                 // Cache the data
//                 if (!action.payload.fromCache && action.payload.cacheKey) {
//                     state.panchayatsCache[action.payload.cacheKey] = {
//                         data: { panchayats: action.payload.panchayats },
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(fetchPanchayatsByBlock.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearPanchayat, clearCache } = panchayatSlice.actions;
// export default panchayatSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // CREATE PANCHAYAT
// export const createPanchayat = createAsyncThunk(
//     'panchayat/createPanchayat',
//     async (panchayatData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/panchayat', panchayatData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL PANCHAYATS
// export const fetchPanchayats = createAsyncThunk(
//     'panchayat/fetchPanchayats',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/panchayat?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // SEARCH PANCHAYATS
// export const searchPanchayats = createAsyncThunk(
//     'panchayat/searchPanchayats',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/panchayat/search?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYAT BY SLUG
// export const fetchPanchayatBySlug = createAsyncThunk(
//     'panchayat/fetchPanchayatBySlug',
//     async (slug, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/panchayat/slug/${slug}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYAT BY ID
// export const fetchPanchayatById = createAsyncThunk(
//     'panchayat/fetchPanchayatById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/panchayat/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PANCHAYAT
// export const updatePanchayat = createAsyncThunk(
//     'panchayat/updatePanchayat',
//     async ({ id, panchayatData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}`, panchayatData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE PANCHAYAT
// export const deletePanchayat = createAsyncThunk(
//     'panchayat/deletePanchayat',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/panchayat/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // ADD RTC REPORT
// export const addRTCReport = createAsyncThunk(
//     'panchayat/addRTCReport',
//     async ({ id, reportData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}/rtc-report`, reportData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PANCHAYAT STATUS
// export const updatePanchayatStatus = createAsyncThunk(
//     'panchayat/updatePanchayatStatus',
//     async ({ id, status }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/panchayat/${id}/status`, { status });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYATS BY DISTRICT
// export const fetchPanchayatsByDistrict = createAsyncThunk(
//     'panchayat/fetchPanchayatsByDistrict',
//     async (districtId, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/panchayat/district/${districtId}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH PANCHAYATS BY BLOCK
// export const fetchPanchayatsByBlock = createAsyncThunk(
//     'panchayat/fetchPanchayatsByBlock',
//     async (blockName, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/panchayat/block/${blockName}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     panchayats: [],
//     selectedPanchayat: null,
//     searchResults: [],
//     loading: false,
//     error: null,
//     success: false,
//     totalPanchayats: 0,
//     currentPage: 1,
//     totalPages: 1,
// };

// const panchayatSlice = createSlice({
//     name: "panchayat",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearPanchayat: (state) => {
//             state.panchayats = [];
//             state.selectedPanchayat = null;
//             state.searchResults = [];
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // CREATE PANCHAYAT
//             .addCase(createPanchayat.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createPanchayat.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(createPanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL PANCHAYATS
//             .addCase(fetchPanchayats.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchPanchayats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
//                 state.totalPanchayats = action.payload.totalPanchayats || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//             })
//             .addCase(fetchPanchayats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // SEARCH PANCHAYATS
//             .addCase(searchPanchayats.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(searchPanchayats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.searchResults = action.payload.panchayats || [];
//             })
//             .addCase(searchPanchayats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY SLUG
//             .addCase(fetchPanchayatBySlug.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatBySlug.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedPanchayat = action.payload.panchayat;
//             })
//             .addCase(fetchPanchayatBySlug.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY ID
//             .addCase(fetchPanchayatById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedPanchayat = action.payload.panchayat;
//             })
//             .addCase(fetchPanchayatById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE PANCHAYAT
//             .addCase(updatePanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updatePanchayat.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updatePanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE PANCHAYAT
//             .addCase(deletePanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deletePanchayat.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deletePanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // ADD RTC REPORT
//             .addCase(addRTCReport.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(addRTCReport.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(addRTCReport.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE STATUS
//             .addCase(updatePanchayatStatus.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updatePanchayatStatus.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updatePanchayatStatus.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY DISTRICT
//             .addCase(fetchPanchayatsByDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatsByDistrict.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
//             })
//             .addCase(fetchPanchayatsByDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY BLOCK
//             .addCase(fetchPanchayatsByBlock.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchPanchayatsByBlock.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.panchayats = action.payload.panchayats || [];
//             })
//             .addCase(fetchPanchayatsByBlock.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearPanchayat } = panchayatSlice.actions;
// export default panchayatSlice.reducer;