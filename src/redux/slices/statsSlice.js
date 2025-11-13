import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// FETCH OVERVIEW STATS with caching
export const fetchOverviewStats = createAsyncThunk(
    'stats/fetchOverviewStats',
    async (_, { rejectWithValue, getState }) => {
        const state = getState().stats;
        const now = Date.now();
        
        if (state.overview && state.overviewLastFetched && (now - state.overviewLastFetched < CACHE_DURATION)) {
            return { ...state, fromCache: true };
        }
        
        try {
            const res = await axios.get('/api/stats/overview');
            return { ...res.data, fromCache: false };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    overview: null,
    recentActivity: null,
    loading: false,
    error: null,
    overviewLastFetched: null,
};

const statsSlice = createSlice({
    name: "stats",
    initialState,
    reducers: {
        clearStats: (state) => {
            state.overview = null;
            state.recentActivity = null;
            state.overviewLastFetched = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverviewStats.pending, (state) => {
                if (!state.overview) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchOverviewStats.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload.overview;
                state.recentActivity = action.payload.recentActivity;
                
                if (!action.payload.fromCache) {
                    state.overviewLastFetched = Date.now();
                }
            })
            .addCase(fetchOverviewStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearStats, clearError } = statsSlice.actions;
export default statsSlice.reducer;// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // FETCH OVERVIEW STATS
// export const fetchOverviewStats = createAsyncThunk(
//     'stats/fetchOverviewStats',
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await axios.get('/api/stats/overview');
//             return res.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message);
//         }
//     }
// );

// const initialState = {
//     overview: null,
//     recentActivity: null,
//     loading: false,
//     error: null,
// };

// const statsSlice = createSlice({
//     name: "stats",
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         clearStats: (state) => {
//             state.overview = null;
//             state.recentActivity = null;
//             state.error = null;
//             state.loading = false;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchOverviewStats.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchOverviewStats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.overview = action.payload.overview;
//                 state.recentActivity = action.payload.recentActivity;
//             })
//             .addCase(fetchOverviewStats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });

// export const { clearError, clearStats } = statsSlice.actions;
// export default statsSlice.reducer;