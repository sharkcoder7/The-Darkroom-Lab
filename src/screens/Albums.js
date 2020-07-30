import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from "react-redux";
import {SafeAreaView, Button, Text, StyleSheet, View, Image, FlatList, TouchableOpacity} from 'react-native';
import SplashScreen from "react-native-splash-screen";
import {Album} from '../components/Album';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';

export default function Albums ({navigation})
{
    const test = useSelector(state => state.main.test, shallowEqual);
    const [albums, setAlbums] = useState([]);
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useEffect(() =>
    {
        setTimeout(() => SplashScreen.hide(), 50);
    }, []);

    useEffect(() =>
    {
        getAlbums();
    }, []);

    async function getAlbums ()
    {
        try
        {
            const response = await request('/albums');
            setAlbums(response);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function toNotifications ()
    {
        navigation.navigate('Notifications');
    }

    function selectAlbum (album)
    {
        navigation.navigate('AlbumRolls', {album});
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <View style={styles.header}>
                <Text style={[styles.headerText, {color : theme.primaryText}]}>Your Albums</Text>
                <Image style={styles.headerImage} source={require('../assets/fos_logo.png')}/>
            </View>
            <FlatList style={styles.listWrapper} data={albums} renderItem={({item}) => <Album key={item.id} album={item} onPress={() => selectAlbum(item)}/>}/>
            <View style={styles.footer}>
                <TouchableOpacity onPress={toggle}>
                    <Image style={styles.switchIcon} source={require('../assets/night_mode_toggle.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={toNotifications}>
                    <Image style={styles.notificationsIcon} source={require('../assets/notification.png')}/>
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%'
    },
    header : {
        justifyContent : 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginTop: 10
    },
    headerText : {
        fontSize: 24,
        color: '#fff',
        fontFamily : 'Montserrat-SemiBold'
    },
    headerImage : {
        aspectRatio: 3.12,
        width: 100
    },
    listWrapper : {
        width: '100%'
    },
    switchIcon : {
        width: 80,
        height: 37
    },
    notificationsIcon : {
        width: 35,
        height: 36
    },
    footer : {
        justifyContent : 'space-between',
        flexDirection: 'row',
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 15,
        paddingRight: 30,
    }
});
