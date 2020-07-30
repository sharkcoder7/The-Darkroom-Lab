import React from 'react';
import {PersistGate} from 'redux-persist/integration/react'
import {Provider} from "react-redux";
import {configureStore} from './src/store';
import NavigationWrapper from './src/navigation';
import {StatusBar, Platform} from 'react-native';
import {AppearanceProvider} from 'react-native-appearance';
import ThemeManager from './src/theme-manager';

export default function App ({})
{
    const storage = configureStore();

    function onBeforeLift ()
    {

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
