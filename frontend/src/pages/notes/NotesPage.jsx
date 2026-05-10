import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useNotes from '../../hooks/useNotes';
import useSocket from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../constants/app.constants';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatRelativeTime } from '../../utils/formatDate.util';
import styles from './NotesPage.module.css';

const NoteEditor = ({ initial = '', onSave, onCancel, saving }) => {
  const [text, setText] = useState(initial);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!text.trim()) { setError('Note cannot be empty'); return; }
    setError('');
    onSave(text);
  };

  return (
    <div className={styles.editor}>
      <textarea
        className={styles.editorTextarea}
        value={text}
        onChange={(e) => { setText(e.target.value); setError(''); }}
        placeholder="Write your note here..."
        rows={4}
        autoFocus
      />
      {error && <ErrorMessage message={error} />}
      <div className={styles.editorActions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSave} loading={saving}>Save Note</Button>
      </div>
    </div>
  );
};

const NotesPage = () => {
  const { tripId } = useParams();
  const { notes, loading, fetchNotes, addNote, editNote, removeNote, prependNote, updateNoteInState, deleteNoteInState } = useNotes(tripId);
  const { joinRoom, leaveRoom, on, off } = useSocket();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
    joinRoom(`trip:${tripId}`);
    return () => leaveRoom(`trip:${tripId}`);
  }, [tripId, fetchNotes, joinRoom, leaveRoom]);

  useEffect(() => {
    on(SOCKET_EVENTS.NOTE_ADDED, (note) => prependNote(note));
    on(SOCKET_EVENTS.NOTE_UPDATED, ({ noteId, ...updates }) => updateNoteInState(noteId, updates));
    on(SOCKET_EVENTS.NOTE_DELETED, ({ noteId }) => deleteNoteInState(noteId));
    return () => {
      off(SOCKET_EVENTS.NOTE_ADDED);
      off(SOCKET_EVENTS.NOTE_UPDATED);
      off(SOCKET_EVENTS.NOTE_DELETED);
    };
  }, [on, off, prependNote, updateNoteInState, deleteNoteInState]);

  const handleAdd = async (text) => {
    setSavingId('new');
    try { await addNote({ content: text }); setAdding(false); } finally { setSavingId(null); }
  };

  const handleEdit = async (noteId, text) => {
    setSavingId(noteId);
    try { await editNote(noteId, { content: text }); setEditingId(null); } finally { setSavingId(null); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await removeNote(deletingId); } finally { setDeleteLoading(false); setDeletingId(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Trip Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        {!adding && <Button onClick={() => setAdding(true)} icon={<span>+</span>}>Add Note</Button>}
      </div>

      {adding && (
        <NoteEditor
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
          saving={savingId === 'new'}
        />
      )}

      {loading ? (
        <div className={styles.center}><Spinner /></div>
      ) : notes.length === 0 && !adding ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Add notes, reminders, or important details about your trip"
          action={<Button onClick={() => setAdding(true)}>Add First Note</Button>}
        />
      ) : (
        <div className={styles.notesList}>
          {notes.map((note) => {
            const nid = note.id || note._id;
            return (
              <div key={nid} className={styles.noteCard}>
                {editingId === nid ? (
                  <NoteEditor
                    initial={note.content}
                    onSave={(text) => handleEdit(nid, text)}
                    onCancel={() => setEditingId(null)}
                    saving={savingId === nid}
                  />
                ) : (
                  <>
                    <div className={styles.noteContent}>{note.content}</div>
                    <div className={styles.noteMeta}>
                      <span className={styles.noteTime}>{formatRelativeTime(note.updatedAt || note.createdAt)}</span>
                      {note.stopName && <span className={styles.noteStop}>📍 {note.stopName}</span>}
                      <div className={styles.noteActions}>
                        <button className={styles.editBtn} onClick={() => setEditingId(nid)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => setDeletingId(nid)}>Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete note?"
        message="This note will be permanently deleted."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default NotesPage;
