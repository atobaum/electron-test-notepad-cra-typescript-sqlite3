import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { combineReducers } from "redux";

const counterSlice = createSlice({
  name: "counter",
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
  },
  initialState: 0,
});

export const fetchNotes = createAsyncThunk("notes/fetchNotes", () => {
  const requestId = ~~(Math.random() * 1000);

  ipcRenderer.send("all-sql", {
    sql: "SELECT * FROM note",
    requestId,
  });

  return new Promise<Note[]>((res, rej) => {
    ipcRenderer.once("all-sql" + requestId, (e, arg) => {
      console.log(arg);
      if (arg.error) rej(arg.error);
      // TODO:
      else res(arg.data);
    });
  });
});

export const addNote = createAsyncThunk(
  "notes/addNote",
  (payload: Pick<Note, "title" | "content" | "rating">) => {
    const requestId = ~~(Math.random() * 1000);

    ipcRenderer.send("run-sql", {
      sql: "INSERT INTO note(title, content, rating ) VALUES(?, ?, ?)",
      params: [payload.title, payload.content, payload.rating],
      requestId,
    });

    return new Promise<Note>((res, rej) => {
      ipcRenderer.once("run-sql" + requestId, (e, arg) => {
        console.log(arg);
        if (arg.error) rej(arg.error);
        // TODO:
        else res({ ...payload, id: arg.lastID } as Note);
      });
    });
  }
);

export const updateNote = createAsyncThunk("notes/update", (payload: Note) => {
  const requestId = ~~(Math.random() * 1000);

  const keys = Object.keys(payload) as (keyof Note)[];
  const setSql = keys
    .reduce<string[]>((acc, key) => {
      if (payload[key] !== undefined) acc.push(`${key} = ?`);
      return acc;
    }, [])
    .join(", ");

  ipcRenderer.send("run-sql", {
    sql: `UPDATE note SET ${setSql} WHERE id=?`,
    params: [...keys.map((key) => payload[key]), payload.id],
    requestId,
  });

  return new Promise<Note>((res, rej) => {
    ipcRenderer.once("run-sql" + requestId, (e, arg) => {
      console.log(arg);
      if (arg.error) rej(arg.error);
      else res(payload);
    });
  });
});

export const deleteNote = createAsyncThunk(
  "notes/delete",
  (payload: number) => {
    const requestId = ~~(Math.random() * 1000);

    ipcRenderer.send("run-sql", {
      sql: "DELETE FROM note WHERE id=?",
      params: [payload],
      requestId,
    });

    return new Promise<number>((res, rej) => {
      ipcRenderer.once("run-sql" + requestId, (e, arg) => {
        console.log(arg);
        if (arg.error) rej(arg.error);
        else res(payload);
      });
    });
  }
);

interface Note {
  id: number;
  title: string;
  content: string;
  rating: number;
  //   createdAt: string;
}

export const notesAdapter = createEntityAdapter<Note>();

const { selectById } = notesAdapter.getSelectors();

export const notesSlice = createSlice({
  name: "notes",
  reducers: {
    noteFetched(state, action) {
      notesAdapter.setAll(state, action.payload.notes);
    },
    selectNote(state, action) {
      if (action.payload) {
        state.selectedNote = selectById(state, action.payload);
      } else {
        state.selectedNote = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      notesAdapter.setAll(state, action.payload);
    });
    builder.addCase(addNote.fulfilled, (state, action) => {
      notesAdapter.addOne(state, action.payload);
    });
    builder.addCase(updateNote.fulfilled, (state, action) => {
      notesAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
    });
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      notesAdapter.removeOne(state, action.payload);
    });
  },
  initialState: notesAdapter.getInitialState({
    selectedNote: undefined as Note | undefined,
  }),
});

const rootReducer = combineReducers({
  counter: counterSlice.reducer,
  notes: notesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
