import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// FETCH ALL MEDIA
export const fetchMedia = createAsyncThunk(
    'media/fetchMedia',
    async (params = {}, { rejectWithValue, getState }) => {
        const state = getState().media;
        const now = Date.now();
        const cacheKey = JSON.stringify(params);
        
        // Check if we have cached data
        if (state.mediaCache[cacheKey] && (now - state.mediaCache[cacheKey].lastFetched < CACHE_DURATION)) {
            return { ...state.mediaCache[cacheKey].data, fromCache: true };
        }
        
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/media?${queryString}`);
            return { ...res.data, fromCache: false, cacheKey };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH MEDIA BY ID
export const fetchMediaById = createAsyncThunk(
    'media/fetchMediaById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/media/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPLOAD MEDIA
export const uploadMedia = createAsyncThunk(
    'media/uploadMedia',
    async (mediaData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/media/upload', mediaData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE MEDIA
export const updateMedia = createAsyncThunk(
    'media/updateMedia',
    async ({ id, mediaData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/media/${id}`, mediaData);
            return { ...res.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE MEDIA
export const deleteMedia = createAsyncThunk(
    'media/deleteMedia',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/media/${id}`);
            return { ...res.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE MEDIA STATUS
export const updateMediaStatus = createAsyncThunk(
    'media/updateMediaStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/media/${id}/status`, { status });
            return { ...res.data, id, status };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// APPROVE MEDIA
export const approveMedia = createAsyncThunk(
    'media/approveMedia',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/media/${id}/approve`);
            return { ...res.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// REJECT MEDIA
export const rejectMedia = createAsyncThunk(
    'media/rejectMedia',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/media/${id}/reject`, { reason });
            return { ...res.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    media: [],
    selectedMedia: null,
    loading: false,
    error: null,
    success: false,
    totalMedia: 0,
    currentPage: 1,
    totalPages: 1,
    stats: {
        images: 0,
        videos: 0
    },
    lastFetched: null,
    mediaCache: {}
};

const mediaSlice = createSlice({
    name: "media",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearMedia: (state) => {
            state.media = [];
            state.selectedMedia = null;
            state.error = null;
            state.loading = false;
            state.success = false;
            state.mediaCache = {};
            state.lastFetched = null;
        },
        clearCache: (state) => {
            state.mediaCache = {};
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL MEDIA
            .addCase(fetchMedia.pending, (state) => {
                if (!state.media.length) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.media = action.payload.media || [];
                state.totalMedia = action.payload.totalMedia || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.stats = action.payload.stats || { images: 0, videos: 0 };
                
                // Cache the data
                if (!action.payload.fromCache && action.payload.cacheKey) {
                    state.mediaCache[action.payload.cacheKey] = {
                        data: {
                            media: action.payload.media,
                            totalMedia: action.payload.totalMedia,
                            currentPage: action.payload.currentPage,
                            totalPages: action.payload.totalPages,
                            stats: action.payload.stats
                        },
                        lastFetched: Date.now()
                    };
                }
                
                if (!action.payload.fromCache) {
                    state.lastFetched = Date.now();
                }
            })
            .addCase(fetchMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH MEDIA BY ID
            .addCase(fetchMediaById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMediaById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedMedia = action.payload.media;
            })
            .addCase(fetchMediaById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPLOAD MEDIA
            .addCase(uploadMedia.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                if (action.payload.media) {
                    state.media.unshift(action.payload.media);
                    state.totalMedia += 1;
                }
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE MEDIA
            .addCase(updateMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update in list
                if (action.payload.media) {
                    const idx = state.media.findIndex(m => m._id === action.payload.id);
                    if (idx !== -1) {
                        state.media[idx] = action.payload.media;
                    }
                    
                    // Update selected
                    if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
                        state.selectedMedia = action.payload.media;
                    }
                }
                
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(updateMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE MEDIA
            .addCase(deleteMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Remove from list
                state.media = state.media.filter(m => m._id !== action.payload.deletedId);
                state.totalMedia -= 1;
                
                // Update stats
                const deletedMedia = state.media.find(m => m._id === action.payload.deletedId);
                if (deletedMedia) {
                    if (deletedMedia.fileType === 'image') {
                        state.stats.images -= 1;
                    } else if (deletedMedia.fileType === 'video') {
                        state.stats.videos -= 1;
                    }
                }
                
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(deleteMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE MEDIA STATUS
            .addCase(updateMediaStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMediaStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update in list
                if (action.payload.media) {
                    const idx = state.media.findIndex(m => m._id === action.payload.id);
                    if (idx !== -1) {
                        state.media[idx] = action.payload.media;
                    }
                }
                
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(updateMediaStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // APPROVE MEDIA
            .addCase(approveMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(approveMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update in list
                if (action.payload.media) {
                    const idx = state.media.findIndex(m => m._id === action.payload.id);
                    if (idx !== -1) {
                        state.media[idx] = action.payload.media;
                    }
                    
                    // Update selected
                    if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
                        state.selectedMedia = action.payload.media;
                    }
                }
                
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(approveMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // REJECT MEDIA
            .addCase(rejectMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(rejectMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update in list
                if (action.payload.media) {
                    const idx = state.media.findIndex(m => m._id === action.payload.id);
                    if (idx !== -1) {
                        state.media[idx] = action.payload.media;
                    }
                    
                    // Update selected
                    if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
                        state.selectedMedia = action.payload.media;
                    }
                }
                
                // Clear cache
                state.mediaCache = {};
            })
            .addCase(rejectMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearMedia, clearCache } = mediaSlice.actions;
export default mediaSlice.reducer;
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
//             });
//     }
// });

// export const { clearError, clearSuccess, clearPanchayat, clearCache } = panchayatSlice.actions;
// export default panchayatSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// // UPLOAD MEDIA
// export const uploadMedia = createAsyncThunk(
//     'media/uploadMedia',
//     async (formData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/media/upload', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL MEDIA with caching
// export const fetchMedia = createAsyncThunk(
//     'media/fetchMedia',
//     async (params = {}, { rejectWithValue, getState }) => {
//         const state = getState().media;
//         const now = Date.now();
//         const cacheKey = JSON.stringify(params);
        
//         if (state.mediaCache[cacheKey] && (now - state.mediaCache[cacheKey].lastFetched < CACHE_DURATION)) {
//             return { ...state.mediaCache[cacheKey].data, fromCache: true };
//         }
        
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media?${queryString}`);
//             return { ...res.data, fromCache: false, cacheKey };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MEDIA BY ID with caching
// export const fetchMediaById = createAsyncThunk(
//     'media/fetchMediaById',
//     async (id, { rejectWithValue, getState }) => {
//         const state = getState().media;
//         const now = Date.now();
        
//         if (state.singleMediaCache[id] && (now - state.singleMediaCache[id].lastFetched < CACHE_DURATION)) {
//             return { media: state.singleMediaCache[id].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/media/${id}`);
//             return { ...res.data, fromCache: false, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE MEDIA
// export const updateMedia = createAsyncThunk(
//     'media/updateMedia',
//     async ({ id, mediaData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}`, mediaData);
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE MEDIA
// export const deleteMedia = createAsyncThunk(
//     'media/deleteMedia',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/media/${id}`);
//             return { ...res.data, mediaId: id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MEDIA BY DISTRICT
// export const fetchMediaByDistrict = createAsyncThunk(
//     'media/fetchMediaByDistrict',
//     async ({ districtId, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media/district/${districtId}?${queryString}`);
//             return res.data;
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

// // FETCH MEDIA BY CATEGORY
// export const fetchMediaByCategory = createAsyncThunk(
//     'media/fetchMediaByCategory',
//     async ({ category, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media/category/${category}?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // APPROVE MEDIA
// export const approveMedia = createAsyncThunk(
//     'media/approveMedia',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}/approve`);
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // REJECT MEDIA
// export const rejectMedia = createAsyncThunk(
//     'media/rejectMedia',
//     async ({ id, reason }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}/reject`, { reason });
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MEDIA STATS
// export const fetchMediaStats = createAsyncThunk(
//     'media/fetchMediaStats',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/media/stats');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     media: [],
//     selectedMedia: null,
//     loading: false,
//     uploadLoading: false,
//     error: null,
//     success: false,
//     totalMedia: 0,
//     currentPage: 1,
//     totalPages: 1,
//     stats: null,
//     lastFetched: null,
//     mediaCache: {},
//     singleMediaCache: {},
// };

// const mediaSlice = createSlice({
//     name: "media",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearMedia: (state) => {
//             state.media = [];
//             state.selectedMedia = null;
//             state.error = null;
//             state.loading = false;
//             state.uploadLoading = false;
//             state.success = false;
//             state.mediaCache = {};
//             state.singleMediaCache = {};
//         },
//         setCurrentPage: (state, action) => {
//             state.currentPage = action.payload;
//         },
//         clearCache: (state) => {
//             state.mediaCache = {};
//             state.singleMediaCache = {};
//             state.lastFetched = null;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // UPLOAD MEDIA
//             .addCase(uploadMedia.pending, (state) => {
//                 state.uploadLoading = true;
//                 state.error = null;
//                 state.success = false;
//             })
//             .addCase(uploadMedia.fulfilled, (state, action) => {
//                 state.uploadLoading = false;
//                 state.success = true;
//                 if (action.payload.media) {
//                     state.media.unshift(action.payload.media);
//                     state.totalMedia += 1;
//                 }
//                 state.mediaCache = {};
//             })
//             .addCase(uploadMedia.rejected, (state, action) => {
//                 state.uploadLoading = false;
//                 state.error = action.payload?.message || 'Upload failed';
//             })

//             // FETCH ALL MEDIA
//             .addCase(fetchMedia.pending, (state) => {
//                 if (!state.media.length) {
//                     state.loading = true;
//                 }
//                 state.error = null;
//             })
//             .addCase(fetchMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//                 state.totalMedia = action.payload.totalMedia || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//                 state.stats = action.payload.stats;
                
//                 if (!action.payload.fromCache && action.payload.cacheKey) {
//                     state.mediaCache[action.payload.cacheKey] = {
//                         data: {
//                             media: action.payload.media,
//                             totalMedia: action.payload.totalMedia,
//                             currentPage: action.payload.currentPage,
//                             totalPages: action.payload.totalPages,
//                             stats: action.payload.stats
//                         },
//                         lastFetched: Date.now()
//                     };
//                 }
                
//                 if (!action.payload.fromCache) {
//                     state.lastFetched = Date.now();
//                 }
//             })
//             .addCase(fetchMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to fetch media';
//             })

//             // FETCH MEDIA BY ID
//             .addCase(fetchMediaById.pending, (state) => {
//                 if (!state.selectedMedia) {
//                     state.loading = true;
//                 }
//             })
//             .addCase(fetchMediaById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedMedia = action.payload.media;
                
//                 if (!action.payload.fromCache && action.payload.id) {
//                     state.singleMediaCache[action.payload.id] = {
//                         data: action.payload.media,
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(fetchMediaById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to fetch media';
//             })

//             // UPDATE MEDIA
//             .addCase(updateMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 if (action.payload.media) {
//                     const idx = state.media.findIndex(m => m._id === action.payload.id);
//                     if (idx !== -1) {
//                         state.media[idx] = action.payload.media;
//                     }
                    
//                     if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
//                         state.selectedMedia = action.payload.media;
//                     }
                    
//                     state.singleMediaCache[action.payload.id] = {
//                         data: action.payload.media,
//                         lastFetched: Date.now()
//                     };
//                 }
                
//                 state.mediaCache = {};
//             })
//             .addCase(updateMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Update failed';
//             })

//             // DELETE MEDIA
//             .addCase(deleteMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.media = state.media.filter(m => m._id !== action.payload.mediaId);
//                 state.totalMedia -= 1;
//                 delete state.singleMediaCache[action.payload.mediaId];
//                 state.mediaCache = {};
//             })
//             .addCase(deleteMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Delete failed';
//             })

//             // FETCH BY DISTRICT
//             .addCase(fetchMediaByDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByDistrict.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//                 state.stats = action.payload.stats;
//             })
//             .addCase(fetchMediaByDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to fetch district media';
//             })

//             // FETCH BY PANCHAYAT
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

//             // FETCH BY CATEGORY
//             .addCase(fetchMediaByCategory.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByCategory.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//             })
//             .addCase(fetchMediaByCategory.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to fetch category media';
//             })

//             // APPROVE MEDIA
//             .addCase(approveMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(approveMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 if (action.payload.media) {
//                     const idx = state.media.findIndex(m => m._id === action.payload.id);
//                     if (idx !== -1) {
//                         state.media[idx] = action.payload.media;
//                     }
                    
//                     if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
//                         state.selectedMedia = action.payload.media;
//                     }
                    
//                     state.singleMediaCache[action.payload.id] = {
//                         data: action.payload.media,
//                         lastFetched: Date.now()
//                     };
//                 }
                
//                 state.mediaCache = {};
//             })
//             .addCase(approveMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Approval failed';
//             })

//             // REJECT MEDIA
//             .addCase(rejectMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(rejectMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 if (action.payload.media) {
//                     const idx = state.media.findIndex(m => m._id === action.payload.id);
//                     if (idx !== -1) {
//                         state.media[idx] = action.payload.media;
//                     }
                    
//                     if (state.selectedMedia && state.selectedMedia._id === action.payload.id) {
//                         state.selectedMedia = action.payload.media;
//                     }
                    
//                     state.singleMediaCache[action.payload.id] = {
//                         data: action.payload.media,
//                         lastFetched: Date.now()
//                     };
//                 }
                
//                 state.mediaCache = {};
//             })
//             .addCase(rejectMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Rejection failed';
//             })

//             // FETCH STATS
//             .addCase(fetchMediaStats.fulfilled, (state, action) => {
//                 state.stats = action.payload.stats;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearMedia, setCurrentPage, clearCache } = mediaSlice.actions;
// export default mediaSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // UPLOAD MEDIA
// export const uploadMedia = createAsyncThunk(
//     'media/uploadMedia',
//     async (formData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/media/upload', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL MEDIA
// export const fetchMedia = createAsyncThunk(
//     'media/fetchMedia',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MEDIA BY ID
// export const fetchMediaById = createAsyncThunk(
//     'media/fetchMediaById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/media/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE MEDIA
// export const updateMedia = createAsyncThunk(
//     'media/updateMedia',
//     async ({ id, mediaData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}`, mediaData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE MEDIA
// export const deleteMedia = createAsyncThunk(
//     'media/deleteMedia',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/media/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH MEDIA BY DISTRICT
// export const fetchMediaByDistrict = createAsyncThunk(
//     'media/fetchMediaByDistrict',
//     async ({ districtId, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media/district/${districtId}?${queryString}`);
//             return res.data;
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

// // FETCH MEDIA BY CATEGORY
// export const fetchMediaByCategory = createAsyncThunk(
//     'media/fetchMediaByCategory',
//     async ({ category, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/media/category/${category}?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // APPROVE MEDIA
// export const approveMedia = createAsyncThunk(
//     'media/approveMedia',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}/approve`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // REJECT MEDIA
// export const rejectMedia = createAsyncThunk(
//     'media/rejectMedia',
//     async ({ id, reason }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/media/${id}/reject`, { reason });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     media: [],
//     selectedMedia: null,
//     loading: false,
//     uploadLoading: false,
//     error: null,
//     success: false,
//     totalMedia: 0,
//     currentPage: 1,
//     totalPages: 1,
//     stats: null,
// };

// const mediaSlice = createSlice({
//     name: "media",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearMedia: (state) => {
//             state.media = [];
//             state.selectedMedia = null;
//             state.error = null;
//             state.loading = false;
//             state.uploadLoading = false;
//             state.success = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // UPLOAD MEDIA
//             .addCase(uploadMedia.pending, (state) => {
//                 state.uploadLoading = true;
//                 state.error = null;
//             })
//             .addCase(uploadMedia.fulfilled, (state) => {
//                 state.uploadLoading = false;
//                 state.success = true;
//             })
//             .addCase(uploadMedia.rejected, (state, action) => {
//                 state.uploadLoading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL MEDIA
//             .addCase(fetchMedia.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchMedia.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//                 state.totalMedia = action.payload.totalMedia || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//                 state.stats = action.payload.stats;
//             })
//             .addCase(fetchMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH MEDIA BY ID
//             .addCase(fetchMediaById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedMedia = action.payload.media;
//             })
//             .addCase(fetchMediaById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE MEDIA
//             .addCase(updateMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateMedia.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE MEDIA
//             .addCase(deleteMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteMedia.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deleteMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY DISTRICT
//             .addCase(fetchMediaByDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByDistrict.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//                 state.stats = action.payload.stats;
//             })
//             .addCase(fetchMediaByDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY PANCHAYAT
//             .addCase(fetchMediaByPanchayat.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByPanchayat.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//             })
//             .addCase(fetchMediaByPanchayat.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY CATEGORY
//             .addCase(fetchMediaByCategory.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchMediaByCategory.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.media = action.payload.media || [];
//             })
//             .addCase(fetchMediaByCategory.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // APPROVE MEDIA
//             .addCase(approveMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(approveMedia.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(approveMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // REJECT MEDIA
//             .addCase(rejectMedia.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(rejectMedia.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(rejectMedia.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearMedia } = mediaSlice.actions;
// export default mediaSlice.reducer;