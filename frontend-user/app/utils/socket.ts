import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_API_URL, {
  transports: ["websocket"], // Required for Expo
  autoConnect: false,        // Control connection manually
});

export default socket;
