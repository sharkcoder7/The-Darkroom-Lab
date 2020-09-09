
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
import {setAlbums, setFcmToken, setSelectedAlbum} from '../ducks/main';
import messaging from '@react-native-firebase/messaging';
import {hitSlop} from '../theme';

export default function Albums ({navigation})
{
    const albums = useSelector(state => state.main.albums, shallowEqual);
    const fcmToken = useSelector(state => state.main.fcmToken, shallowEqual);

    const {request, loading} = useRequest();

    const { mode, theme } = useTheme();

    useEffect(() => {

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
            await request('/profile', {method : "PUT", body : JSON.stringify({notificationsToken : newFcmToken})});
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

    async function getAlbums ()
    {
        try
        {
            const albums = await request('/albums');
            setAlbums(albums.filter(album => album.filmsCount + album.imagesCount > 0));
        }
        catch (e)
        {
            console.warn('error:' + e);
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

            <FlatList showsVerticalScrollIndicator={false} style={styles.listWrapper} data={albums} renderItem={({item}) => <Album key={item.id + Math.random} album={item} onPress={() => selectAlbum(item)}/>}/>

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
                    BadgeElement={<Text onPress={toNotifications} style={styles.badgeText}>{3}</Text>}
                    IconBadgeStyle={styles.badge}
                    Hidden={true}
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
