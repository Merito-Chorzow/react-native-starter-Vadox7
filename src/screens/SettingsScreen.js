import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const [largeText, setLargeText] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header} accessibilityRole="header">
        O aplikacji
      </Text>

      <Text style={[styles.text, largeText && styles.textLarge]}>
        GeoNotes – demo: lista notatek, szczegóły, formularz, GPS + API (json-server).
      </Text>

      <View
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel="Przełącz większy tekst"
      >
        <Text style={[styles.text, largeText && styles.textLarge]}>Większy tekst</Text>
        <Switch value={largeText} onValueChange={setLargeText} />
      </View>

      <Text style={[styles.muted, largeText && styles.textLarge]}>Wersja: 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  header: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 22 },
  textLarge: { fontSize: 18, lineHeight: 26 },
  row: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  muted: { marginTop: 18, color: "#6b7280" },
});
