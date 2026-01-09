import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Image, ScrollView, Pressable } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useNotes } from "../store/NotesContext";

function nowIso() {
  return new Date().toISOString();
}

export default function NoteFormScreen({ route, navigation }) {
  const { mode, id } = route.params;
  const { state, createNote, updateNote } = useNotes();

  const existing = useMemo(
    () => (mode === "edit" ? state.items.find((n) => n.id === id) : null),
    [mode, id, state.items]
  );

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [location, setLocation] = useState(existing?.location || null);
  const [photoUri, setPhotoUri] = useState(existing?.photoUri || "");
  const [saving, setSaving] = useState(false);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Brak uprawnień", "Aplikacja nie ma dostępu do galerii.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function getGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Brak uprawnień", "Zezwól na lokalizację, aby dodać pozycję GPS.");
      return;
    }

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert("Walidacja", "Tytuł jest wymagany.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const payload = {
          id: String(Date.now()),
          title: title.trim(),
          description: description.trim(),
          createdAt: nowIso(),
          location: location || null,
          photoUri: photoUri || "",
        };
        const created = await createNote(payload);
        navigation.replace("NoteDetails", { id: created.id });
      } else {
        if (!existing) throw new Error("Brak notatki do edycji.");
        const payload = {
          ...existing,
          title: title.trim(),
          description: description.trim(),
          location: location || null,
          photoUri: photoUri || "",
        };
        const updated = await updateNote(existing.id, payload);
        navigation.replace("NoteDetails", { id: updated.id });
      }
    } catch (e) {
      Alert.alert("Błąd zapisu", e.message);
    } finally {
      setSaving(false);
    }
  }

  const locText =
    location?.lat && location?.lng ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Brak";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Tytuł</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Np. Notatka z uczelni"
        style={styles.input}
        accessibilityLabel="Pole tytułu notatki"
      />

      <Text style={styles.label}>Opis</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Treść notatki…"
        style={[styles.input, styles.textarea]}
        multiline
        accessibilityLabel="Pole opisu notatki"
      />

      <Text style={styles.label}>Lokalizacja</Text>
      <Text style={styles.meta}>📍 {locText}</Text>

      <Pressable
        style={styles.btnPrimary}
        onPress={getGps}
        accessibilityRole="button"
        accessibilityLabel="Pobierz lokalizację GPS"
        hitSlop={8}
      >
        <Text style={styles.btnText}>Pobierz GPS</Text>
      </Pressable>

      <Text style={styles.label}>Zdjęcie</Text>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} accessibilityLabel="Wybrane zdjęcie" />
      ) : (
        <Text style={styles.meta}>Brak</Text>
      )}

      <Pressable
        style={styles.btnSecondary}
        onPress={pickImage}
        accessibilityRole="button"
        accessibilityLabel="Wybierz zdjęcie z galerii"
        hitSlop={8}
      >
        <Text style={styles.btnText}>Dodaj zdjęcie z galerii</Text>
      </Pressable>

      <View style={{ height: 12 }} />

      <Pressable
        style={styles.btnPrimary}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="Zapisz notatkę"
        hitSlop={8}
        disabled={saving}
      >
        <Text style={styles.btnText}>{saving ? "Zapisywanie…" : "Zapisz"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  label: { fontSize: 14, fontWeight: "800", color: "#374151", marginTop: 12 },
  meta: { marginTop: 6, color: "#6b7280", fontSize: 14 },
  input: {
    marginTop: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textarea: { minHeight: 120, textAlignVertical: "top" },
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

