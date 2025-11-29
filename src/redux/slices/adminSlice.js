import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 1 * 60 * 1000; // 1 minute (reduced from 5 minutes)

// REGISTER ADMIN
export const registerAdmin = createAsyncThunk(
    'admin/registerAdmin',
    async (adminData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/admin/register', adminData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// LOGIN ADMIN
export const loginAdmin = createAsyncThunk(
    'admin/loginAdmin',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/admin/login', credentials);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// LOGOUT ADMIN
export const logoutAdmin = createAsyncThunk(
    'admin/logoutAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/api/admin/logout');
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// GET PROFILE with caching
export const getProfile = createAsyncThunk(
    'admin/getProfile',
    async (_, { rejectWithValue, getState }) => {
        const state = getState().admin;
        const now = Date.now();
        
        if (state.currentAdmin && state.profileLastFetched && (now - state.profileLastFetched < CACHE_DURATION)) {
            return { admin: state.currentAdmin, fromCache: true };
        }
        
        try {
            const res = await axios.get('/api/admin/profile');
            return { ...res.data, fromCache: false };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE PROFILE
export const updateProfile = createAsyncThunk(
    'admin/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const res = await axios.put('/api/admin/profile', profileData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// GET ALL ADMINS with caching - BUT FORCE REFRESH WHEN NEEDED
export const fetchAllAdmins = createAsyncThunk(
    'admin/fetchAllAdmins',
    async (params = {}, { rejectWithValue, getState }) => {
        const state = getState().admin;
        const now = Date.now();
        const cacheKey = JSON.stringify(params);
        
        // Check if we should force refresh (e.g., after creating new user)
        const shouldForceRefresh = params.forceRefresh || state.forceRefresh;
        
        if (!shouldForceRefresh && state.adminsCache[cacheKey] && (now - state.adminsCache[cacheKey].lastFetched < CACHE_DURATION)) {
            return { ...state.adminsCache[cacheKey].data, fromCache: true };
        }
        
        try {
            // Remove forceRefresh from params before sending to API
            const { forceRefresh, ...apiParams } = params;
            const queryString = new URLSearchParams(apiParams).toString();
            const res = await axios.get(`/api/admin/all?${queryString}`);
            return { ...res.data, fromCache: false, cacheKey };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// GET ADMIN BY ID
export const fetchAdminById = createAsyncThunk(
    'admin/fetchAdminById',
    async (id, { rejectWithValue, getState }) => {
        const state = getState().admin;
        const now = Date.now();
        
        if (state.adminCache[id] && (now - state.adminCache[id].lastFetched < CACHE_DURATION)) {
            return { admin: state.adminCache[id].data, fromCache: true };
        }
        
        try {
            const res = await axios.get(`/api/admin/${id}`);
            return { ...res.data, fromCache: false, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE ADMIN
export const updateAdmin = createAsyncThunk(
    'admin/updateAdmin',
    async ({ id, adminData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/admin/${id}`, adminData);
            return { ...res.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE ADMIN
export const deleteAdmin = createAsyncThunk(
    'admin/deleteAdmin',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/admin/${id}`);
            return { ...res.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE ADMIN STATUS
export const updateAdminStatus = createAsyncThunk(
    'admin/updateAdminStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/admin/${id}/status`, { status });
            return { ...res.data, id, status };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    currentAdmin: null,
    admins: [],
    selectedAdmin: null,
    stats: null,
    loading: false,
    error: null,
    success: false,
    isAuthenticated: false,
    profileLastFetched: null,
    adminsCache: {},
    adminCache: {},
    forceRefresh: false, // NEW: Force refresh flag
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearAdmin: (state) => {
            state.currentAdmin = null;
            state.admins = [];
            state.selectedAdmin = null;
            state.error = null;
            state.loading = false;
            state.success = false;
            state.isAuthenticated = false;
            state.adminsCache = {};
            state.adminCache = {};
            state.profileLastFetched = null;
            state.forceRefresh = false;
        },
        clearCache: (state) => {
            state.adminsCache = {};
            state.adminCache = {};
            state.profileLastFetched = null;
        },
        // NEW: Force refresh action
        forceRefreshAdmins: (state) => {
            state.forceRefresh = true;
            state.adminsCache = {};
        },
        // NEW: Reset force refresh
        resetForceRefresh: (state) => {
            state.forceRefresh = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(registerAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerAdmin.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                // Force refresh on next fetch
                state.forceRefresh = true;
                state.adminsCache = {};
            })
            .addCase(registerAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOGIN
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isAuthenticated = true;
                state.currentAdmin = action.payload.admin;
                state.profileLastFetched = Date.now();
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })

            // LOGOUT
            .addCase(logoutAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutAdmin.fulfilled, (state) => {
                state.loading = false;
                state.currentAdmin = null;
                state.isAuthenticated = false;
                state.success = true;
                state.adminsCache = {};
                state.adminCache = {};
                state.profileLastFetched = null;
                state.forceRefresh = false;
            })
            .addCase(logoutAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET PROFILE
            .addCase(getProfile.pending, (state) => {
                if (!state.currentAdmin) {
                    state.loading = true;
                }
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAdmin = action.payload.admin;
                state.isAuthenticated = true;
                if (!action.payload.fromCache) {
                    state.profileLastFetched = Date.now();
                }
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.currentAdmin = null;
                state.error = action.payload;
            })

            // UPDATE PROFILE
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentAdmin = action.payload.admin;
                state.profileLastFetched = Date.now();
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET ALL ADMINS
            .addCase(fetchAllAdmins.pending, (state) => {
                if (!state.admins.length || state.forceRefresh) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchAllAdmins.fulfilled, (state, action) => {
                state.loading = false;
                state.admins = action.payload.admins || [];
                state.stats = action.payload.stats;
                
                // Reset force refresh after successful fetch
                state.forceRefresh = false;
                
                if (!action.payload.fromCache && action.payload.cacheKey) {
                    state.adminsCache[action.payload.cacheKey] = {
                        data: { admins: action.payload.admins, stats: action.payload.stats },
                        lastFetched: Date.now()
                    };
                }
            })
            .addCase(fetchAllAdmins.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.forceRefresh = false;
            })

            // GET ADMIN BY ID
            .addCase(fetchAdminById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAdmin = action.payload.admin;
                
                if (!action.payload.fromCache && action.payload.id) {
                    state.adminCache[action.payload.id] = {
                        data: action.payload.admin,
                        lastFetched: Date.now()
                    };
                }
            })
            .addCase(fetchAdminById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE ADMIN
            .addCase(updateAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                if (action.payload.admin) {
                    const idx = state.admins.findIndex(a => a._id === action.payload.id);
                    if (idx !== -1) {
                        state.admins[idx] = action.payload.admin;
                    }
                    
                    if (state.adminCache[action.payload.id]) {
                        state.adminCache[action.payload.id] = {
                            data: action.payload.admin,
                            lastFetched: Date.now()
                        };
                    }
                }
                
                state.adminsCache = {};
                state.forceRefresh = true;
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE ADMIN
            .addCase(deleteAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.admins = state.admins.filter(a => a._id !== action.payload.deletedId);
                delete state.adminCache[action.payload.deletedId];
                state.adminsCache = {};
                state.forceRefresh = true;
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE STATUS
            .addCase(updateAdminStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAdminStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                const idx = state.admins.findIndex(a => a._id === action.payload.id);
                if (idx !== -1) {
                    state.admins[idx].status = action.payload.status;
                }
                
                if (state.adminCache[action.payload.id]) {
                    state.adminCache[action.payload.id].data.status = action.payload.status;
                }
                
                state.adminsCache = {};
                state.forceRefresh = true;
            })
            .addCase(updateAdminStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearAdmin, clearCache, forceRefreshAdmins, resetForceRefresh } = adminSlice.actions;
export default adminSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// // REGISTER ADMIN
// export const registerAdmin = createAsyncThunk(
//     'admin/registerAdmin',
//     async (adminData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/admin/register', adminData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // LOGIN ADMIN
// export const loginAdmin = createAsyncThunk(
//     'admin/loginAdmin',
//     async (credentials, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/admin/login', credentials);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // LOGOUT ADMIN
// export const logoutAdmin = createAsyncThunk(
//     'admin/logoutAdmin',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/admin/logout');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET PROFILE with caching
// export const getProfile = createAsyncThunk(
//     'admin/getProfile',
//     async (_, { rejectWithValue, getState }) => {
//         const state = getState().admin;
//         const now = Date.now();
        
//         if (state.currentAdmin && state.profileLastFetched && (now - state.profileLastFetched < CACHE_DURATION)) {
//             return { admin: state.currentAdmin, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get('/api/admin/profile');
//             return { ...res.data, fromCache: false };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PROFILE
// export const updateProfile = createAsyncThunk(
//     'admin/updateProfile',
//     async (profileData, { rejectWithValue }) => {
//         try {
//             const res = await axios.put('/api/admin/profile', profileData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET ALL ADMINS with caching
// export const fetchAllAdmins = createAsyncThunk(
//     'admin/fetchAllAdmins',
//     async (params = {}, { rejectWithValue, getState }) => {
//         const state = getState().admin;
//         const now = Date.now();
//         const cacheKey = JSON.stringify(params);
        
//         if (state.adminsCache[cacheKey] && (now - state.adminsCache[cacheKey].lastFetched < CACHE_DURATION)) {
//             return { ...state.adminsCache[cacheKey].data, fromCache: true };
//         }
        
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/admin/all?${queryString}`);
//             return { ...res.data, fromCache: false, cacheKey };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET ADMIN BY ID
// export const fetchAdminById = createAsyncThunk(
//     'admin/fetchAdminById',
//     async (id, { rejectWithValue, getState }) => {
//         const state = getState().admin;
//         const now = Date.now();
        
//         if (state.adminCache[id] && (now - state.adminCache[id].lastFetched < CACHE_DURATION)) {
//             return { admin: state.adminCache[id].data, fromCache: true };
//         }
        
//         try {
//             const res = await axios.get(`/api/admin/${id}`);
//             return { ...res.data, fromCache: false, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE ADMIN
// export const updateAdmin = createAsyncThunk(
//     'admin/updateAdmin',
//     async ({ id, adminData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/admin/${id}`, adminData);
//             return { ...res.data, id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE ADMIN
// export const deleteAdmin = createAsyncThunk(
//     'admin/deleteAdmin',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/admin/${id}`);
//             return { ...res.data, deletedId: id };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE ADMIN STATUS
// export const updateAdminStatus = createAsyncThunk(
//     'admin/updateAdminStatus',
//     async ({ id, status }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/admin/${id}/status`, { status });
//             return { ...res.data, id, status };
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     currentAdmin: null,
//     admins: [],
//     selectedAdmin: null,
//     stats: null,
//     loading: false,
//     error: null,
//     success: false,
//     isAuthenticated: false,
//     profileLastFetched: null,
//     adminsCache: {},
//     adminCache: {},
// };

// const adminSlice = createSlice({
//     name: "admin",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearAdmin: (state) => {
//             state.currentAdmin = null;
//             state.admins = [];
//             state.selectedAdmin = null;
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//             state.isAuthenticated = false;
//             state.adminsCache = {};
//             state.adminCache = {};
//             state.profileLastFetched = null;
//         },
//         clearCache: (state) => {
//             state.adminsCache = {};
//             state.adminCache = {};
//             state.profileLastFetched = null;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // REGISTER
//             .addCase(registerAdmin.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(registerAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(registerAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // LOGIN
//             .addCase(loginAdmin.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(loginAdmin.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.isAuthenticated = true;
//                 state.currentAdmin = action.payload.admin;
//                 state.profileLastFetched = Date.now();
//             })
//             .addCase(loginAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//                 state.isAuthenticated = false;
//             })

//             // LOGOUT
//             .addCase(logoutAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(logoutAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.currentAdmin = null;
//                 state.isAuthenticated = false;
//                 state.success = true;
//                 state.adminsCache = {};
//                 state.adminCache = {};
//                 state.profileLastFetched = null;
//             })
//             .addCase(logoutAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET PROFILE
//             .addCase(getProfile.pending, (state) => {
//                 if (!state.currentAdmin) {
//                     state.loading = true;
//                 }
//             })
//             .addCase(getProfile.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentAdmin = action.payload.admin;
//                 state.isAuthenticated = true;
//                 if (!action.payload.fromCache) {
//                     state.profileLastFetched = Date.now();
//                 }
//             })
//             .addCase(getProfile.rejected, (state, action) => {
//                 state.loading = false;
//                 state.isAuthenticated = false;
//                 state.currentAdmin = null;
//                 state.error = action.payload;
//             })

//             // UPDATE PROFILE
//             .addCase(updateProfile.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateProfile.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.currentAdmin = action.payload.admin;
//                 state.profileLastFetched = Date.now();
//             })
//             .addCase(updateProfile.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET ALL ADMINS
//             .addCase(fetchAllAdmins.pending, (state) => {
//                 if (!state.admins.length) {
//                     state.loading = true;
//                 }
//                 state.error = null;
//             })
//             .addCase(fetchAllAdmins.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.admins = action.payload.admins || [];
//                 state.stats = action.payload.stats;
                
//                 if (!action.payload.fromCache && action.payload.cacheKey) {
//                     state.adminsCache[action.payload.cacheKey] = {
//                         data: { admins: action.payload.admins, stats: action.payload.stats },
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(fetchAllAdmins.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET ADMIN BY ID
//             .addCase(fetchAdminById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchAdminById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedAdmin = action.payload.admin;
                
//                 if (!action.payload.fromCache && action.payload.id) {
//                     state.adminCache[action.payload.id] = {
//                         data: action.payload.admin,
//                         lastFetched: Date.now()
//                     };
//                 }
//             })
//             .addCase(fetchAdminById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE ADMIN
//             .addCase(updateAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateAdmin.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 if (action.payload.admin) {
//                     const idx = state.admins.findIndex(a => a._id === action.payload.id);
//                     if (idx !== -1) {
//                         state.admins[idx] = action.payload.admin;
//                     }
                    
//                     if (state.adminCache[action.payload.id]) {
//                         state.adminCache[action.payload.id] = {
//                             data: action.payload.admin,
//                             lastFetched: Date.now()
//                         };
//                     }
//                 }
                
//                 state.adminsCache = {};
//             })
//             .addCase(updateAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE ADMIN
//             .addCase(deleteAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteAdmin.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.admins = state.admins.filter(a => a._id !== action.payload.deletedId);
//                 delete state.adminCache[action.payload.deletedId];
//                 state.adminsCache = {};
//             })
//             .addCase(deleteAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE STATUS
//             .addCase(updateAdminStatus.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateAdminStatus.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
                
//                 const idx = state.admins.findIndex(a => a._id === action.payload.id);
//                 if (idx !== -1) {
//                     state.admins[idx].status = action.payload.status;
//                 }
                
//                 if (state.adminCache[action.payload.id]) {
//                     state.adminCache[action.payload.id].data.status = action.payload.status;
//                 }
                
//                 state.adminsCache = {};
//             })
//             .addCase(updateAdminStatus.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearAdmin, clearCache } = adminSlice.actions;
// export default adminSlice.reducer;
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // REGISTER ADMIN
// export const registerAdmin = createAsyncThunk(
//     'admin/registerAdmin',
//     async (adminData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/admin/register', adminData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // LOGIN ADMIN
// export const loginAdmin = createAsyncThunk(
//     'admin/loginAdmin',
//     async (credentials, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/admin/login', credentials);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // LOGOUT ADMIN
// export const logoutAdmin = createAsyncThunk(
//     'admin/logoutAdmin',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/admin/logout');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET PROFILE
// export const getProfile = createAsyncThunk(
//     'admin/getProfile',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/admin/profile');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE PROFILE
// export const updateProfile = createAsyncThunk(
//     'admin/updateProfile',
//     async (profileData, { rejectWithValue }) => {
//         try {
//             const res = await axios.put('/api/admin/profile', profileData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET ALL ADMINS
// export const fetchAllAdmins = createAsyncThunk(
//     'admin/fetchAllAdmins',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/admin/all?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // GET ADMIN BY ID
// export const fetchAdminById = createAsyncThunk(
//     'admin/fetchAdminById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/admin/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE ADMIN
// export const updateAdmin = createAsyncThunk(
//     'admin/updateAdmin',
//     async ({ id, adminData }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/admin/${id}`, adminData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE ADMIN
// export const deleteAdmin = createAsyncThunk(
//     'admin/deleteAdmin',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/admin/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE ADMIN STATUS
// export const updateAdminStatus = createAsyncThunk(
//     'admin/updateAdminStatus',
//     async ({ id, status }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/admin/${id}/status`, { status });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     currentAdmin: null,
//     admins: [],
//     selectedAdmin: null,
//     stats: null,
//     loading: false,
//     error: null,
//     success: false,
//     isAuthenticated: false,
// };

// const adminSlice = createSlice({
//     name: "admin",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearAdmin: (state) => {
//             state.currentAdmin = null;
//             state.admins = [];
//             state.selectedAdmin = null;
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//             state.isAuthenticated = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // REGISTER
//             .addCase(registerAdmin.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(registerAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(registerAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // LOGIN
//             .addCase(loginAdmin.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(loginAdmin.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.isAuthenticated = true;
//                 state.currentAdmin = action.payload.admin;
//             })
//             .addCase(loginAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//                 state.isAuthenticated = false;
//             })

//             // LOGOUT
//             .addCase(logoutAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(logoutAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.currentAdmin = null;
//                 state.isAuthenticated = false;
//                 state.success = true;
//             })
//             .addCase(logoutAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET PROFILE
//             .addCase(getProfile.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(getProfile.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentAdmin = action.payload.admin;
//                 state.isAuthenticated = true;
//             })
//             .addCase(getProfile.rejected, (state, action) => {
//                 state.loading = false;
//                 state.isAuthenticated = false;
//                 state.currentAdmin = null;
//                 state.error = action.payload;
//             })

//             // UPDATE PROFILE
//             .addCase(updateProfile.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateProfile.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.success = true;
//                 state.currentAdmin = action.payload.admin;
//             })
//             .addCase(updateProfile.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET ALL ADMINS
//             // .addCase(fetchAllAdmins.pending, (state) => {
//             //     state.loading = true;
//             //     state.error = null;
//             // })
//             // .addCase(fetchAllAdmins.fulfilled, (state, action) => {
//             //     state.loading = false;
//             //     state.admins = action.payload.admins || [];
//             //     state.stats = action.payload.stats;
//             // })
//             // .addCase(fetchAllAdmins.rejected, (state, action) => {
//             //     state.loading = false;
//             //     state.error = action.payload;
//             // })
//             .addCase(fetchAllAdmins.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchAllAdmins.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.admins = action.payload.admins || [];
//                 state.stats = action.payload.stats;
//             })
//             .addCase(fetchAllAdmins.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // GET ADMIN BY ID
//             .addCase(fetchAdminById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchAdminById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedAdmin = action.payload.admin;
//             })
//             .addCase(fetchAdminById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE ADMIN
//             .addCase(updateAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE ADMIN
//             .addCase(deleteAdmin.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteAdmin.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deleteAdmin.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE STATUS
//             .addCase(updateAdminStatus.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateAdminStatus.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateAdminStatus.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearAdmin } = adminSlice.actions;
// export default adminSlice.reducer;