import React, {useEffect, useLayoutEffect, useState} from 'react';
import {SafeAreaView, Button, Text, StyleSheet, FlatList, View} from 'react-native';
import {Album} from '../components/Album';
import {useRequest} from '../helper';
import HeaderButton from '../components/HeaderButton';
import {style} from 'redux-logger/src/diff';
import Separator from '../components/Separator';

export default function Notifications ({navigation})
{
    const [notifications, setNotifications] = useState([]);
    const {request, loading, error} = useRequest();

    useEffect(() =>
    {
        getNotifications();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Done" onPress={() => navigation.goBack()}/>
            ),
        });
    }, [navigation]);

    async function getNotifications ()
    {
        try
        {
            const response = await request('/notifications');
            setNotifications(response);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function renderItem ({item})
    {
        return (
            <React.Fragment>
                <View style={styles.item}>
                    <Text style={[styles.date, styles.text]}>{item.date}</Text>
                    <Text style={[styles.text]}>{item.text}</Text>
                </View>
                <Separator/>
            </React.Fragment>
        );
    }

    return (
        <View style={styles.wrapper}>
            <Separator/>
            <FlatList data={notifications} keyExtractor={item => item.id} renderItem={renderItem}></FlatList>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        backgroundColor : '#403a3b',
        flex: 1,
        width: '100%',
        paddingTop: 15
    },
    item : {
        flexDirection : 'row',
        paddingVertical : 5,
        paddingHorizontal: 15
    },
    date : {
        marginRight: 10
    },
    text : {
        color: '#fff',
        fontSize: 18
    }
});
