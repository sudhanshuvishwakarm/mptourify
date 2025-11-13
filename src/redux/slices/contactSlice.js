import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// SUBMIT CONTACT FORM
export const submitContact = createAsyncThunk(
    'contact/submitContact',
    async (contactData, { rejectWithValue }) => {
        try {
            const res = await axios.post('/api/contact', contactData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH ALL CONTACTS with caching
export const fetchContacts = createAsyncThunk(
    'contact/fetchContacts',
    async (params = {}, { rejectWithValue, getState }) => {
        const state = getState().contact;
        const now = Date.now();
        const cacheKey = JSON.stringify(params);
        
        // Check if we have cached data
        if (state.contactsCache[cacheKey] && (now - state.contactsCache[cacheKey].lastFetched < CACHE_DURATION)) {
            return { ...state.contactsCache[cacheKey].data, fromCache: true };
        }
        
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/contact?${queryString}`);
            return { ...res.data, fromCache: false, cacheKey };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH CONTACT BY ID with caching
export const fetchContactById = createAsyncThunk(
    'contact/fetchContactById',
    async (id, { rejectWithValue, getState }) => {
        const state = getState().contact;
        const now = Date.now();
        
        // Check if we have cached data for this contact
        if (state.contactCache[id] && (now - state.contactCache[id].lastFetched < CACHE_DURATION)) {
            return { contact: state.contactCache[id].data, fromCache: true };
        }
        
        try {
            const res = await axios.get(`/api/contact/${id}`);
            return { ...res.data, fromCache: false, id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// UPDATE CONTACT STATUS
export const updateContactStatus = createAsyncThunk(
    'contact/updateContactStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`/api/contact/${id}/status`, { status });
            return { ...res.data, id, status };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// DELETE CONTACT
export const deleteContact = createAsyncThunk(
    'contact/deleteContact',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/contact/${id}`);
            return { ...res.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    contacts: [],
    selectedContact: null,
    loading: false,
    error: null,
    success: false,
    totalContacts: 0,
    currentPage: 1,
    totalPages: 1,
    stats: null,
    lastFetched: null,
    contactsCache: {},
    contactCache: {},
};

const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearContact: (state) => {
            state.contacts = [];
            state.selectedContact = null;
            state.error = null;
            state.loading = false;
            state.success = false;
            state.contactsCache = {};
            state.contactCache = {};
            state.lastFetched = null;
        },
        clearCache: (state) => {
            state.contactsCache = {};
            state.contactCache = {};
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // SUBMIT CONTACT
            .addCase(submitContact.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitContact.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                // Clear cache after new submission
                state.contactsCache = {};
            })
            .addCase(submitContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL CONTACTS
            .addCase(fetchContacts.pending, (state) => {
                // Only show loading if we don't have cached data
                if (!state.contacts.length) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload.contacts || [];
                state.totalContacts = action.payload.totalContacts || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.stats = action.payload.stats;
                
                // Cache the data if it's not from cache
                if (!action.payload.fromCache && action.payload.cacheKey) {
                    state.contactsCache[action.payload.cacheKey] = {
                        data: {
                            contacts: action.payload.contacts,
                            totalContacts: action.payload.totalContacts,
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
            .addCase(fetchContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH CONTACT BY ID
            .addCase(fetchContactById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContactById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedContact = action.payload.contact;
                
                // Cache the contact if it's not from cache
                if (!action.payload.fromCache && action.payload.id) {
                    state.contactCache[action.payload.id] = {
                        data: action.payload.contact,
                        lastFetched: Date.now()
                    };
                }
            })
            .addCase(fetchContactById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE STATUS
            .addCase(updateContactStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateContactStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update contact in the list
                const idx = state.contacts.findIndex(c => c._id === action.payload.id);
                if (idx !== -1 && action.payload.contact) {
                    state.contacts[idx] = action.payload.contact;
                }
                
                // Update cache
                if (state.contactCache[action.payload.id]) {
                    state.contactCache[action.payload.id] = {
                        data: action.payload.contact,
                        lastFetched: Date.now()
                    };
                }
                
                // Clear list cache to force refresh
                state.contactsCache = {};
            })
            .addCase(updateContactStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE CONTACT
            .addCase(deleteContact.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteContact.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Remove from list
                state.contacts = state.contacts.filter(c => c._id !== action.payload.deletedId);
                state.totalContacts -= 1;
                
                // Remove from cache
                delete state.contactCache[action.payload.deletedId];
                
                // Clear list cache
                state.contactsCache = {};
            })
            .addCase(deleteContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearContact, clearCache } = contactSlice.actions;
export default contactSlice.reducer;// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // SUBMIT CONTACT FORM
// export const submitContact = createAsyncThunk(
//     'contact/submitContact',
//     async (contactData, { rejectWithValue }) => {
//         try {
//             const res = await axios.post('/api/contact', contactData);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH ALL CONTACTS
// export const fetchContacts = createAsyncThunk(
//     'contact/fetchContacts',
//     async (params = {}, { rejectWithValue }) => {
//         try {
//             const queryString = new URLSearchParams(params).toString();
//             const res = await axios.get(`/api/contact?${queryString}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // FETCH CONTACT BY ID
// export const fetchContactById = createAsyncThunk(
//     'contact/fetchContactById',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`/api/contact/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // UPDATE CONTACT STATUS
// export const updateContactStatus = createAsyncThunk(
//     'contact/updateContactStatus',
//     async ({ id, status }, { rejectWithValue }) => {
//         try {
//             const res = await axios.put(`/api/contact/${id}/status`, { status });
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// // DELETE CONTACT
// export const deleteContact = createAsyncThunk(
//     'contact/deleteContact',
//     async (id, { rejectWithValue }) => {
//         try {
//             const res = await axios.delete(`/api/contact/${id}`);
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     contacts: [],
//     selectedContact: null,
//     loading: false,
//     error: null,
//     success: false,
//     totalContacts: 0,
//     currentPage: 1,
//     totalPages: 1,
//     stats: null,
// };

// const contactSlice = createSlice({
//     name: "contact",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearSuccess: (state) => {
//             state.success = false;
//         },
//         clearContact: (state) => {
//             state.contacts = [];
//             state.selectedContact = null;
//             state.error = null;
//             state.loading = false;
//             state.success = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // SUBMIT CONTACT
//             .addCase(submitContact.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(submitContact.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(submitContact.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH ALL CONTACTS
//             .addCase(fetchContacts.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchContacts.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.contacts = action.payload.contacts || [];
//                 state.totalContacts = action.payload.totalContacts || 0;
//                 state.currentPage = action.payload.currentPage || 1;
//                 state.totalPages = action.payload.totalPages || 1;
//                 state.stats = action.payload.stats;
//             })
//             .addCase(fetchContacts.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // FETCH CONTACT BY ID
//             .addCase(fetchContactById.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchContactById.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.selectedContact = action.payload.contact;
//             })
//             .addCase(fetchContactById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // UPDATE STATUS
//             .addCase(updateContactStatus.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateContactStatus.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(updateContactStatus.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // DELETE CONTACT
//             .addCase(deleteContact.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(deleteContact.fulfilled, (state) => {
//                 state.loading = false;
//                 state.success = true;
//             })
//             .addCase(deleteContact.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearSuccess, clearContact } = contactSlice.actions;
// export default contactSlice.reducer;