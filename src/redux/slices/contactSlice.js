import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

// FETCH ALL CONTACTS
export const fetchContacts = createAsyncThunk(
    'contact/fetchContacts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await axios.get(`/api/contact?${queryString}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// FETCH CONTACT BY ID
export const fetchContactById = createAsyncThunk(
    'contact/fetchContactById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/contact/${id}`);
            return res.data;
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
            return res.data;
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
            return res.data;
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
            })
            .addCase(submitContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH ALL CONTACTS
            .addCase(fetchContacts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload.contacts || [];
                state.totalContacts = action.payload.totalContacts || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.stats = action.payload.stats;
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
            })
            .addCase(fetchContactById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE STATUS
            .addCase(updateContactStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateContactStatus.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateContactStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE CONTACT
            .addCase(deleteContact.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteContact.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(deleteContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearContact } = contactSlice.actions;
export default contactSlice.reducer;