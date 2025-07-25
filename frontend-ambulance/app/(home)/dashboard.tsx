import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../context/SocketContext';

// Define TypeScript interfaces
interface SOSRequest {
    id: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    timestamp: number;
    patient?: {
        name?: string;
        age?: number;
        condition?: string;
        vitals?: string;
    };
}

const SOSDashboard: React.FC = () => {
    // precoded mock data
    const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([
        {
            id: '1',
            location: {
                latitude: 37.7749,
                longitude: -122.4194,
                address: '123 Main St, San Francisco, CA'
            },
            timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
            patient: {
                name: 'John Doe',
                age: 45,
                condition: 'Chest pain',
                vitals: 'BP: 140/90, HR: 95'
            }
        },
        {
            id: '2',
            location: {
                latitude: 37.7833,
                longitude: -122.4167,
                address: '456 Market St, San Francisco, CA'
            },
            timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
            patient: {
                name: 'Jane Smith',
                age: 32,
                condition: 'Breathing difficulty',
                vitals: 'SpO2: 92%, RR: 24'
            }
        },
        {
            id: '3',
            location: {
                latitude: 37.7694,
                longitude: -122.4862,
                address: '789 Ocean Ave, San Francisco, CA'
            },
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        }
    ]);
    const [isAvailable, setIsAvailable] = useState<boolean>(true);
    const router = useRouter();

    const {socket, isConnected} = useSocket();

    useEffect(() => {
        if (!socket) return;
    
        const handleNewEmergency = (data: any) => {
          console.log('Received new emergency:', data);
        };
    
        socket.on('new-emergency', handleNewEmergency);
    
        return () => {
          socket.off('new-emergency', handleNewEmergency); // cleanup
        };
      }, [socket]);
    

    const toggleAvailability = () => {
        setIsAvailable(!isAvailable);
    };

    const navigateToSettings = () => {
        // Simply navigate to the settings page
        router.push("/settings");
    };

    const navigateToProfile = () => {
        // Simply navigate to the profile page
        router.push("/profile");
    };

    const navigateToSOSDashboard = () => {
        // Simply navigate back to this same dashboard page
        router.push("/sos_details");
    };

    const timeSince = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return `${seconds}s ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const renderSOSItem = ({ item }: { item: SOSRequest }) => (
        <TouchableOpacity
            style={styles.sosItem}
            onPress={() => navigateToSOSDashboard()} // Simply route to SOSDashboard page
        >
            <View style={styles.sosContent}>
                <View style={styles.mapContainer}>
                    <Image
                        source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${item.location.latitude},${item.location.longitude}&zoom=15&size=100x100&markers=color:red%7C${item.location.latitude},${item.location.longitude}&key=YOUR_API_KEY` }}
                        style={styles.mapImage}
                    />
                </View>
                <View style={styles.sosDetails}>
                    <Text style={styles.sosAddress} numberOfLines={1}>
                        {item.location.address}
                    </Text>
                    <Text style={styles.sosTime}>{timeSince(item.timestamp)}</Text>
                    {item.patient && (
                        <Text style={styles.patientInfo} numberOfLines={2}>
                            {item.patient.name && `${item.patient.name}, `}
                            {item.patient.age && `${item.patient.age} y/o, `}
                            {item.patient.condition}
                        </Text>
                    )}
                    {item.patient?.vitals && (
                        <Text style={styles.vitals} numberOfLines={1}>
                            {item.patient.vitals}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* Added extra top spacing view */}
            <View style={styles.topSpacing} />

            <View style={styles.header}>
                <Text style={styles.title}>Active Incidents</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[styles.statusButton, isAvailable ? styles.statusAvailable : styles.statusUnavailable]}
                        onPress={toggleAvailability}
                    >
                        <Text style={styles.statusButtonText}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </Text>
                    </TouchableOpacity>

                    {/* Added Settings Button */}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={navigateToSettings}
                    >
                        <Text style={styles.iconButtonText}>⚙️</Text>
                    </TouchableOpacity>

                    {/* Added Profile Button */}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={navigateToProfile}
                    >
                        <Text style={styles.iconButtonText}>👤</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={sosRequests}
                renderItem={renderSOSItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />

            {sosRequests.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No active incidents</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    // Added new style for top spacing
    topSpacing: {
        height: 20, // Increase this value for more top spacing
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20, // Added extra padding at the top of header
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    statusAvailable: {
        backgroundColor: '#4caf50',
    },
    statusUnavailable: {
        backgroundColor: '#f44336',
    },
    statusButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    iconButtonText: {
        fontSize: 18,
    },
    listContainer: {
        padding: 16,
    },
    sosItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    sosContent: {
        flexDirection: 'row',
        padding: 12,
    },
    mapContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    sosDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    sosAddress: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    sosTime: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8,
    },
    patientInfo: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 4,
    },
    vitals: {
        fontSize: 14,
        fontWeight: '500',
        color: '#d32f2f',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#757575',
    },
});

export default SOSDashboard;