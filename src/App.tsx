import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "@emotion/styled";

import "./App.css";
import Editor from "./components/Editor";
import { getNotes, selectNote, loadNotes } from "./store/notes";

const List = styled.ol`
  height: 100%;
  overflow: auto;
  list-style: none;
  padding: 0;

  & > li {
    padding: 1rem;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  height: 100vh;
  width: 100vw;
`;

function App() {
  const dispatch = useDispatch();

  const notes = useSelector(getNotes);

  useEffect(() => {
    dispatch(loadNotes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <List>
        {notes.map((note) => (
          <li
            onClick={() => {
              dispatch(selectNote(note.id));
            }}
          >
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div>{note.rating ?? "-"}/5</div>
          </li>
        ))}
      </List>
      <main>
        <Editor />
      </main>
    </Layout>
  );
}

export default App;
