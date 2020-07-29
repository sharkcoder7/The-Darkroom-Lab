import React from 'react';
import {PersistGate} from 'redux-persist/integration/react'
import {Provider} from "react-redux";
import {configureStore} from './src/store';
import NavigationWrapper from './src/navigation';

export default function App ({})
{
    const storage = configureStore();

    function onBeforeLift ()
    {

    }

    return (
        <Provider store={storage.store}>
            <PersistGate loading={null} onBeforeLift={onBeforeLift} persistor={storage.persistor}>
                <NavigationWrapper/>
            </PersistGate>
        </Provider>
    )
}
