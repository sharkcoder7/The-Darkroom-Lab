import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Platform, KeyboardAvoidingView, ActivityIndicator, Dimensions,
} from 'react-native';
import {useRequest} from '../helper';
import HeaderButton from '../components/HeaderButton';
import Separator from '../components/Separator';
import {useTheme} from '../theme-manager';
import DownloadFilm from '../components/icons/DownloadFilm';
import {openUrl, SharedUtils} from '../shared';
import {render} from 'redux-logger/src/diff';
import {setUncheckedNotificationsCount} from '../ducks/main';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import * as PushNotification from 'react-native-push-notification';
import Bugsnag from '@bugsnag/react-native'

export default function Notifications ({navigation})
{
    const [notifications, setNotifications] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const {request} = useRequest();
    const { theme } = useTheme();

    const [downloadsLoading, setDownloadsLoading] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);

    useEffect(() =>
    {
        getNotifications();
        getDownloads();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft : () => <View></View>,
            headerRight: () => (
                <HeaderButton text="Done" onPress={() => navigation.goBack()}/>
            ),
        });
    }, [navigation]);

    async function getDownloads ()
    {
        setDownloadsLoading(true);
        try
        {
            const response = await request('/downloads');
            setDownloads(response.filter(item => item.downloadURL));
            console.log(response);
        }
        catch (e)
        {
            Bugsnag.notify(e)
            console.warn('error:' + e);
        }
        finally
        {
            setDownloadsLoading(false);
        }
    }

    async function getNotifications ()
    {
        setNotificationsLoading(true);
        try
        {
            const response = await request('/notifications');
            setNotifications(response);
            setNotificationsAsChecked(response);
        }
        catch (e)
        {
            Bugsnag.notify(e);
            console.warn('error:' + e);
        }
        finally
        {
            setNotificationsLoading(false);
        }
    }

    async function setNotificationsAsChecked (notifications)
    {
        if (Platform.OS === 'ios')
        {
            PushNotificationIOS.removeAllDeliveredNotifications();
            PushNotificationIOS.setApplicationIconBadgeNumber(0);
        }

        setUncheckedNotificationsCount(0);
        PushNotification.cancelAllLocalNotifications();

        setTimeout(() => setNotifications(notifications.map(notification => {return {...notification, seenAt : true};})), 1000);

        try
        {
            const uncheckedNotificationsIds = notifications.filter(notification => notification.seenAt === null).map(notification => notification.id);
            if (uncheckedNotificationsIds.length === 0)
            {
                return;
            }

            await request('/notifications', {method : "PUT"});
        }
        catch (e)
        {
            Bugsnag.notify(e);
            console.warn('error:' + e);
        }
    }

    function orderByDate (items)
    {
        return items.sort((a, b) =>
        {
            return a.date > b.date ? -1 : 1;
        });
    }

    function renderItem ({item})
    {
        if (item.id !== undefined)
        {
            return renderNotification({item});
        }
        else
        {
            return renderDownload({item});
        }
    }

    function renderDownload ({item})
    {
        return (
            <React.Fragment>
                <TouchableOpacity onPress={() => openUrl(item.downloadURL)} style={styles.item}>
                    <View>
                        <View style={styles.mainText}>
                            <Text allowFontScaling={false} style={[styles.date, styles.text, {color: theme.primaryText}]}>{formatDate(item.date)}</Text>
                            <Text allowFontScaling={false} style={[styles.text, {color: theme.primaryText}]}>Download is ready</Text>
                        </View>
                        <View>
                            <Text allowFontScaling={false} style={styles.additionalText}>Roll #{item.rollId} in ready to download</Text>
                        </View>
                    </View>
                    <View style={styles.downloadIconWrapper}>
                        <DownloadFilm/>
                    </View>
                </TouchableOpacity>
                <Separator/>
            </React.Fragment>
        );
    }

    function renderNotification ({item})
    {
        return (
            <React.Fragment>
                <View style={styles.item}>
                    <View style={styles.mainText}>
                        <Text allowFontScaling={false} style={[styles.date, styles.text, {color: theme.primaryText}, !item.seenAt ? {fontWeight : 'bold'} : {}]}>{formatDate(item.date)}</Text>
                        <Text allowFontScaling={false} style={[styles.text, {color: theme.primaryText, width: Dimensions.get('window').width - 120}, !item.seenAt ? {fontWeight : 'bold'} : {}]}>{item.text}</Text>
                    </View>
                </View>
                <Separator/>
            </React.Fragment>
        );
    }

    function filteredData ()
    {
        if (filter === 'ALERTS')
        {
            return orderByDate(notifications);
        }

        if (filter === 'DOWNLOADS')
        {
            return orderByDate(downloads);
        }

        return orderByDate([...notifications, ...downloads]);
    }

    function formatDate (fullDate)
    {
        let date = fullDate.split('T')[0],
            dateComponents = date.split('-');

        return dateComponents[1] + '/' + dateComponents[2] + '/' + dateComponents[0];
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
            <View style={[styles.wrapper, {backgroundColor: theme.backgroundColor}]}>

                {
                    (downloadsLoading || notificationsLoading) &&
                    <ActivityIndicator size="large" color={theme.primaryText}/>
                }

                {
                    (!downloadsLoading && !notificationsLoading) &&
                    <React.Fragment>
                        <View style={styles.filters}>
                            <TouchableOpacity onPress={() => setFilter('ALL')}>
                                <Text style={[styles.filterButton, {textDecorationLine: filter === 'ALL' ? 'underline' : 'none'}]}>All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFilter('DOWNLOADS')}>
                                <Text style={[styles.filterButton, {textDecorationLine: filter === 'DOWNLOADS' ? 'underline' : 'none'}]}>Downloads</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFilter('ALERTS')}>
                                <Text style={[styles.filterButton, {textDecorationLine: filter === 'ALERTS' ? 'underline' : 'none'}]}>Alerts</Text>
                            </TouchableOpacity>
                        </View>
                        {/*<TouchableOpacity onPress={openSettingsSheet} style={styles.link}>
                        <Text style={styles.linkText}>Settings</Text>
                    </TouchableOpacity>
                    <Separator/>*/}

                        {
                            filteredData().length === 0 &&
                            <Text style={[styles.emptyMessage, {color: theme.primaryText}]}>No items.</Text>
                        }

                        <FlatList data={filteredData()} keyExtractor={(item, index) => index || item.downloadId || item.id} renderItem={renderItem}/>

                    </React.Fragment>
                }
            </View>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        backgroundColor : '#403a3b',
        flex: 1,
        width: '100%',
        paddingTop: 15
    },
    filters : {
        flexDirection : 'row',
        justifyContent : 'space-between',
        paddingHorizontal: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#aaa',
        paddingBottom: 15
    },
    filterButton : {
        color: '#40908c',
        fontSize : 18
    },
    item : {
        flexDirection : 'row',
        justifyContent: 'space-between',
        paddingVertical : 5,
        paddingHorizontal: 15
    },
    date : {
        marginRight: 10
    },
    text : {
        color: '#fff',
        fontSize: 16,
    },
    additionalText : {
        color: '#3e9d99',
        fontSize: 14,
        marginTop: 5
    },
    downloadIconWrapper : {
        paddingTop: 10
    },
    mainText : {
        flexDirection : 'row',
    },
    emptyMessage : {
        fontSize: 14,
        marginLeft: 15,
        marginTop: 15
    }
});
