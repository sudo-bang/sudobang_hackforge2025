import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Provider } from 'react-native-paper'
import { SocketProvider } from './context/SocketContext'

export default function RootLayout() {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

    if (!publishableKey) {
        throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
    }

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <SocketProvider>
                <Provider>
                    <Slot />
                    <StatusBar style="auto"/>
                </Provider>
            </SocketProvider>
        </ClerkProvider>
    )
}