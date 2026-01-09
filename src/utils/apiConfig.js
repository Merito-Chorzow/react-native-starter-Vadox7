import { Platform } from "react-native";

// Ustaw IP komputera (to które widzisz w Expo, np. 192.168.1.3)
// Jak znaleźć IP: Windows (PowerShell) -> ipconfig -> szukaj IPv4 Address przy aktywnym Wi-Fi
// W Expo IP jest widoczne przy starcie: exp://192.168.1.3:8081
const LAN_IP = "192.168.1.3";

export const API_BASE_URL =
  Platform.OS === "android"
    ? `http://${LAN_IP}:3000` // działa na telefonie i zazwyczaj też na emulatorze
    : "http://localhost:3000"; // iOS simulator

// Jeśli uruchamiasz SPECYFICZNIE na emulatorze i LAN_IP nie działa,
// zmień tymczasowo na: "http://10.0.2.2:3000"

