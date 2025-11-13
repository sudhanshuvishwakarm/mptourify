import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from "./slices/adminSlice.js";
import districtReducer from "./slices/districtSlice";
import panchayatReducer from "./slices/panchayatSlice";
import mediaReducer from "./slices/mediaSlice";
import newsReducer from "./slices/newsSlice";
import contactReducer from "./slices/contactSlice";
import statsReducer from "./slices/statsSlice";

// Admin persist config
const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['currentAdmin', 'isAuthenticated', 'profileLastFetched', 'adminsCache', 'adminCache']
};

// District persist config
const districtPersistConfig = {
  key: 'district', 
  storage,
  whitelist: ['districts', 'lastFetched', 'mapLastFetched', 'districtCache', 'stats', 'totalDistricts', 'mapDistricts']
};

// Media persist config
const mediaPersistConfig = {
  key: 'media',
  storage,
  whitelist: ['media', 'totalMedia', 'stats', 'lastFetched']
};

// News persist config
const newsPersistConfig = {
  key: 'news',
  storage,
  whitelist: ['news', 'latestNews', 'totalNews', 'lastFetched']
};

// Contact persist config
const contactPersistConfig = {
  key: 'contact',
  storage,
  whitelist: ['contacts', 'totalContacts', 'stats', 'lastFetched', 'contactsCache', 'contactCache']
};

// Panchayat persist config
const panchayatPersistConfig = {
  key: 'panchayat',
  storage,
  whitelist: ['panchayats', 'totalPanchayats', 'lastFetched', 'panchayatsCache', 'panchayatCache']
};

// Stats persist config
const statsPersistConfig = {
  key: 'stats',
  storage,
  whitelist: ['overview', 'recentActivity', 'overviewLastFetched']
};

// Create persisted reducers
const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);
const persistedDistrictReducer = persistReducer(districtPersistConfig, districtReducer);
const persistedMediaReducer = persistReducer(mediaPersistConfig, mediaReducer);
const persistedNewsReducer = persistReducer(newsPersistConfig, newsReducer);
const persistedContactReducer = persistReducer(contactPersistConfig, contactReducer);
const persistedPanchayatReducer = persistReducer(panchayatPersistConfig, panchayatReducer);
const persistedStatsReducer = persistReducer(statsPersistConfig, statsReducer);

export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
    district: persistedDistrictReducer,
    panchayat: persistedPanchayatReducer,
    media: persistedMediaReducer,
    news: persistedNewsReducer,
    contact: persistedContactReducer,
    stats: persistedStatsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import adminReducer from "./slices/adminSlice.js";
// import districtReducer from "./slices/districtSlice";
// import panchayatReducer from "./slices/panchayatSlice";
// import mediaReducer from "./slices/mediaSlice";
// import newsReducer from "./slices/newsSlice";
// import contactReducer from "./slices/contactSlice";
// import statsReducer from "./slices/statsSlice";

// // Admin persist config
// const adminPersistConfig = {
//   key: 'admin',
//   storage,
//   whitelist: ['currentAdmin', 'isAuthenticated', 'profileLastFetched', 'adminsCache', 'adminCache']
// };

// // District persist config
// const districtPersistConfig = {
//   key: 'district', 
//   storage,
//   whitelist: ['districts', 'lastFetched', 'mapLastFetched', 'districtCache', 'stats', 'totalDistricts', 'mapDistricts']
// };

// // Media persist config
// const mediaPersistConfig = {
//   key: 'media',
//   storage,
//   whitelist: ['media', 'totalMedia', 'stats', 'lastFetched', 'mediaCache']
// };

// // News persist config
// const newsPersistConfig = {
//   key: 'news',
//   storage,
//   whitelist: ['news', 'latestNews', 'totalNews', 'lastFetched', 'newsCache']
// };

// // Stats persist config
// const statsPersistConfig = {
//   key: 'stats',
//   storage,
//   whitelist: ['overview', 'recentActivity', 'overviewLastFetched']
// };

// // Panchayat persist config (optional)
// const panchayatPersistConfig = {
//   key: 'panchayat',
//   storage,
//   whitelist: ['panchayats', 'totalPanchayats', 'lastFetched', 'panchayatCache']
// };

// // Create persisted reducers
// const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);
// const persistedDistrictReducer = persistReducer(districtPersistConfig, districtReducer);
// const persistedMediaReducer = persistReducer(mediaPersistConfig, mediaReducer);
// const persistedNewsReducer = persistReducer(newsPersistConfig, newsReducer);
// const persistedStatsReducer = persistReducer(statsPersistConfig, statsReducer);
// const persistedPanchayatReducer = persistReducer(panchayatPersistConfig, panchayatReducer);

// export const store = configureStore({
//   reducer: {
//     admin: persistedAdminReducer,
//     district: persistedDistrictReducer,
//     panchayat: persistedPanchayatReducer,
//     media: persistedMediaReducer,
//     news: persistedNewsReducer,
//     contact: contactReducer,
//     stats: persistedStatsReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// export const persistor = persistStore(store);


// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import adminReducer from "./slices/adminSlice.js";
// import districtReducer from "./slices/districtSlice";
// import panchayatReducer from "./slices/panchayatSlice";
// import mediaReducer from "./slices/mediaSlice";
// import newsReducer from "./slices/newsSlice";
// import contactReducer from "./slices/contactSlice";
// import statsReducer from "./slices/statsSlice";

// // Persist config for media - only persist the data we need
// const mediaPersistConfig = {
//   key: 'media',
//   storage,
//   whitelist: ['media', 'totalMedia', 'stats', 'lastFetched']
// };

// const districtPersistConfig = {
//   key: 'district', 
//   storage,
//   whitelist: ['districts', 'lastFetched', 'mapLastFetched', 'districtCache', 'stats', 'totalDistricts']
// };

// // ADD NEWS PERSISTENCE
// const newsPersistConfig = {
//   key: 'news',
//   storage,
//   whitelist: ['news', 'latestNews', 'totalNews', 'lastFetched']
// };

// // Create persisted reducers
// const persistedMediaReducer = persistReducer(mediaPersistConfig, mediaReducer);
// const persistedDistrictReducer = persistReducer(districtPersistConfig, districtReducer);
// const persistedNewsReducer = persistReducer(newsPersistConfig, newsReducer); // ADD THIS

// export const store = configureStore({
//   reducer: {
//     admin: adminReducer,
//     district: persistedDistrictReducer,
//     panchayat: panchayatReducer,
//     media: persistedMediaReducer,
//     news: persistedNewsReducer, // UPDATE THIS LINE
//     contact: contactReducer,
//     stats: statsReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// export const persistor = persistStore(store);
