// app/dashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Text, Avatar, Button, Surface, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function DashboardScreen() {
    const [isSOSActive, setIsSOSActive] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const countdownTimer = useRef<NodeJS.Timeout | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start pulse animation for SOS button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        return () => {
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
            }
        };
    }, []);

    const handleSOSPress = () => {
        setIsSOSActive(true);
        setCountdown(3);

        countdownTimer.current = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(countdownTimer.current as NodeJS.Timeout);
                    // Delay navigation until after the render phase
                    setTimeout(() => {
                        router.push('/sos-active');
                    }, 0);
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);
    };

    const handleCancelSOS = () => {
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
        }
        setIsSOSActive(false);
    };

    const handleHelpOthersPress = () => {
        router.push('/sos-others');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, Pritam</Text>
                    <Text style={styles.subGreeting}>How are you feeling today?</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Avatar.Image
                        size={50}
                        source={require('../../assets/avatar.png')}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                {isSOSActive ? (
                    <Surface style={styles.countdownContainer}>
                        <Text style={styles.countdownText}>SOS will be sent in</Text>
                        <Text style={styles.countdown}>{countdown}</Text>
                        <Button
                            mode="contained"
                            onPress={handleCancelSOS}
                            style={styles.cancelButton}
                            buttonColor="#ff3b30"
                        >
                            Cancel
                        </Button>
                    </Surface>
                ) : (
                    <Animated.View
                        style={[
                            styles.sosButtonContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.sosButton}
                            onPress={handleSOSPress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sosSmallerText}>Self</Text>
                            <Text style={styles.sosText}>SOS</Text>
                            <Text style={styles.sosSmallerText}>I need help!</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <TouchableOpacity
                    style={styles.helpOthersContainer}
                    onPress={handleHelpOthersPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="people" size={40} color="#e74c3c" />
                    <View>
                        <Text style={styles.helpOthersTitle}>Others - SOS</Text>
                        <Text style={styles.helpOthersDescription}>
                            Help someone else in need
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.bottomNav}>
                <IconButton
                    icon="home"
                    size={28}
                    iconColor="#0066cc"
                    onPress={() => { }}
                    style={styles.activeNavItem}
                />
                <IconButton
                    icon="map-search"
                    size={28}
                    iconColor="#666666"
                    onPress={() => Alert.alert('Nearby Facilities', 'Nearby facilities page would be implemented here')}
                />
                <IconButton
                    icon="history"
                    size={28}
                    iconColor="#666666"
                    onPress={() => Alert.alert('History', 'History page would be implemented here')}
                />
                <IconButton
                    icon="cog"
                    size={28}
                    iconColor="#666666"
                    onPress={() => router.push('/settings')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 20 + Constants.statusBarHeight,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
    },
    subGreeting: {
        fontSize: 16,
        color: '#666666',
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    sosButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    sosButton: {
        width: '90%',
        aspectRatio: 1,
        borderRadius: '50%',
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        
        elevation: 8,
    },
    sosText: {
        color: '#ffffff',
        fontSize: 60,
        fontWeight: 'bold',
    },
    sosSmallerText: {
        color: '#ffffff',
        fontSize: 20,
        marginTop: 8,
    },
    countdownContainer: {
        width: '90%',
        aspectRatio: 1,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff3f3',
        padding: 20,
        marginVertical: 20,
        elevation: 4,
    },
    countdownText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    countdown: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginVertical: 12,
    },
    cancelButton: {
        marginTop: 10,
        width: 200,
    },
    helpOthersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,

        borderColor: '#e74c3c',
        borderWidth: 3,
        backgroundColor: '#ffeae8',
        borderRadius: 30,
        paddingHorizontal: 40,
        paddingVertical: 20,
        marginTop: 50,
        marginBottom: 20,

        width: '95%',
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    helpOthersTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    helpOthersDescription: {
        fontSize: 20,
        color: '#e74c3c',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
        paddingVertical: 8,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 10,
    },
    activeNavItem: {
        backgroundColor: '#e6f2ff',
    },
    profileIconContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#e74c3c',
    },
});