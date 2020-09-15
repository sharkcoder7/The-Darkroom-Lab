import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
/*import { register } from 'react-native-bundle-splitter';*/
import analytics from '@react-native-firebase/analytics';

import {ImageHeader} from './components/ImageHeader';
import {TdrLogo} from './components/TdrLogo';
import {FosLogo} from './components/FosLogo'
import {shallowEqual, useSelector} from 'react-redux';

import Albums from './screens/Albums';
import Welcome from './screens/Welcome';
import Notifications from './screens/Notifications';
import AlbumRolls from './screens/AlbumRolls';;
import EditAlbum from './screens/EditAlbum';
import RollImages from './screens/RollImages';
import ImageDetail from './screens/ImageDetail';
import Profile from './screens/Profile';
import Orientation from 'react-native-orientation';
import {setForceAlbumId, setForceRollId, setOrientation, setSelectedAlbum, setSelectedRoll} from './ducks/main';
import messaging from '@react-native-firebase/messaging';
import * as PushNotification from 'react-native-push-notification';

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

const MainStackScreen = ({navigation}) => {

    const token = useSelector(state => state.main.token, shallowEqual);
    //const forceAlbumId = useSelector(state => state.main.forceAlbumId, shallowEqual);

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

    /*const albums = useSelector(state => state.main.albums, shallowEqual);
    const selectedAlbum = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const selectedRoll = useSelector(state => state.main.selectedRoll, shallowEqual);*/

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

    useEffect(() => {

        Orientation.addOrientationListener(_orientationDidChange);

        return () =>
        {
            Orientation.removeOrientationListener(_orientationDidChange);
        };
    }, []);

    function _orientationDidChange (orientation)
    {
        setOrientation(orientation);
    }

    useEffect(() => {

        const unsubscribe = messaging().onMessage(async notification => {
            console.log('==================================== ON MESSAGE ==================================== ', JSON.stringify(notification));
            PushNotification.localNotification({
                title: notification.notification.title,
                message: notification.notification.body,
                data : notification
            });
        });

        return unsubscribe;
    }, []);

    useEffect(() => {

        const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );

            let data = {...(remoteMessage.data || {}), ...remoteMessage},
                albumId = data.albumId,
                rollId = data.rollId;

            if (albumId === undefined || rollId === undefined)
            {
                return;
            }

            setForceAlbumId(+albumId);
            setForceRollId(+rollId);

            console.log('==================================== DATA FROM NOTIFICATION ==================================== ' + JSON.stringify(remoteMessage));
            //navigation.navigate(remoteMessage.data.type);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {

        const unsubscribe = messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('==================================== BACKGROUND NOTIFICATION ==================================== ', remoteMessage);
        });

        return unsubscribe;
    }, []);

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
