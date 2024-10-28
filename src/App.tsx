import { useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import { exampleSetup } from 'prosemirror-example-setup';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

function App() {
  const socket = io('http://localhost:3000/', {
    transports: ['websocket'],
  });
  useEffect(() => {
    if (!document.querySelector('#editor')?.hasChildNodes()) {
      const mySchema = new Schema({
        nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
        marks: schema.spec.marks,
      });

      const state = EditorState.create({
        doc: mySchema.nodeFromJSON({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Hello World!',
                },
              ],
            },
          ],
        }),
        plugins: exampleSetup({ schema: mySchema }),
      });

      window.view = new EditorView(document.querySelector('#editor'), {
        state: state,
        handleKeyDown(view) {
          socket.emit('editorStateUpdate', view.state.doc.toJSON());
        },
      });
    }
  }, [socket]);

  useEffect(() => {
    socket.on('change', (data) => {
      window.view.updateState(
        EditorState.create({
          doc: window.view.state.schema.nodeFromJSON(data),
          plugins: exampleSetup({ schema: window.view.state.schema }),
        })
      );
    });
  }, [socket]);

  return (
    <div>
      <div id="editor"></div>
      <div id="content" style={{ display: 'none' }}></div>
    </div>
  );
}

export default App;
