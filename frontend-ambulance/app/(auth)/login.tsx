// app/login.tsx
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import React, { useCallback, useEffect, useState } from 'react'
import {
    Text,
    TextInput,
    Button,
    HelperText
} from 'react-native-paper'
import { useRouter } from 'expo-router'

import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO, useSignIn } from '@clerk/clerk-expo'

export const useWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useWarmUpBrowser()
    const { startSSOFlow } = useSSO()

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateInput = () => {
        let isValid = true;

        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    }

    const handleLogin = async () => {
        // if (!validateInput()) return;
        // // router.replace('/dashboard');

        // if (!isLoaded) return;

        // try {
        //     const signInAttempt = await signIn.create({
        //         identifier: email,
        //         password,
        //     })

        //     if (signInAttempt.status === 'complete') {
        //         await setActive({ session: signInAttempt.createdSessionId })
        //         router.replace('/')
        //     } else {
        //         console.error(JSON.stringify(signInAttempt, null, 2))
        //     }
        // } catch (err) {
        //     console.error(JSON.stringify(err, null, 2))
        //     // You might want to set a general error message here
        // }

        router.push('/dashboard');
    };

    const handleOAuth = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: 'oauth_google',
                redirectUrl: AuthSession.makeRedirectUri(),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }, [startSSOFlow]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#0066cc" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Welcome Back</Text>
                <Text style={styles.subHeaderText}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!emailError}
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                />
                {!!emailError && <HelperText type="error">{emailError}</HelperText>}

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={secureTextEntry}
                    error={!!passwordError}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                        <TextInput.Icon
                            icon={secureTextEntry ? "eye" : "eye-off"}
                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                        />
                    }
                />
                {!!passwordError && <HelperText type="error">{passwordError}</HelperText>}

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push('/forgot-password')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    mode="contained"
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    onPress={handleLogin}
                >
                    Login
                </Button>
                <Button
                    mode="elevated"
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    onPress={handleOAuth}
                    icon="google"
                >
                    Login with Google
                </Button>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/register')}>
                        <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    backButton: {
        marginTop: 20,
    },
    headerContainer: {
        marginTop: 40,
        marginBottom: 40,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0066cc',
    },
    subHeaderText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 8,
    },
    formContainer: {
        width: '100%',
    },
    input: {
        marginBottom: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginVertical: 16,
    },
    forgotPasswordText: {
        color: '#0066cc',
    },
    loginButton: {
        marginTop: 16,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        color: '#666666',
    },
    registerLink: {
        color: '#0066cc',
        fontWeight: 'bold',
    },
});