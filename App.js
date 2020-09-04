import React, {useEffect} from 'react';
import {PersistGate} from 'redux-persist/integration/react'
import {Provider} from 'react-redux';
import {configureStore} from './src/store';
import NavigationWrapper from './src/navigation';
import {AppearanceProvider} from 'react-native-appearance';
import ThemeManager from './src/theme-manager';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import * as PushNotification from 'react-native-push-notification';
import {StatusBar} from 'react-native';

console.disableYellowBox = true;

StatusBar.setBackgroundColor("rgba(0,0,0,0)");
StatusBar.setBarStyle("light-content");
StatusBar.setTranslucent(true);

PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
        console.log("TOKEN:", token);
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function(err) {
        console.error(err.message, err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
});

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

        const unsubscribe = messaging().onMessage(async notification => {
            console.log('============', JSON.stringify(notification));
            PushNotification.localNotification({
                title: notification.notification.title,
                message: notification.notification.body
            });
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
                    <StatusBar translucent barStyle="light-content" backgroundColor={'transparent'} />
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
