import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Linking,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import axios from 'axios';


function formatSecondsToMinutesSeconds(secondsStr: string): string {
    const totalSeconds = parseFloat(secondsStr);

    if (isNaN(totalSeconds)) {
        return "Error: Invalid input string. Not a number.";
    }

    if (totalSeconds < 0) {
        return "Error: Duration cannot be negative.";
    }

    if (totalSeconds < 60) {
        return "soon";
    } else {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const formattedMinutes = minutes.toString();
        const formattedSeconds = seconds.toString().padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }
}

// Mock data for the route
const mockRoute = {
    destination: {
        latitude: 22.560706299670564,
        longitude: 88.41350824577506,
        address: 'Chingrihata, Kolkata, West Bengal',
    },
    // Mock user's current position
    origin: {
        latitude: 22.578138277208723,
        longitude: 88.40194515272319,
        address: 'Current Location',
    },
    eta: 12, // minutes
    distance: 3.8, // kilometers
};

// Mock patient data
const mockSOSDetails = {
    id: '123456',
    patient: {
        name: 'Pritam Das',
        age: 19,
        gender: 'Male',
        bloodType: 'B+',
        medicalInfo: ['Diabetes Type 2', 'Hypertension'],
        allergies: ['Penicillin', 'Shellfish'],
        emergencyContacts: [
            {
                name: 'Sagnik Goswami',
                relation: 'Friend',
                phone: '84362 87919',
            },
        ],
    },
    accident: {
        time: Date.now() - 1000 * 60 * 10, // 10 minutes ago
        location: {
            latitude: 22.560706299670564,
            longitude: 88.41350824577506,
            address: 'Bidhannagar, Kolkata, West Bengal',
        },
    },
};


const NavigationScreen = () => {
    const [loading, setLoading] = useState(true);
    const [activeMode, setActiveMode] = useState('driver'); // 'driver' or 'paramedic'
    const [region, setRegion] = useState({
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0221,
        latitude: mockRoute.origin.latitude,
        longitude: mockRoute.origin.longitude,
    });

    const [eta, setEta] = useState('');
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);


    const router = useRouter();

    useEffect(() => {
        // Simulate loading delay
        setTimeout(() => {
            setLoading(false);

            // Set region to fit the route
            const midLatitude = (mockRoute.origin.latitude + mockRoute.destination.latitude) / 2;
            const midLongitude = (mockRoute.origin.longitude + mockRoute.destination.longitude) / 2;

            setRegion({
                latitude: midLatitude,
                longitude: midLongitude,
                latitudeDelta: 0.0422,
                longitudeDelta: 0.0221,
            });
        }, 1000);
    }, []);


    // useEffect to recalculate route on location update
    useEffect(() => {
        (async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${mockRoute.origin.longitude},${mockRoute.origin.latitude};${mockRoute.destination.longitude},${mockRoute.destination.latitude}?geometries=geojson`;
                const response = await axios.get(url);

                if (response.data && response.data.routes.length > 0) {
                    const coordinates = response.data.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
                        latitude: coord[1],
                        longitude: coord[0],
                    }));

                    const estimatedTime = response.data.routes[0].duration;
                    setEta(formatSecondsToMinutesSeconds(estimatedTime));
                    setRouteCoordinates(coordinates);

                    // console.log(response.data);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        })();
    }, []);



    const handleCancelNavigation = () => {
        Alert.alert(
            "Cancel Navigation",
            "Are you sure you want to cancel navigation to the emergency?",
            [
                { text: "Stay on Route", style: "cancel" },
                {
                    text: "Cancel Navigation",
                    style: "destructive",
                    onPress: () => {
                        // In a real app, this would use proper routing
                        console.log("Navigation cancelled");
                        router.push("/sos_details");
                    }
                }
            ]
        );
    };

    const handleChatWithHospital = () => {
        console.log("Chat with Hospital", "Connecting to hospital...");
        router.push("/communication");
    };

    const handleChatWithPatient = () => {
        console.log("Chat with Patient", "Connecting to patient...");
        router.push("/communication");
    };

    const handleCallHospital = () => {
        Linking.openURL(`tel:5551234567`);
    };

    const handleCallPatient = () => {
        Linking.openURL(`tel:${mockSOSDetails.patient.emergencyContacts[0].phone.replace(/\D/g, '')}`);
    };

    const callContact = () => {
        Linking.openURL(`tel:${mockSOSDetails.patient.emergencyContacts[0].phone.replace(/\D/g, '')}`);
    };

    const formattedAccidentTime = new Date(mockSOSDetails.accident.time).toLocaleString();

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text>Calculating fastest route...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Mode Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            activeMode === 'driver' && styles.activeToggle
                        ]}
                        onPress={() => setActiveMode('driver')}
                    >
                        <Ionicons name="car" size={20} color={activeMode === 'driver' ? 'white' : '#333'} />
                        <Text style={[styles.toggleText, activeMode === 'driver' && styles.activeToggleText]}>Driver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            activeMode === 'paramedic' && styles.activeToggle
                        ]}
                        onPress={() => setActiveMode('paramedic')}
                    >
                        <FontAwesome name="medkit" size={20} color={activeMode === 'paramedic' ? 'white' : '#333'} />
                        <Text style={[styles.toggleText, activeMode === 'paramedic' && styles.activeToggleText]}>Paramedic</Text>
                    </TouchableOpacity>
                </View>

                {/* ETA Info Banner - Always visible in both modes */}
                <View style={styles.etaContainer}>
                    <View style={styles.etaInfoBox}>
                        <Text style={styles.etaLabel}>ETA</Text>
                        <Text style={styles.etaValue}>{eta}</Text>
                    </View>
                    <View style={styles.distanceInfoBox}>
                        <Text style={styles.etaLabel}>Distance</Text>
                        <Text style={styles.etaValue}>{mockRoute.distance} km</Text>
                    </View>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressLabel}>Destination</Text>
                        <Text style={styles.addressValue} numberOfLines={2}>
                            {mockRoute.destination.address}
                        </Text>
                    </View>
                </View>

                {activeMode === 'driver' ? (
                    <>
                        {/* Map View - Driver Mode */}
                        <View style={styles.mapContainer}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.mapView}
                                region={region}
                                initialRegion={region}
                            >
                                {/* Origin Marker */}
                                <Marker
                                    coordinate={mockRoute.origin}
                                    title="Your Location"
                                    description="Current Position"
                                >
                                    <View style={styles.originMarker}>
                                        <Ionicons name="location" size={20} color="white" />
                                    </View>
                                </Marker>

                                {/* Destination Marker */}
                                <Marker
                                    coordinate={mockRoute.destination}
                                    title="Emergency Location"
                                    description={mockRoute.destination.address}
                                >
                                    <FontAwesome name="map-marker" size={30} color="#d32f2f" />
                                </Marker>

                                {/* Route Line */}

                                {routeCoordinates.length > 0 && (
                                    <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="red" />
                                )}
                            </MapView>
                        </View>

                        {/* Bottom Action Buttons - Driver Mode */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancelNavigation}
                            >
                                <Text style={styles.actionButtonText}>Cancel Navigation</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    /* Paramedic Mode */
                    <ScrollView style={styles.paramedicContainer}>
                        {/* Communication Buttons - Paramedic Mode */}
                        <View style={styles.communicationGrid}>
                            <TouchableOpacity
                                style={[styles.communicationButton, styles.hospitalButton]}
                                onPress={handleChatWithHospital}
                            >
                                <Ionicons name="chatbubble" size={24} color="white" style={styles.communicationIcon} />
                                <Text style={styles.communicationText}>Chat Hospital</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.communicationButton, styles.patientButton]}
                                onPress={handleChatWithPatient}
                            >
                                <Ionicons name="chatbubble" size={24} color="white" style={styles.communicationIcon} />
                                <Text style={styles.communicationText}>Chat Patient</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.communicationButton, styles.hospitalCallButton]}
                                onPress={handleCallHospital}
                            >
                                <Ionicons name="call" size={24} color="white" style={styles.communicationIcon} />
                                <Text style={styles.communicationText}>Call Hospital</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.communicationButton, styles.patientCallButton]}
                                onPress={handleCallPatient}
                            >
                                <Ionicons name="call" size={24} color="white" style={styles.communicationIcon} />
                                <Text style={styles.communicationText}>Call Patient</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Patient Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Patient Details</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Name:</Text>
                                    <Text style={styles.infoValue}>{mockSOSDetails.patient.name}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Age:</Text>
                                    <Text style={styles.infoValue}>{mockSOSDetails.patient.age} years</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Gender:</Text>
                                    <Text style={styles.infoValue}>{mockSOSDetails.patient.gender}</Text>
                                </View>
                                {mockSOSDetails.patient.bloodType && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Blood Type:</Text>
                                        <Text style={styles.infoValue}>{mockSOSDetails.patient.bloodType}</Text>
                                    </View>
                                )}

                                {mockSOSDetails.patient.medicalInfo && mockSOSDetails.patient.medicalInfo.length > 0 && (
                                    <View style={styles.listContainer}>
                                        <Text style={[styles.infoLabel, { width: '100%' }]}>Medical Conditions:</Text>
                                        {mockSOSDetails.patient.medicalInfo.map((info, index) => (
                                            <Text key={`med-${index}`} style={styles.listItem}>• {info}</Text>
                                        ))}
                                    </View>
                                )}

                                {mockSOSDetails.patient.allergies && mockSOSDetails.patient.allergies.length > 0 && (
                                    <View style={styles.listContainer}>
                                        <Text style={styles.infoLabel}>Allergies:</Text>
                                        {mockSOSDetails.patient.allergies.map((allergy, index) => (
                                            <Text key={`allergy-${index}`} style={styles.listItem}>• {allergy}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.documentsButton}
                                onPress={() => Alert.alert('Medical Documents', 'Medical documents will be displayed here.')}
                            >
                                <MaterialIcons name="description" size={20} color="white" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>View Medical Documents</Text>
                            </TouchableOpacity>
                        </View>



                        {/* Emergency Contacts Section */}
                        {mockSOSDetails.patient.emergencyContacts && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                                {mockSOSDetails.patient.emergencyContacts.map((contact, index) => (
                                    <View key={`contact-${index}`} style={styles.contactCard}>
                                        <View>
                                            <Text style={styles.contactName}>{contact.name}</Text>
                                            <Text style={styles.contactRelation}>{contact.relation}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.phoneButton}
                                            onPress={() => callContact()}
                                        >
                                            <Ionicons name="call" size={20} color="white" />
                                            <Text style={styles.phoneButtonText}>Call</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Accident Details Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Accident Details</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Time:</Text>
                                    <Text style={styles.infoValue}>{formattedAccidentTime}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Location:</Text>
                                    <Text style={styles.infoValue}>{mockSOSDetails.accident.location.address}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: 30,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        margin: 16,
        marginBottom: 0,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    activeToggle: {
        backgroundColor: '#2196f3',
    },
    toggleText: {
        marginLeft: 8,
        fontWeight: '500',
        color: '#333',
    },
    activeToggleText: {
        color: 'white',
    },
    etaContainer: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexWrap: 'wrap',
    },
    etaInfoBox: {
        padding: 8,
        marginRight: 12,
    },
    distanceInfoBox: {
        padding: 8,
        marginRight: 12,
    },
    etaLabel: {
        fontSize: 12,
        color: '#757575',
    },
    etaValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    addressContainer: {
        flex: 1,
        padding: 8,
        minWidth: '100%',
        marginTop: 8,
    },
    addressLabel: {
        fontSize: 12,
        color: '#757575',
    },
    addressValue: {
        fontSize: 14,
        color: '#333333',
        marginTop: 4,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    mapView: {
        ...StyleSheet.absoluteFillObject,
    },
    originMarker: {
        backgroundColor: '#2196f3',
        borderRadius: 10,
        padding: 5,
        borderWidth: 2,
        borderColor: 'white',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    startButton: {
        backgroundColor: '#4caf50',
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        marginRight: 8,
    },
    actionButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    // Paramedic Mode Styles
    paramedicContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    communicationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'space-between',
    },
    communicationButton: {
        width: '48%',
        paddingVertical: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    communicationIcon: {
        marginBottom: 8,
    },
    communicationText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    hospitalButton: {
        backgroundColor: '#2196f3', // Blue
    },
    patientButton: {
        backgroundColor: '#9c27b0', // Purple
    },
    hospitalCallButton: {
        backgroundColor: '#00897b', // Teal
    },
    patientCallButton: {
        backgroundColor: '#ff7043', // Deep Orange
    },
    section: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: 'bold',
        width: 120,
        color: '#555',
    },
    infoValue: {
        flex: 1,
        color: '#333',
    },
    listContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    listItem: {
        marginLeft: 16,
        marginTop: 4,
        color: '#333',
    },
    contactCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    contactName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    contactRelation: {
        color: '#666',
        marginTop: 4,
    },
    phoneButton: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    documentsButton: {
        backgroundColor: '#3f51b5',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
});

export default NavigationScreen;