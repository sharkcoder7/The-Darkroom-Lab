import React, {useEffect} from 'react';
import {PersistGate} from 'redux-persist/integration/react'
import {Provider} from "react-redux";
import {configureStore} from './src/store';
import NavigationWrapper from './src/navigation';
import {StatusBar, Platform} from 'react-native';
import {AppearanceProvider} from 'react-native-appearance';
import ThemeManager from './src/theme-manager';
import messaging from '@react-native-firebase/messaging';

console.disableYellowBox = true;

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

export default function App ({})
{
    const storage = configureStore();

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        });

        messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    console.log(fcmToken);
                } else {
                }
            }).catch((error) => {
        });
        return unsubscribe;
    }, []);

    function onBeforeLift ()
    {
        requestUserPermission();
    }

    return (
        <Provider store={storage.store}>
            <PersistGate loading={null} onBeforeLift={onBeforeLift} persistor={storage.persistor}>
                <React.Fragment>
                    {
                        Platform.OS !== 'ios' && <StatusBar translucent backgroundColor="transparent" />
                    }
                    <AppearanceProvider>
                        <ThemeManager>
                            <NavigationWrapper/>
                        </ThemeManager>
                    </AppearanceProvider>
                </React.Fragment>
            </PersistGate>
        </Provider>
    )
}
