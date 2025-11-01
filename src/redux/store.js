import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/adminSlice.js";
import districtReducer from "./slices/districtSlice";
import panchayatReducer from "./slices/panchayatSlice";
import mediaReducer from "./slices/mediaSlice";
import newsReducer from "./slices/newsSlice";
import contactReducer from "./slices/contactSlice";
import statsReducer from "./slices/statsSlice";
export const store = configureStore({
     reducer: {
        admin: adminReducer,
        district: districtReducer,
        panchayat: panchayatReducer,
        media: mediaReducer,
        news: newsReducer,
        contact: contactReducer,
        stats: statsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});