import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import socket from "../utils/socket";

interface SocketContextType {
    socket: Socket;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            setIsConnected(true);

            // Optional: auto register
            socket.emit("register", {
                id: "YOUR_AMBULANCE_OR_HOSPITAL_ID",
                role: "ambulance",
            });
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
