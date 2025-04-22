// app/profile.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, List, Avatar, Divider, Portal, Dialog, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type EmergencyContact = {
    id: string;
    name: string;
    relationship: string;
    phone: string;
};

const initialUserData = {
    name: 'Pritam Das',
    age: '19',
    gender: 'Male',
    bloodType: 'B+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Aspirin (daily), Lisinopril',
    medicalConditions: 'Hypertension, Asthma',
    address: 'Birati, Kolkata - 700051',
    phoneNumber: '+917044849316',
    email: 'das06.pritam@gmail.com',
};

const initialContacts: EmergencyContact[] = [
    { id: '1', name: 'Sagnik Goswami', relationship: 'Friend', phone: '+918436287919' },
];

export default function ProfileScreen() {
    const [userData, setUserData] = useState(initialUserData);
    const [contacts, setContacts] = useState(initialContacts);
    const [editMode, setEditMode] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [contactDialogVisible, setContactDialogVisible] = useState(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [newContact, setNewContact] = useState<EmergencyContact>({
        id: '',
        name: '',
        relationship: '',
        phone: '',
    });

    const handleSaveProfile = () => {
        // Here you would update the user profile via API
        Alert.alert('Success', 'Profile updated successfully');
        setEditMode(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const showAddContactDialog = () => {
        setNewContact({ id: Date.now().toString(), name: '', relationship: '', phone: '' });
        setEditingContact(null);
        setContactDialogVisible(true);
    };

    const showEditContactDialog = (contact: EmergencyContact) => {
        setEditingContact(contact);
        setNewContact({ ...contact });
        setContactDialogVisible(true);
    };

    const handleDeleteContact = (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to remove this emergency contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setContacts(contacts.filter(contact => contact.id !== id));
                    },
                },
            ]
        );
    };

    const handleSaveContact = () => {
        if (!newContact.name || !newContact.phone) {
            Alert.alert('Error', 'Name and phone number are required');
            return;
        }

        if (editingContact) {
            // Update existing contact
            setContacts(contacts.map(c => c.id === editingContact.id ? newContact : c));
        } else {
            // Add new contact
            setContacts([...contacts, newContact]);
        }
        setContactDialogVisible(false);
    };

    const renderMedicalRecords = () => (
        <Card style={styles.card}>
            <Card.Title title="Medical Records" left={(props) => <List.Icon {...props} icon="file-document" />} />
            <Card.Content>
                <List.Item
                    title="Complete Medical History.pdf"
                    description="Uploaded: Jan 15, 2025"
                    left={props => <List.Icon {...props} icon="file-pdf-box" />}
                    right={props => <List.Icon {...props} icon="download" />}
                />
                <Divider />
                <List.Item
                    title="Blood Test Results.pdf"
                    description="Uploaded: Mar 20, 2025"
                    left={props => <List.Icon {...props} icon="file-pdf-box" />}
                    right={props => <List.Icon {...props} icon="download" />}
                />
                <Button
                    mode="outlined"
                    icon="upload"
                    style={styles.uploadButton}
                    onPress={() => Alert.alert('Upload', 'File upload functionality would be implemented here')}
                >
                    Upload New Record
                </Button>
            </Card.Content>
        </Card>
    );

    const renderEmergencyContacts = () => (
        <Card style={styles.card}>
            <Card.Title
                title="Emergency Contacts"
                left={(props) => <List.Icon {...props} icon="account-multiple" />}
                right={(props) => (
                    <IconButton
                        {...props}
                        icon="plus"
                        onPress={showAddContactDialog}
                    />
                )}
            />
            <Card.Content>
                {contacts.length === 0 ? (
                    <Text style={styles.noContactsText}>No emergency contacts added yet</Text>
                ) : (
                    contacts.map((contact) => (
                        <View key={contact.id}>
                            <List.Item
                                title={contact.name}
                                description={`${contact.relationship} • ${contact.phone}`}
                                left={props => <Avatar.Icon {...props} size={40} icon="account" style={styles.contactAvatar} />}
                                right={props => (
                                    <View style={styles.contactActions}>
                                        <IconButton
                                            {...props}
                                            icon="pencil"
                                            size={20}
                                            onPress={() => showEditContactDialog(contact)}
                                        />
                                        <IconButton
                                            {...props}
                                            icon="delete"
                                            size={20}
                                            onPress={() => handleDeleteContact(contact.id)}
                                        />
                                    </View>
                                )}
                            />
                            <Divider />
                        </View>
                    ))
                )}
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Avatar.Icon size={80} icon="account" style={styles.avatar} />
                    <View style={styles.headerText}>
                        <Text style={styles.name}>{userData.name}</Text>
                        <Text style={styles.subheader}>
                            {userData.age} years • {userData.bloodType}
                        </Text>
                    </View>
                    <Button
                        mode={editMode ? "contained" : "outlined"}
                        icon={editMode ? "content-save" : "pencil"}
                        onPress={() => editMode ? handleSaveProfile() : setEditMode(true)}
                        style={styles.editButton}
                    >
                        {editMode ? "Save" : "Edit"}
                    </Button>
                </View>

                <Card style={styles.card}>
                    <Card.Title title="Personal Information" left={(props) => <List.Icon {...props} icon="account-details" />} />
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Full Name:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.name}
                                    onChangeText={(text) => handleInputChange('name', text)}
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.name}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Age:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.age}
                                    onChangeText={(text) => handleInputChange('age', text)}
                                    keyboardType="number-pad"
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.age} years</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Gender:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.gender}
                                    onChangeText={(text) => handleInputChange('gender', text)}
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.gender}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Blood Type:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.bloodType}
                                    onChangeText={(text) => handleInputChange('bloodType', text)}
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.bloodType}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                    keyboardType="email-address"
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.email}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Phone:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.phoneNumber}
                                    onChangeText={(text) => handleInputChange('phoneNumber', text)}
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    dense
                                />
                            ) : (
                                <Text style={styles.value}>{userData.phoneNumber}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Address:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.address}
                                    onChangeText={(text) => handleInputChange('address', text)}
                                    style={styles.input}
                                    dense
                                    multiline
                                />
                            ) : (
                                <Text style={styles.value}>{userData.address}</Text>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Title title="Medical Information" left={(props) => <List.Icon {...props} icon="medical-bag" />} />
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Allergies:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.allergies}
                                    onChangeText={(text) => handleInputChange('allergies', text)}
                                    style={styles.input}
                                    dense
                                    multiline
                                />
                            ) : (
                                <Text style={styles.value}>{userData.allergies || 'None'}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Medications:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.medications}
                                    onChangeText={(text) => handleInputChange('medications', text)}
                                    style={styles.input}
                                    dense
                                    multiline
                                />
                            ) : (
                                <Text style={styles.value}>{userData.medications || 'None'}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Medical Conditions:</Text>
                            {editMode ? (
                                <TextInput
                                    value={userData.medicalConditions}
                                    onChangeText={(text) => handleInputChange('medicalConditions', text)}
                                    style={styles.input}
                                    dense
                                    multiline
                                />
                            ) : (
                                <Text style={styles.value}>{userData.medicalConditions || 'None'}</Text>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                {renderMedicalRecords()}
                {renderEmergencyContacts()}
            </ScrollView>

            <Portal>
                <Dialog visible={contactDialogVisible} onDismiss={() => setContactDialogVisible(false)}>
                    <Dialog.Title>{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Name"
                            value={newContact.name}
                            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                            style={styles.dialogInput}
                        />
                        <TextInput
                            label="Relationship"
                            value={newContact.relationship}
                            onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
                            style={styles.dialogInput}
                        />
                        <TextInput
                            label="Phone Number"
                            value={newContact.phone}
                            onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                            keyboardType="phone-pad"
                            style={styles.dialogInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setContactDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleSaveContact}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        backgroundColor: '#E53935',
    },
    headerText: {
        marginLeft: 20,
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subheader: {
        fontSize: 16,
        color: '#666',
    },
    editButton: {
        width: 100,
    },
    card: {
        margin: 10,
        borderRadius: 10,
        elevation: 2,
    },
    infoRow: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
    },
    input: {
        backgroundColor: '#f9f9f9',
        height: 40,
    },
    uploadButton: {
        marginTop: 15,
        alignSelf: 'center',
    },
    contactAvatar: {
        backgroundColor: '#4CAF50',
    },
    contactActions: {
        flexDirection: 'row',
    },
    noContactsText: {
        textAlign: 'center',
        color: '#888',
        padding: 20,
    },
    dialogInput: {
        marginBottom: 15,
    },
});