import React from 'react';
import {setTest} from "../ducks/main";
import {shallowEqual, useSelector} from "react-redux";
import {SafeAreaView, Button, Text, StyleSheet} from 'react-native';

export default function Main ({navigation})
{
    const test = useSelector(state => state.main.test, shallowEqual);

    return <SafeAreaView>
        <Text>{test}</Text>
        <Button onPress={() => setTest(Date.now())} title="go"/>
        <Button onPress={() => navigation.navigate('Main2')} title="go2"/>
    </SafeAreaView>
}


const styles = StyleSheet.create({

});
