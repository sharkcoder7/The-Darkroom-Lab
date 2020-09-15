
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from "react-redux";
import {
    Text,
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import SplashScreen from "react-native-splash-screen";
import {Album} from '../components/Album';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import Fos from '../components/icons/Fos';
import {Notifications} from '../components/icons';
import IconBadge from 'react-native-icon-badge';
import {ToggleThemeButton} from '../components/ToggleThemeButton';
import Profile from '../components/icons/Profile';
import {setAlbums, setFcmToken, setForceAlbumId, setSelectedAlbum, setUncheckedNotificationsCount} from '../ducks/main';
import messaging from '@react-native-firebase/messaging';
import {hitSlop} from '../theme';
import useAppState from 'react-native-appstate-hook';

export default function Albums ({navigation})
{
    const albums = useSelector(state => state.main.albums, shallowEqual);
    const fcmToken = useSelector(state => state.main.fcmToken, shallowEqual);
    const uncheckedNotificationsCount = useSelector(state => state.main.uncheckedNotificationsCount, shallowEqual);
    const forceAlbumId = useSelector(state => state.main.forceAlbumId, shallowEqual);

    const {request, loading} = useRequest();

    const { mode, theme } = useTheme();

    const { appState } = useAppState({
        onChange: (newAppState) => console.warn('App state changed to ', newAppState),
        onForeground: () => console.warn('App went to Foreground'),
        onBackground: () => console.warn('App went to background'),
    });

    useEffect(() => {

        //setTimeout(() => setForceAlbumId(338200), 1000);

        setTimeout(() => SplashScreen.hide(), 50);
        messaging().getToken().then(newFcmToken =>
        {
            console.log('TOKEN====================', newFcmToken);
            setFcmToken(newFcmToken);
            if (newFcmToken !== fcmToken)
            {
                updateProfile(newFcmToken);
            }
        }).catch((error) => {
        });

    }, []);

    async function updateProfile (newFcmToken)
    {
        try
        {
            let response = await request('/profile', {method : "PUT", body : JSON.stringify({notificationsToken : newFcmToken})});
        }
        catch (e)
        {
            console.warn('error:' + e);
        }
    }

    useEffect(() =>
    {
        getAlbums();
    }, []);

    useEffect(() =>
    {
        if (!forceAlbumId)
        {
            return () => false;
        }

        if (albums.length !== 0)
        {
            findAndSelectForceAlbum();
        }
        else
        {
            getAlbums();
        }

    }, [forceAlbumId]);

    function findAndSelectForceAlbum ()
    {
        const existingAlbum = albums.find(album => album.id === forceAlbumId);
        if (existingAlbum !== undefined)
        {
            selectAlbum(existingAlbum);
            setForceAlbumId(null);
        }
    }

    useEffect(() =>
    {
        if (appState === 'active')
        {
            getNewAlertsCount();
        }
    }, [appState]);

    async function getAlbums ()
    {
        try
        {
            const albums = await request('/albums');
            setAlbums(albums.filter(album => album.filmsCount + album.imagesCount > 0));
            if (forceAlbumId)
            {
                findAndSelectForceAlbum();
            }

        }
        catch (e)
        {
            console.warn('error:' + e);
        }
    }

    async function getNewAlertsCount ()
    {
        try
        {
            const uncheckedNotificationCount = await request('/notifications/unseen');
            setUncheckedNotificationsCount(uncheckedNotificationCount);
        }
        catch (e)
        {
            console.warn('error:' + JSON.stringify(e));
        }
    }

    function toNotifications ()
    {
        navigation.navigate('Notifications');
    }

    function toProfile ()
    {
        navigation.navigate('Profile');
    }

    function selectAlbum (album)
    {
        setSelectedAlbum(album);
        navigation.navigate('AlbumRolls');
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <View style={styles.header}>
                <Text style={[styles.headerText, {color : theme.primaryText}]}>Your Albums</Text>
                <Fos style={styles.icon} fill={theme.primaryText}/>
            </View>

            {/*<TextInput multiline={true} numberOfLines={3} style={{backgroundColor : '#fff', color: '#000'}} value={token}/>*/}
            {
                loading && <ActivityIndicator style={styles.loader} size="large" color={theme.primaryText}/>
            }

            <FlatList showsVerticalScrollIndicator={false} style={styles.listWrapper} data={albums} keyExtractor={item => item.id.toString()} renderItem={({item}) => <Album album={item} onPress={() => selectAlbum(item)}/>}/>

            <View style={[styles.footer, {backgroundColor : mode === 'light' ? '#5e5e5e' : '#000000'}]}>
                <ToggleThemeButton/>
                <TouchableOpacity hitSlop={hitSlop} onPress={toProfile}>
                    <Profile style={styles.profileIcon}/>
                </TouchableOpacity>
                <IconBadge
                    MainElement={
                        <TouchableOpacity hitSlop={hitSlop} onPress={toNotifications}>
                            <Notifications style={styles.notificationsIcon}/>
                        </TouchableOpacity>
                    }
                    BadgeElement={<Text onPress={toNotifications} style={styles.badgeText}>{uncheckedNotificationsCount}</Text>}
                    IconBadgeStyle={styles.badge}
                    Hidden={uncheckedNotificationsCount === 0}
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
        paddingBottom: 30,
        paddingLeft: 15,
        paddingRight: 30,
    },
    icon : {
        marginTop: 8
    },
    badge : {
        paddingHorizontal: 3,
        paddingVertical: 3,
        right: -10,
        top: -10,
        width: 25,
        height : 'auto',
        backgroundColor: '#3e9d99'
    },
    badgeText : {
        color: '#fff'
    },
    profileIcon : {
        marginLeft: -20
    },
    loader : {
        position : 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -20
    }
});
