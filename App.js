import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NotesProvider } from "./src/store/NotesContext";

import NotesListScreen from "./src/screens/NotesListScreen";
import NoteDetailsScreen from "./src/screens/NoteDetailsScreen";
import NoteFormScreen from "./src/screens/NoteFormScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NotesProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="NotesList" component={NotesListScreen} options={{ title: "Notatki" }} />
          <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} options={{ title: "Szczegóły" }} />
          <Stack.Screen name="NoteForm" component={NoteFormScreen} options={{ title: "Dodaj / Edytuj" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Ustawienia" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NotesProvider>
  );
}

