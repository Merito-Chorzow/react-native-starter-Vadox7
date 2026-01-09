import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import notesService from "../services/notesService";

const NotesContext = createContext(null);

const initialState = {
  items: [],
  loading: false,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: "" };
    case "LOAD_SUCCESS":
      return { ...state, loading: false, items: action.payload, error: "" };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload || "Błąd" };

    case "UPSERT_LOCAL": {
      const next = [...state.items];
      const idx = next.findIndex((n) => n.id === action.payload.id);
      if (idx >= 0) next[idx] = action.payload;
      else next.unshift(action.payload);
      return { ...state, items: next };
    }

    case "REMOVE_LOCAL":
      return { ...state, items: state.items.filter((n) => n.id !== action.payload) };

    default:
      return state;
  }
}

export function NotesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function refresh() {
    dispatch({ type: "LOAD_START" });
    try {
      const data = await notesService.list();
      // Upewnij się, że data jest tablicą
      const sorted = Array.isArray(data) 
        ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      dispatch({ type: "LOAD_SUCCESS", payload: sorted });
    } catch (e) {
      // Zawsze ustawiamy loading na false, nawet przy błędzie
      dispatch({ type: "LOAD_ERROR", payload: e.message || "Nieznany błąd" });
    }
  }

  async function createNote(note) {
    try {
      const created = await notesService.create(note);
      dispatch({ type: "UPSERT_LOCAL", payload: created });
      return created;
    } catch (error) {
      throw error;
    }
  }

  async function updateNote(id, note) {
    try {
      const updated = await notesService.update(id, note);
      dispatch({ type: "UPSERT_LOCAL", payload: updated });
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async function deleteNote(id) {
    try {
      await notesService.remove(id);
      dispatch({ type: "REMOVE_LOCAL", payload: id });
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ state, refresh, createNote, updateNote, deleteNote }), [state]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}

