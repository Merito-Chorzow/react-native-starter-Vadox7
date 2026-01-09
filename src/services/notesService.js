import { apiFetch } from "./apiClient";

const NOTES_PATH = "/notes";

const notesService = {
  list: () => apiFetch(NOTES_PATH),
  create: (note) => apiFetch(NOTES_PATH, { method: "POST", body: JSON.stringify(note) }),
  update: (id, note) => apiFetch(`${NOTES_PATH}/${id}`, { method: "PUT", body: JSON.stringify(note) }),
  remove: (id) => apiFetch(`${NOTES_PATH}/${id}`, { method: "DELETE" }),
};

export default notesService;

