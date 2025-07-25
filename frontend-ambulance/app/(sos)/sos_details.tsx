import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';

// Mock data - in a real app, this would come from props or context
interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface PatientDetails {
  name: string;
  age: number;
  gender: string;
  bloodType?: string;
  medicalInfo?: string[];
  allergies?: string[];
  emergencyContacts?: EmergencyContact[];
}

interface AccidentDetails {
  time: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface SOSDetails {
  id: string;
  patient: PatientDetails;
  accident: AccidentDetails;
}

const SOSDetailsScreen: React.FC = () => {
  const [sosDetails, setSOSDetails] = useState<SOSDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [region, setRegion] = useState({
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    latitude: 37.7858,
    longitude: -122.4064,
  });

  const router = useRouter();

  // Fetch SOS details
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockSOSDetails: SOSDetails = {
        id: '123456',
        patient: {
          name: 'Pritam Das',
          age: 19,
          gender: 'Male',
          bloodType: 'O+',
          medicalInfo: ['Diabetes Type 2', 'Hypertension'],
          allergies: ['Penicillin', 'Shellfish'],
          emergencyContacts: [
            {
              name: 'Sagnik Goswami',
              relation: 'Friend',
              phone: '+91 84362 87919',
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
      
      setSOSDetails(mockSOSDetails);
      setLoading(false);
      
      // Update map region based on accident location
      if (mockSOSDetails.accident && mockSOSDetails.accident.location) {
        setRegion({
          ...region,
          latitude: mockSOSDetails.accident.location.latitude,
          longitude: mockSOSDetails.accident.location.longitude,
        });
      }
    }, 1000);
  }, []);

  const handleAccept = () => {
    Alert.alert(
      "Accept SOS Request",
      "You are about to accept this SOS request. You will be navigated to the incident location.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          style: "default",
          onPress: () => {
            console.log("SOS accepted");
            router.push("/navigation");
          }
        }
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      "Decline SOS Request",
      "Are you sure you want to decline this emergency request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Decline", 
          style: "destructive",
          onPress: () => {
            console.log("SOS declined");
            router.push("/dashboard");
          }
        }
      ]
    );
  };

  const openMap = () => {
    if (!sosDetails) return;
    
    const { latitude, longitude } = sosDetails.accident.location;
    const label = sosDetails.accident.location.address;
    
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios' 
      ? `${scheme}?q=${label}&ll=${latitude},${longitude}`
      : `${scheme}${latitude},${longitude}?q=${label}`;
      
    Linking.openURL(url);
  };

  const callContact = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading || !sosDetails) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading SOS details...</Text>
      </SafeAreaView>
    );
  }

  const formattedAccidentTime = new Date(sosDetails.accident.time).toLocaleString();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency SOS Request</Text>
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapView}
            region={region}
            initialRegion={region}
          >
            <Marker
              coordinate={{
                latitude: sosDetails.accident.location.latitude,
                longitude: sosDetails.accident.location.longitude
              }}
              title="Incident Location"
              description={sosDetails.accident.location.address}
            >
              <FontAwesome name="map-marker" size={30} color="#d32f2f" />
            </Marker>
          </MapView>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.mapButtonText}>Navigate to Patient</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{sosDetails.patient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{sosDetails.patient.age} years</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{sosDetails.patient.gender}</Text>
            </View>
            {sosDetails.patient.bloodType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blood Type:</Text>
                <Text style={styles.infoValue}>{sosDetails.patient.bloodType}</Text>
              </View>
            )}
            
            {sosDetails.patient.medicalInfo && sosDetails.patient.medicalInfo.length > 0 && (
              <View style={styles.listContainer}>
                <Text style={[styles.infoLabel, { width: '100%' }]}>Medical Conditions:</Text>
                {sosDetails.patient.medicalInfo.map((info, index) => (
                  <Text key={`med-${index}`} style={styles.listItem}>• {info}</Text>
                ))}
              </View>
            )}
            
            {sosDetails.patient.allergies && sosDetails.patient.allergies.length > 0 && (
              <View style={styles.listContainer}>
                <Text style={styles.infoLabel}>Allergies:</Text>
                {sosDetails.patient.allergies.map((allergy, index) => (
                  <Text key={`allergy-${index}`} style={styles.listItem}>• {allergy}</Text>
                ))}
              </View>
            )}
          </View>
          {/* Add this right after the patient details infoCard closing View tag */}
          <TouchableOpacity 
            style={styles.documentsButton}
            onPress={() => Alert.alert('Medical Documents', 'Medical documents will be displayed here.')}
          >
            <MaterialIcons name="description" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>View Medical Documents</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts Section */}
        {sosDetails.patient.emergencyContacts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {sosDetails.patient.emergencyContacts.map((contact, index) => (
              <View key={`contact-${index}`} style={styles.contactCard}>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.phoneButton}
                  onPress={() => callContact(contact.phone)}
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
            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{formattedAccidentTime}</Text>
            </View> */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{sosDetails.accident.location.address}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]} 
          onPress={handleDecline}
        >
          <Text style={styles.actionButtonText}>Decline SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]} 
          onPress={handleAccept}
        >
          <Text style={styles.actionButtonText}>Accept SOS</Text>
        </TouchableOpacity>
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
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    padding: 16,
    paddingBottom: 8,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  listContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 16,
    marginTop: 4,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactRelation: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phoneButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  mapSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    height: 200,
    position: 'relative',
  },
  mapView: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  mapButton: {
    position: 'absolute',
    bottom: 16,
    right: 32,
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  mapButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
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
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: '#f44336',
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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
    width: '92%',
    alignSelf: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default SOSDetailsScreen;