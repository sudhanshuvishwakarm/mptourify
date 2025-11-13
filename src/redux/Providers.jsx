'use client'
import { store, persistor } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}// 'use client'
// import { store } from "./store";
// import { Provider } from "react-redux";

// export function Providers({ children }) {
//   return <Provider store={store}>{children}</Provider>;
// }