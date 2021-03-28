import { ipcRenderer } from "electron";
import Note from "../../store/notes/Note";

function createRequestId() {
  return ~~(Math.random() * 10000);
}
export function readsNotes() {
  const requestId = createRequestId();

  ipcRenderer.send("all-sql", {
    sql: "SELECT * FROM note",
    requestId,
  });

  return new Promise<Note[]>((res, rej) => {
    ipcRenderer.once("all-sql" + requestId, (e, arg) => {
      console.log(arg);
      if (arg.error) rej(arg.error);
      else res(arg.data);
    });
  });
}

export function createNote(payload: Omit<Note, "id">) {
  const requestId = createRequestId();

  ipcRenderer.send("run-sql", {
    sql: "INSERT INTO note(title, content, rating ) VALUES(?, ?, ?)",
    params: [payload.title, payload.content, payload.rating],
    requestId,
  });

  return new Promise<Note>((res, rej) => {
    ipcRenderer.once("run-sql" + requestId, (e, arg) => {
      if (arg.error) rej(arg.error);
      else res({ ...payload, id: arg.lastID } as Note);
    });
  });
}

export function updateNote(payload: Note) {
  const requestId = createRequestId();

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
}

export function deleteNote(payload: number) {
  const requestId = createRequestId();

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
