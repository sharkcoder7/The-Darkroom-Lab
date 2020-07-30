import React from "react";
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { register } from 'react-native-bundle-splitter';

import Albums from './screens/Albums';
import Welcome from './screens/Auth/Welcome';
import {ImageHeader} from './components/ImageHeader';
import {TdrLogo} from './components/TdrLogo';
import Auth from './screens/Auth/Auth';
import {shallowEqual, useSelector} from 'react-redux';
import Notifications from './screens/Notifications';
import AlbumRolls from './screens/AlbumRolls';
import {FosLogo} from './components/FosLogo';
import {Image, TouchableOpacity} from 'react-native';
import EditAlbum from './screens/EditAlbum';
import RollImages from './screens/RollImages';
import ImageDetail from './screens/ImageDetail';

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
        <MainStack.Navigator initialRouteName="Welcome" >
            {
                !token &&
                <React.Fragment>
                    <MainStack.Screen name="Welcome" component={Welcome} options={{...headerStyle, headerTitle : <TdrLogo/>}}/>
                    <MainStack.Screen name="Auth" component={Auth} options={{...headerStyle, headerTitle : '', headerBackTitle : 'Back', headerBackTitleStyle : {color: '#fff'}}}/>
                </React.Fragment>
            }
            {
                token &&
                <React.Fragment>
                    <MainStack.Screen name="Albums" component={Albums} options={{...headerStyle, headerTitle : <TdrLogo/>}}/>
                    <MainStack.Screen name="AlbumRolls" component={AlbumRolls} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
                    <MainStack.Screen name="EditAlbum" component={EditAlbum} options={{...headerStyle, headerTitle : 'Edit'}}/>
                    <MainStack.Screen name="RollImages" component={RollImages} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
                    <MainStack.Screen name="ImageDetail" component={ImageDetail} options={{...headerStyle, headerTitle : <FosLogo/>}}/>
                    <MainStack.Screen name="Main2" component={register({require : () => require('./screens/Details')})} />
                </React.Fragment>
            }
        </MainStack.Navigator>
    )
};

export default ({}) => {

    return (
        <NavigationContainer>
            <RootStack.Navigator initialRouteName="Main" mode="modal">
                <RootStack.Screen name="Main" component={MainStackScreen} options={{ headerShown: false }}/>
                <RootStack.Screen name="Notifications" component={Notifications} options={({ navigation, route }) => ({...headerStyle, headerLeft : null})}/>
            </RootStack.Navigator>
        </NavigationContainer>
    )
};
