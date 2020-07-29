import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { register } from 'react-native-bundle-splitter';
import Main from './screens/Main';

const Stack = createStackNavigator();

export default () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Main2" component={register({require : () => require('./screens/Details')})} />
        </Stack.Navigator>
    </NavigationContainer>
);
