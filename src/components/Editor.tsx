import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { TextField, Switch, FormControlLabel } from "@material-ui/core";
import { Rating } from "@material-ui/lab";

import {
  addNote,
  deleteNote,
  notesSlice,
  RootState,
  updateNote,
} from "../store";

interface EditorProps {
  id?: number;
}

export default function Editor({ id }: EditorProps) {
  const dispatch = useDispatch();

  const selectedNote = useSelector(
    (state: RootState) => state.notes.selectedNote
  );

  const { reset, register, handleSubmit, control } = useForm<{
    content: string;
    title: string;
    rating: number;
  }>();

  useEffect(() => {
    reset(selectedNote ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNote]);

  return (
    <div>
      <form
        onSubmit={handleSubmit((data) => {
          // console.log(data);
          if (selectedNote)
            dispatch(updateNote({ ...data, id: selectedNote.id }));
          else dispatch(addNote(data));
        })}
      >
        <div>
          <TextField
            name="title"
            inputRef={register}
            InputLabelProps={{ shrink: true }}
            label="Title"
            required
          />
        </div>
        <div>
          <TextField
            name="content"
            inputRef={register}
            label="Content"
            InputLabelProps={{ shrink: true }}
            required
          />
        </div>
        <div>
          <Controller
            control={control}
            name="rating"
            defaultValue={0}
            render={(props) => {
              return (
                <Rating
                  name="rating"
                  value={props.value}
                  onChange={(e, value) => props.onChange(value)}
                  onBlur={props.onBlur}
                />
              );
            }}
          />
        </div>
        <div>
          <TextField
            multiline
            name="description"
            // inputRef={register}
            label="설명"
            InputLabelProps={{ shrink: true }}
            required
          />
        </div>
        <div>
          <Controller
            control={control}
            name="deleted"
            defaultValue={0}
            render={(props) => (
              <FormControlLabel
                control={
                  <Switch
                    name="deleted"
                    value={props.value}
                    onChange={(e, value) => props.onChange(value)}
                  />
                }
                label="deleted"
              />
            )}
          />
        </div>

        <button
          disabled={!selectedNote}
          onClick={() => dispatch(notesSlice.actions.selectNote(null))}
        >
          new
        </button>
        <button>submit</button>
        <button
          disabled={!selectedNote}
          onClick={() => {
            if (window.confirm("진짜 지울꺼?"))
              dispatch(deleteNote(selectedNote!.id));
          }}
        >
          delete
        </button>
      </form>
    </div>
  );
}
