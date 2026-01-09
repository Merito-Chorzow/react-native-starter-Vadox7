import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useNotes } from "../store/NotesContext";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function NotesListScreen({ navigation }) {
  const { state, refresh } = useNotes();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("NoteForm", { mode: "create" })}
          accessibilityRole="button"
          accessibilityLabel="Dodaj nową notatkę"
          hitSlop={8}
        >
          <Text style={styles.btnText}>Dodaj notatkę</Text>
        </Pressable>

        <Pressable
          style={styles.btnSecondary}
          onPress={() => navigation.navigate("Settings")}
          accessibilityRole="button"
          accessibilityLabel="Przejdź do ustawień"
          hitSlop={8}
        >
          <Text style={styles.btnText}>Ustawienia</Text>
        </Pressable>
      </View>

      {state.loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Ładowanie…</Text>
        </View>
      ) : state.error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Błąd: {state.error}</Text>
          <Pressable style={styles.btnPrimary} onPress={refresh} accessibilityRole="button">
            <Text style={styles.btnText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      ) : state.items.length === 0 ? (
        <View style={styles.center} accessibilityRole="summary">
          <Text style={styles.emptyTitle}>Brak notatek</Text>
          <Text style={styles.emptySub}>
            Dodaj pierwszą notatkę i pobierz lokalizację GPS lub dodaj zdjęcie.
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.items}
          keyExtractor={(item) => item.id}
          onRefresh={refresh}
          refreshing={state.loading}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const hasLoc = item.location?.lat && item.location?.lng;
            const marker = hasLoc ? "📍" : "—";
            return (
              <Pressable
                onPress={() => navigation.navigate("NoteDetails", { id: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Otwórz notatkę: ${item.title}`}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.thumb}>
                    <Text style={{ fontSize: 18 }}>{marker}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  topRow: { gap: 10 },

  btnPrimary: {
    minHeight: 48,
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  btnSecondary: {
    minHeight: 48,
    backgroundColor: "#374151",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "700" },

  card: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 14, marginVertical: 6 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 2, color: "#6b7280" },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  errorText: { color: "#b91c1c", marginBottom: 8, textAlign: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptySub: { marginTop: 6, color: "#6b7280", textAlign: "center" },
});
