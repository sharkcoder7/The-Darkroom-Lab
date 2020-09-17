import React from 'react';
import {PersistGate} from 'redux-persist/integration/react'
import {Provider} from 'react-redux';
import {configureStore} from './src/store';
import NavigationWrapper from './src/navigation';
import {AppearanceProvider} from 'react-native-appearance';
import ThemeManager from './src/theme-manager';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import * as PushNotification from 'react-native-push-notification';
import {StatusBar, Text, View} from 'react-native';
import {setForceAlbumId, setForceRollId} from './src/ducks/main';
import Bugsnag from '@bugsnag/react-native'

Bugsnag.start();

//console.disableYellowBox = true;

StatusBar.setBackgroundColor("rgba(0,0,0,0)");
StatusBar.setBarStyle("light-content");
StatusBar.setTranslucent(true);

PushNotification.configure({

    /**
     * Called when user tap on FOREGROUND notification
     */
    onNotification: function (foregroundNotification) {

        console.log("Foreground notification pressed: ", foregroundNotification);
        foregroundNotification.finish(PushNotificationIOS.FetchResult.NoData);

        if (!foregroundNotification.data || !foregroundNotification.data.data)
        {
            return;
        }

        let data = {...foregroundNotification.data.data, ...foregroundNotification.data, ...foregroundNotification};
        setForceAlbumId(+data.albumId);
        setForceRollId(+data.rollId);
    },
});

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

function ErrorView ({})
{
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent : 'center'}}>
            <Text style={{}}>Error! Please contact support.</Text>
        </View>
    )
}

export default function App ({})
{
    const storage = configureStore();

    async function onBeforeLift ()
    {
        await messaging().requestPermission();
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorView}>
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
        </ErrorBoundary>
    )
}
