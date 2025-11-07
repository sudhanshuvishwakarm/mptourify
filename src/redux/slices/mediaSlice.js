import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// UPLOAD MEDIA
export const uploadMedia = createAsyncThunk(
    'media/uploadMedia',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/media/upload', formData, {
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

// FETCH ALL MEDIA
export const fetchMedia = createAsyncThunk(
    'media/fetchMedia',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/media?${queryString}`);
            return res.data;
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

// UPDATE MEDIA
export const updateMedia = createAsyncThunk(
    'media/updateMedia',
    async ({ id, mediaData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/media/${id}`, mediaData);
            return res.data;
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
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH MEDIA BY DISTRICT
export const fetchMediaByDistrict = createAsyncThunk(
    'media/fetchMediaByDistrict',
    async ({ districtId, params = {} }, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/media/district/${districtId}?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH MEDIA BY PANCHAYAT
export const fetchMediaByPanchayat = createAsyncThunk(
    'media/fetchMediaByPanchayat',
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

// FETCH MEDIA BY CATEGORY
export const fetchMediaByCategory = createAsyncThunk(
    'media/fetchMediaByCategory',
    async ({ category, params = {} }, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/media/category/${category}?${queryString}`);
            return res.data;
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
            return res.data;
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
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH MEDIA STATS
export const fetchMediaStats = createAsyncThunk(
    'media/fetchMediaStats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/api/media/stats');
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    media: [],
    selectedMedia: null,
    loading: false,
    uploadLoading: false,
    error: null,
    success: false,
    totalMedia: 0,
    currentPage: 1,
    totalPages: 1,
    stats: null,
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
            state.uploadLoading = false;
            state.success = false;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // UPLOAD MEDIA
            .addCase(uploadMedia.pending, (state) => {
                state.uploadLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.success = true;
                state.media.unshift(action.payload.media);
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.uploadLoading = false;
                state.error = action.payload?.message || 'Upload failed';
            })

            // FETCH ALL MEDIA
            .addCase(fetchMedia.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.media = action.payload.media || [];
                state.totalMedia = action.payload.totalMedia || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.stats = action.payload.stats;
            })
            .addCase(fetchMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch media';
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
                state.error = action.payload?.message || 'Failed to fetch media';
            })

            // UPDATE MEDIA
            .addCase(updateMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.media.findIndex(media => media._id === action.payload.media._id);
                if (index !== -1) {
                    state.media[index] = action.payload.media;
                }
                if (state.selectedMedia && state.selectedMedia._id === action.payload.media._id) {
                    state.selectedMedia = action.payload.media;
                }
            })
            .addCase(updateMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Update failed';
            })

            // DELETE MEDIA
            .addCase(deleteMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.media = state.media.filter(media => media._id !== action.payload.mediaId);
            })
            .addCase(deleteMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Delete failed';
            })

            // FETCH BY DISTRICT
            .addCase(fetchMediaByDistrict.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMediaByDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.media = action.payload.media || [];
                state.stats = action.payload.stats;
            })
            .addCase(fetchMediaByDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch district media';
            })

            // FETCH BY PANCHAYAT
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

            // FETCH BY CATEGORY
            .addCase(fetchMediaByCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMediaByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.media = action.payload.media || [];
            })
            .addCase(fetchMediaByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch category media';
            })

            // APPROVE MEDIA
            .addCase(approveMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(approveMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.media.findIndex(media => media._id === action.payload.media._id);
                if (index !== -1) {
                    state.media[index] = action.payload.media;
                }
            })
            .addCase(approveMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Approval failed';
            })

            // REJECT MEDIA
            .addCase(rejectMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(rejectMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.media.findIndex(media => media._id === action.payload.media._id);
                if (index !== -1) {
                    state.media[index] = action.payload.media;
                }
            })
            .addCase(rejectMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Rejection failed';
            })

            // FETCH STATS
            .addCase(fetchMediaStats.fulfilled, (state, action) => {
                state.stats = action.payload.stats;
            });
    }
});

export const { clearError, clearSuccess, clearMedia, setCurrentPage } = mediaSlice.actions;
export default mediaSlice.reducer;// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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