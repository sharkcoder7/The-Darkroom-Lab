import React from "react";
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
/*import { register } from 'react-native-bundle-splitter';*/
import analytics from '@react-native-firebase/analytics';

import Albums from './screens/Albums';
import Welcome from './screens/Welcome';
import {ImageHeader} from './components/ImageHeader';
import {TdrLogo} from './components/TdrLogo';
import {shallowEqual, useSelector} from 'react-redux';
import Notifications from './screens/Notifications';
import AlbumRolls from './screens/AlbumRolls';
import {FosLogo} from './components/FosLogo';
import EditAlbum from './screens/EditAlbum';
import RollImages from './screens/RollImages';
import ImageDetail from './screens/ImageDetail';
import Profile from './screens/Profile';

const headerStyle = {
    headerStyle : {
        backgroundColor: 'transparent'
    },
    headerTitleStyle: {
        color: '#fff',
        alignSelf: 'center'
    },
    headerBackTitleStyle : {color: '#fff'},
    header: (props) => <ImageHeader {...props} />,
};


const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const MainStackScreen = () => {

    const token = useSelector(state => state.main.token, shallowEqual);

    return (
        <MainStack.Navigator initialRouteName={token ? 'Albums' : 'Welcome'} headerMode="screen" >
            <MainStack.Screen name="Albums" component={Albums} options={{...headerStyle, headerTitle : <TdrLogo/>}}/>
            <MainStack.Screen name="Welcome" component={Welcome} options={{...headerStyle, headerTitle : <TdrLogo/>}}/>
            <MainStack.Screen name="AlbumRolls" component={AlbumRolls} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
            <MainStack.Screen name="EditAlbum" component={EditAlbum} options={{...headerStyle, headerTitle : 'Edit'}}/>
            <MainStack.Screen name="RollImages" component={RollImages} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
            <MainStack.Screen name="ImageDetail" component={ImageDetail} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
        </MainStack.Navigator>
    )
};

export default ({}) => {

    const routeNameRef = React.useRef();
    const navigationRef = React.useRef();

    function onStateChange (state)
    {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName)
        {
            analytics().setCurrentScreen(currentRouteName, currentRouteName);
        }

        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
    }

    return (
        <React.Fragment>
            <NavigationContainer ref={navigationRef} onReady={() => routeNameRef.current = navigationRef.current.getCurrentRoute().name} onStateChange={onStateChange}>
                <RootStack.Navigator initialRouteName="Main" mode="modal">
                    <RootStack.Screen name="Main" component={MainStackScreen} options={{ headerShown: false }}/>
                    <RootStack.Screen name="Notifications" component={Notifications} options={({ navigation, route }) => ({...headerStyle, headerLeft : null})}/>
                    <RootStack.Screen name="Profile" component={Profile} options={({ navigation, route }) => ({...headerStyle, headerLeft : null})}/>
                </RootStack.Navigator>
            </NavigationContainer>
        </React.Fragment>
    )
};
