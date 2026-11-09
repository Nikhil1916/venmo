import { configureStore } from "@reduxjs/toolkit";
import balanceReducer from "./balance.slice";
const store = configureStore({
    reducer: {
        balance: balanceReducer,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {
  setBalance
} from "./balance.slice";