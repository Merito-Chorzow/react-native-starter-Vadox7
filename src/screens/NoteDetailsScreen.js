import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useNotes } from "../store/NotesContext";

export default function NoteDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { state, deleteNote } = useNotes();

  const note = useMemo(() => state.items.find((n) => n.id === id), [state.items, id]);

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16 }}>Nie znaleziono notatki.</Text>
      </View>
    );
  }

  const locText =
    note.location?.lat && note.location?.lng
      ? `${note.location.lat.toFixed(5)}, ${note.location.lng.toFixed(5)}`
      : "Brak";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {note.title}
      </Text>

      <Text style={styles.label}>Opis</Text>
      <Text style={styles.body}>{note.description || "—"}</Text>

      <Text style={styles.label}>Lokalizacja</Text>
      <Text style={styles.body}>📍 {locText}</Text>

      <Text style={styles.label}>Zdjęcie</Text>
      {note.photoUri ? (
        <Image source={{ uri: note.photoUri }} style={styles.image} accessibilityLabel="Zdjęcie notatki" />
      ) : (
        <Text style={styles.body}>Brak</Text>
      )}

      <View style={{ height: 12 }} />

      <Pressable
        style={styles.btnPrimary}
        onPress={() => navigation.navigate("NoteForm", { mode: "edit", id: note.id })}
        accessibilityRole="button"
        accessibilityLabel="Edytuj notatkę"
        hitSlop={8}
      >
        <Text style={styles.btnText}>Edytuj</Text>
      </Pressable>

      <Pressable
        style={styles.btnSecondary}
        onPress={() => {
          Alert.alert("Usunąć notatkę?", "Tej operacji nie da się cofnąć.", [
            { text: "Anuluj", style: "cancel" },
            {
              text: "Usuń",
              style: "destructive",
              onPress: async () => {
                await deleteNote(note.id);
                navigation.navigate("NotesList");
              },
            },
          ]);
        }}
        accessibilityRole="button"
        accessibilityLabel="Usuń notatkę"
        hitSlop={8}
      >
        <Text style={styles.btnText}>Usuń</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  label: { marginTop: 12, fontSize: 14, fontWeight: "800", color: "#374151" },
  body: { marginTop: 6, fontSize: 16, lineHeight: 22 },
  image: { width: "100%", height: 220, borderRadius: 14, marginTop: 8, backgroundColor: "#e5e7eb" },

  btnPrimary: {
    minHeight: 48,
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  btnSecondary: {
    minHeight: 48,
    backgroundColor: "#374151",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "800" },
});
