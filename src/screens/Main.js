import React, {useEffect} from 'react';
import {setTest} from "../ducks/main";
import {shallowEqual, useSelector} from "react-redux";
import {SafeAreaView, Button, Text, StyleSheet} from 'react-native';
import SplashScreen from "react-native-splash-screen";

export default function Main ({navigation})
{
    const test = useSelector(state => state.main.test, shallowEqual);

    useEffect(() =>
    {
        setTimeout(() => SplashScreen.hide(), 50);
    }, []);

    return (
        <SafeAreaView>
            <Text>{test}</Text>
            <Button onPress={() => setTest(Date.now())} title="go"/>
            <Button onPress={() => navigation.navigate('Main2')} title="go2"/>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({

});
