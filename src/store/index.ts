import { combineReducers } from "redux";
import { notesSlice } from "./notes";

const rootReducer = combineReducers({
  notes: notesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
