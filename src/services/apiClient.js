import { API_BASE_URL } from "../utils/apiConfig";

// Funkcja pomocnicza do timeout
function fetchWithTimeout(url, options, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Serwer nie odpowiada")), timeout)
    ),
  ]);
}

export async function apiFetch(path, options = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetchWithTimeout(
      url,
      {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      },
      5000 // 5 sekund timeout
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }

    return res.status === 204 ? null : res.json();
  } catch (error) {
    // Obsługa błędów sieciowych
    if (
      error.message.includes("Network request failed") ||
      error.message.includes("Failed to connect") ||
      error.message.includes("Timeout")
    ) {
      throw new Error(
        `Nie można połączyć się z serwerem API (${API_BASE_URL}). Upewnij się, że serwer jest uruchomiony (npm run server).`
      );
    }
    // Obsługa innych błędów
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        `Błąd połączenia z API. Sprawdź czy serwer działa na ${API_BASE_URL}`
      );
    }
    throw error;
  }
}

