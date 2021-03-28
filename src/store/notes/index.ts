import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";

import { RootState } from "..";
import {
  createNote,
  readsNotes,
  updateNote as updateNoteDb,
  deleteNote as deleteNoteDb,
} from "../../lib/notes";
import Note from "./Note";

export const loadNotes = createAsyncThunk("notes/fetchNotes", readsNotes);

export const addNote = createAsyncThunk("notes/addNote", createNote);

export const updateNote = createAsyncThunk("notes/update", updateNoteDb);

export const deleteNote = createAsyncThunk("notes/delete", deleteNoteDb);

const notesAdapter = createEntityAdapter<Note>();

const { selectById, selectAll } = notesAdapter.getSelectors();

export const notesSlice = createSlice({
  name: "notes",
  reducers: {
    selectNote(state, action) {
      if (action.payload) {
        state.selectedNote = selectById(state, action.payload);
      } else {
        state.selectedNote = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadNotes.fulfilled, (state, action) => {
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

export const selectNote = notesSlice.actions.selectNote;

const getNotesState = (state: RootState) => state.notes;

export const getNotes = (state: RootState) => selectAll(getNotesState(state));

export const getNoteById = (id: number) => (state: RootState) =>
  selectById(getNotesState(state), id);

export const getSelectedNote = (state: RootState) =>
  getNotesState(state).selectedNote;
