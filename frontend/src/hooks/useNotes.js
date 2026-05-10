import { useState, useCallback } from 'react';
import { getNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from '../api/note.api';
import { DEMO_NOTES } from '../constants/mockData';
import { parseError } from '../utils/errorParser.util';
import toast from 'react-hot-toast';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const useNotes = (tripId) => {
  const [notes, setNotes] = useState(IS_DEMO ? DEMO_NOTES : []);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async (params = {}) => {
    if (!tripId) return;
    if (IS_DEMO) {
      setNotes(DEMO_NOTES);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getNotesApi(tripId, params);
      setNotes(data.notes || data.data || []);
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const addNote = useCallback(async (noteData) => {
    if (IS_DEMO) {
      const newNote = {
        ...noteData,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      toast.success('Note saved');
      return newNote;
    }
    try {
      const { data } = await createNoteApi(tripId, noteData);
      const created = data.note || data;
      setNotes((prev) => [created, ...prev]);
      toast.success('Note saved');
      return created;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId]);

  const editNote = useCallback(async (noteId, noteData) => {
    if (IS_DEMO) {
      const updated = { ...noteData, id: noteId, updatedAt: new Date().toISOString() };
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)));
      toast.success('Note updated');
      return updated;
    }
    try {
      const { data } = await updateNoteApi(tripId, noteId, noteData);
      const updated = data.note || data;
      setNotes((prev) => prev.map((n) => (n.id === noteId || n._id === noteId ? { ...n, ...updated } : n)));
      toast.success('Note updated');
      return updated;
    } catch (err) {
      toast.error(parseError(err));
      throw err;
    }
  }, [tripId]);

  const removeNote = useCallback(async (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId && n._id !== noteId));
    toast.success('Note deleted');
    if (!IS_DEMO) {
      try {
        await deleteNoteApi(tripId, noteId);
      } catch (err) {
        toast.error(parseError(err));
        throw err;
      }
    }
  }, [tripId]);

  const prependNote = useCallback((note) => { setNotes((prev) => [note, ...prev]); }, []);
  const updateNoteInState = useCallback((noteId, updates) => { setNotes((prev) => prev.map((n) => (n.id === noteId || n._id === noteId ? { ...n, ...updates } : n))); }, []);
  const deleteNoteInState = useCallback((noteId) => { setNotes((prev) => prev.filter((n) => n.id !== noteId && n._id !== noteId)); }, []);

  return { notes, loading, fetchNotes, addNote, editNote, removeNote, prependNote, updateNoteInState, deleteNoteInState };
};

export default useNotes;
