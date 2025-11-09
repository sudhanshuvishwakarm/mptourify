import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE NEWS
export const createNews = createAsyncThunk(
    'news/createNews',
    async (newsData, { rejectWithValue }) => {
        try {
            // Check if newsData is FormData (file upload) or regular object (JSON)
            const headers = newsData instanceof FormData 
                ? { 'Content-Type': 'multipart/form-data' }
                : { 'Content-Type': 'application/json' };

            const res = await axios.post('/api/news', newsData, { headers });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE NEWS
export const updateNews = createAsyncThunk(
    'news/updateNews',
    async ({ id, newsData }, { rejectWithValue }) => {
        try {
            // Check if newsData is FormData (file upload) or regular object (JSON)
            const headers = newsData instanceof FormData 
                ? { 'Content-Type': 'multipart/form-data' }
                : { 'Content-Type': 'application/json' };

            const res = await axios.put(`/api/news/${id}`, newsData, { headers });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH ALL NEWS
export const fetchNews = createAsyncThunk(
    'news/fetchNews',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/news?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH LATEST NEWS
export const fetchLatestNews = createAsyncThunk(
    'news/fetchLatestNews',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/news/latest?limit=${limit}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH NEWS BY SLUG
export const fetchNewsBySlug = createAsyncThunk(
    'news/fetchNewsBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/news/slug/${slug}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH NEWS BY ID
export const fetchNewsById = createAsyncThunk(
    'news/fetchNewsById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/news/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE NEWS
export const deleteNews = createAsyncThunk(
    'news/deleteNews',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/news/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// PUBLISH NEWS
export const publishNews = createAsyncThunk(
    'news/publishNews',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/news/${id}/publish`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH NEWS BY CATEGORY
export const fetchNewsByCategory = createAsyncThunk(
    'news/fetchNewsByCategory',
    async ({ category, params = {} }, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/news/category/${category}?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH NEWS BY DISTRICT
export const fetchNewsByDistrict = createAsyncThunk(
    'news/fetchNewsByDistrict',
    async ({ districtId, params = {} }, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/news/district/${districtId}?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    news: [],
    latestNews: [],
    selectedNews: null,
    loading: false,
    error: null,
    success: false,
    totalNews: 0,
    currentPage: 1,
    totalPages: 1,
};

const newsSlice = createSlice({
    name: "news",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearNews: (state) => {
            state.news = [];
            state.latestNews = [];
            state.selectedNews = null;
            state.error = null;
            state.loading = false;
            state.success = false;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE NEWS
            .addCase(createNews.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createNews.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.news.unshift(action.payload.news);
            })
            .addCase(createNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create news';
            })

            // FETCH ALL NEWS
            .addCase(fetchNews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.loading = false;
                state.news = action.payload.news || [];
                state.totalNews = action.payload.totalNews || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch news';
            })

            // FETCH LATEST NEWS
            .addCase(fetchLatestNews.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLatestNews.fulfilled, (state, action) => {
                state.loading = false;
                state.latestNews = action.payload.news || [];
            })
            .addCase(fetchLatestNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch latest news';
            })

            // FETCH NEWS BY SLUG
            .addCase(fetchNewsBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedNews = action.payload.news;
            })
            .addCase(fetchNewsBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch news';
            })

            // FETCH NEWS BY ID
            .addCase(fetchNewsById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNewsById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedNews = action.payload.news;
            })
            .addCase(fetchNewsById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch news';
            })

            // UPDATE NEWS
            .addCase(updateNews.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateNews.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.news.findIndex(item => item._id === action.payload.news._id);
                if (index !== -1) {
                    state.news[index] = action.payload.news;
                }
                if (state.selectedNews && state.selectedNews._id === action.payload.news._id) {
                    state.selectedNews = action.payload.news;
                }
            })
            .addCase(updateNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Update failed';
            })

            // DELETE NEWS
            .addCase(deleteNews.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteNews.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.news = state.news.filter(item => item._id !== action.payload.deletedNews?.id);
            })
            .addCase(deleteNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Delete failed';
            })

            // PUBLISH NEWS
            .addCase(publishNews.pending, (state) => {
                state.loading = true;
            })
            .addCase(publishNews.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.news.findIndex(item => item._id === action.payload.news._id);
                if (index !== -1) {
                    state.news[index] = action.payload.news;
                }
            })
            .addCase(publishNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Publish failed';
            })

            // FETCH BY CATEGORY
            .addCase(fetchNewsByCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNewsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.news = action.payload.news || [];
                state.totalNews = action.payload.totalNews || 0;
            })
            .addCase(fetchNewsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch category news';
            })

            // FETCH BY DISTRICT
            .addCase(fetchNewsByDistrict.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNewsByDistrict.fulfilled, (state, action) => {
                state.loading = false;
                state.news = action.payload.news || [];
            })
            .addCase(fetchNewsByDistrict.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch district news';
            });
    }
});

export const { clearError, clearSuccess, clearNews, setCurrentPage } = newsSlice.actions;
export default newsSlice.reducer;// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // CREATE NEWS
// export const createNews = createAsyncThunk(
//     'news/createNews',
//     async (newsData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/news', newsData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL NEWS
// export const fetchNews = createAsyncThunk(
//     'news/fetchNews',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/news?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH LATEST NEWS
// export const fetchLatestNews = createAsyncThunk(
//     'news/fetchLatestNews',
//     async (limit = 5, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/news/latest?limit=${limit}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH NEWS BY SLUG
// export const fetchNewsBySlug = createAsyncThunk(
//     'news/fetchNewsBySlug',
//     async (slug, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/news/slug/${slug}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH NEWS BY ID
// export const fetchNewsById = createAsyncThunk(
//     'news/fetchNewsById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/news/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE NEWS
// export const updateNews = createAsyncThunk(
//     'news/updateNews',
//     async ({ id, newsData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/news/${id}`, newsData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE NEWS
// export const deleteNews = createAsyncThunk(
//     'news/deleteNews',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/news/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // PUBLISH NEWS
// export const publishNews = createAsyncThunk(
//     'news/publishNews',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/news/${id}/publish`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH NEWS BY CATEGORY
// export const fetchNewsByCategory = createAsyncThunk(
//     'news/fetchNewsByCategory',
//     async ({ category, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/news/category/${category}?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH NEWS BY DISTRICT
// export const fetchNewsByDistrict = createAsyncThunk(
//     'news/fetchNewsByDistrict',
//     async ({ districtId, params = {} }, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/news/district/${districtId}?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     news: [],
//     latestNews: [],
//     selectedNews: null,
//     loading: false,
//     error: null,
//     success: false,
//     totalNews: 0,
//     currentPage: 1,
//     totalPages: 1,
// };

// const newsSlice = createSlice({
//     name: "news",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearNews: (state) => {
//             state.news = [];
//             state.latestNews = [];
//             state.selectedNews = null;
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // CREATE NEWS
//             .addCase(createNews.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createNews.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(createNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL NEWS
//             .addCase(fetchNews.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchNews.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.news = action.payload.news || [];
//                 state.totalNews = action.payload.totalNews || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//             })
//             .addCase(fetchNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH LATEST NEWS
//             .addCase(fetchLatestNews.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchLatestNews.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.latestNews = action.payload.news || [];
//             })
//             .addCase(fetchLatestNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH NEWS BY SLUG
//             .addCase(fetchNewsBySlug.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedNews = action.payload.news;
//             })
//             .addCase(fetchNewsBySlug.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH NEWS BY ID
//             .addCase(fetchNewsById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchNewsById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedNews = action.payload.news;
//             })
//             .addCase(fetchNewsById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE NEWS
//             .addCase(updateNews.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateNews.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE NEWS
//             .addCase(deleteNews.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteNews.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deleteNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // PUBLISH NEWS
//             .addCase(publishNews.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(publishNews.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(publishNews.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY CATEGORY
//             .addCase(fetchNewsByCategory.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchNewsByCategory.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.news = action.payload.news || [];
//                 state.totalNews = action.payload.totalNews || 0;
//             })
//             .addCase(fetchNewsByCategory.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH BY DISTRICT
//             .addCase(fetchNewsByDistrict.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchNewsByDistrict.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.news = action.payload.news || [];
//             })
//             .addCase(fetchNewsByDistrict.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearNews } = newsSlice.actions;
// export default newsSlice.reducer;