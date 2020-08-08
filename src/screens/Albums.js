
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from "react-redux";
import {SafeAreaView, Button, Text, StyleSheet, View, Image, FlatList, TouchableOpacity} from 'react-native';
import SplashScreen from "react-native-splash-screen";
import {Album} from '../components/Album';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import Fos from '../components/icons/Fos';
import ToggleTheme from '../components/icons/ToggleTheme';
import {Notifications} from '../components/icons';
import DownloadFilm from '../components/icons/DownloadFilm';
import IconBadge from 'react-native-icon-badge';
import {ToggleThemeButton} from '../components/ToggleThemeButton';

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
                <Fos style={styles.icon} fill={theme.primaryText}/>
            </View>
            <FlatList style={styles.listWrapper} data={albums} renderItem={({item}) => <Album key={item.id} album={item} onPress={() => selectAlbum(item)}/>}/>
            <View style={[styles.footer, {backgroundColor : mode === 'light' ? '#5e5e5e' : '#000000'}]}>
                <ToggleThemeButton/>
                <IconBadge
                    MainElement={
                        <TouchableOpacity onPress={toNotifications}>
                            <Notifications style={styles.notificationsIcon}/>
                        </TouchableOpacity>
                    }
                    BadgeElement={<Text style={styles.badgeText}>{3}</Text>}
                    IconBadgeStyle={styles.badge}
                    Hidden={false}
                />
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
        marginTop: 10,
        marginBottom : 5
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
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 15,
        paddingRight: 30,
    },
    icon : {
        marginTop: 8
    },
    badge : {
        width : 10,
        height : 20,
        right: -5,
        top: -5,
        backgroundColor: '#3e9d99'
    },
    badgeText : {
        color: '#fff'
    },
});
