import { io, Socket } from "socket.io-client";
import { WS_URL } from "../config/firebase";

let socket: Socket | null = null;
let currentToken: string | null = null;

/**
 * Inicializa WebSocket.
 * Si ya existe una conexión, la reutiliza.
 */
export function initSocket(token: string): Socket {
  currentToken = token;

  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("WS ✔️ conectado");
  });

  socket.on("disconnect", () => {
    console.log("WS ❌ desconectado");
  });

  socket.on("connect_error", (err) => {
    console.log("WS ⚠️ error de conexión:", err.message);
  });

  /**
   * Reenvía token al reconectar
   */
  socket.on("reconnect_attempt", () => {
    if (currentToken) {
      socket!.auth = { token: currentToken };
    }
  });

  return socket;
}

/**
 * Desconecta WebSocket limpiamente
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log("WS 🔌 desconectado manualmente");
  }
}

/**
 * Unirse a una carrera
 */
export function joinRace(raceId: string) {
  socket?.emit("join_race", { raceId });
}

/**
 * Salir de una carrera
 */
export function leaveRace(raceId: string) {
  socket?.emit("leave_race", { raceId });
}

/**
 * Enviar ubicación
 */
export function sendLocationUpdate(raceId: string, lat: number, lng: number) {
  socket?.emit("location_update", { raceId, lat, lng });
}

/**
 * Escuchar actualizaciones de ubicación
 */
export function onLocationUpdate(callback: (data: any) => void) {
  if (!socket) return;

  // Previene agregar duplicados
  socket.off("location_update");
  socket.on("location_update", callback);
}

/**
 * Remover listener de ubicación
 */
export function offLocationUpdate() {
  socket?.off("location_update");
}

/**
 * Obtener instancia del socket
 */
export function getSocket(): Socket | null {
  return socket;
}
