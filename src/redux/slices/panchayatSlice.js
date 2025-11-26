import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes for faster real-time updates

// CREATE PANCHAYAT
export const createPanchayat = createAsyncThunk(
    'panchayat/createPanchayat',
    async (panchayatData, { rejectWithValue }) => {
        try {
            let res;
            
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

// FETCH PANCHAYATS BY DISTRICT
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

// FETCH ALL PANCHAYATS
export const fetchPanchayats = createAsyncThunk(
    'panchayat/fetchPanchayats',
    async (params = {}, { rejectWithValue, getState }) => {
        const state = getState().panchayat;
        const now = Date.now();
        const cacheKey = JSON.stringify(params);
        
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

// FETCH PANCHAYAT BY ID
export const fetchPanchayatById = createAsyncThunk(
    'panchayat/fetchPanchayatById',
    async (id, { rejectWithValue, getState }) => {
        const state = getState().panchayat;
        const now = Date.now();
        
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

// FETCH MEDIA BY PANCHAYAT
export const fetchMediaByPanchayat = createAsyncThunk(
    'panchayat/fetchMediaByPanchayat',
    async ({ panchayatId, params = {} }, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/media/panchayat/${panchayatId}?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    panchayats: [],
    selectedPanchayat: null,
    media: [],
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
        },
        // Optimistic update for immediate UI feedback
        addPanchayatOptimistic: (state, action) => {
            state.panchayats.unshift({ ...action.payload, isOptimistic: true });
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
                
                // Remove optimistic entry and add real data
                state.panchayats = state.panchayats.filter(p => !p.isOptimistic);
                if (action.payload.panchayat) {
                    state.panchayats.unshift(action.payload.panchayat);
                }
                
                // Clear cache for fresh data
                state.panchayatsCache = {};
            })
          .addCase(createPanchayat.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || { message: 'Failed to create panchayat' };
    // Remove optimistic entry on error
    state.panchayats = state.panchayats.filter(p => !p.isOptimistic);
})
            // FETCH ALL PANCHAYATS
            .addCase(fetchPanchayats.pending, (state) => {
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
                
                if (!action.payload.fromCache && action.payload.id) {
                    state.panchayatCache[action.payload.id] = {
                        data: action.payload.panchayat,
                        lastFetched: Date.now()
                    };
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

            // FETCH MEDIA BY PANCHAYAT
            .addCase(fetchMediaByPanchayat.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMediaByPanchayat.fulfilled, (state, action) => {
                state.loading = false;
                state.media = action.payload.media || [];
            })
            .addCase(fetchMediaByPanchayat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch panchayat media';
            })

            // ADD RTC REPORT
            .addCase(addRTCReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRTCReport.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                if (action.payload.panchayat && action.payload.id) {
                    // Update selected panchayat
                    if (state.selectedPanchayat && state.selectedPanchayat._id === action.payload.id) {
                        state.selectedPanchayat = action.payload.panchayat;
                    }
                    
                    // Update cache
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
                
                if (action.payload.panchayat) {
                    // Update in list
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
                
                // Clear list cache for fresh data
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

export const { clearError, clearSuccess, clearPanchayat, clearCache, addPanchayatOptimistic } = panchayatSlice.actions;
export default panchayatSlice.reducer;











// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// // CREATE PANCHAYAT
// export const createPanchayat = createAsyncThunk(
//     'panchayat/createPanchayat',
//     async (panchayatData, { rejectWithValue }) => {
//         try {
//             let res;
            
//             // Check if it's FormData (file upload) or JSON
//             if (panchayatData instanceof FormData) {
//                 res = await axios.post('/api/panchayat', panchayatData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 });
//             } else {
//                 res = await axios.post('/api/panchayat', panchayatData);
//             }
            
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );
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



// // UPDATE PANCHAYAT
// export const updatePanchayat = createAsyncThunk(
//     'panchayat/updatePanchayat',
//     async ({ id, panchayatData }, { rejectWithValue }) => {
//         try {
//             let res;
            
//             // Check if it's FormData (file upload) or JSON
//             if (panchayatData instanceof FormData) {
//                 res = await axios.put(`/api/panchayat/${id}`, panchayatData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 });
//             } else {
//                 res = await axios.put(`/api/panchayat/${id}`, panchayatData);
//             }
            
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


// // FETCH MEDIA BY PANCHAYAT
// export const fetchMediaByPanchayat = createAsyncThunk(
//     'media/fetchMediaByPanchayat',
//     async ({ panchayatId, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media/panchayat/${panchayatId}?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     panchayats: [],
//     selectedPanchayat: null,
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
//           .addCase(createPanchayat.fulfilled, (state, action) => {
//   state.loading = false;
//   state.success = true;
  
//   // Remove optimistic entry and add real data
//   state.panchayats = state.panchayats.filter(p => !p.isOptimistic);
//   if (action.payload.panchayat) {
//     state.panchayats.unshift(action.payload.panchayat);
//   }
  
//   // Clear cache
//   state.panchayatsCache = {};
// })
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

//             //  FETCH MEDIA BY PANCHAYAT
//             .addCase(fetchMediaByPanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByPanchayat.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//             })
//             .addCase(fetchMediaByPanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to fetch panchayat media';
//             })


//             //  ADD RTC REPORT
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


//                         // FETCH BY DISTRICT
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
//             });
//     }
// });

// export const { clearError, clearSuccess, clearPanchayat, clearCache } = panchayatSlice.actions;
// export default panchayatSlice.reducer;
