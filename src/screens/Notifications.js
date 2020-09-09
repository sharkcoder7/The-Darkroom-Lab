import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Platform, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import {useRequest} from '../helper';
import HeaderButton from '../components/HeaderButton';
import Separator from '../components/Separator';
import {useTheme} from '../theme-manager';
import DownloadFilm from '../components/icons/DownloadFilm';
import {openUrl, SharedUtils} from '../shared';
import {render} from 'redux-logger/src/diff';

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
        }
        catch (e)
        {
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
        }
        catch (e)
        {
            console.warn('error:' + e);
        }
        finally
        {
            setNotificationsLoading(false);
        }
    }

    function filterByDate (items)
    {
        return items.sort((a, b) =>
        {
            let aDateComponents = a.date.split('/'),
                aDate = [aDateComponents[2], aDateComponents[0].padStart('0', 2), aDateComponents[1].padStart('0', 2)].join(' '),
                bDateComponents = b.date.split('/'),
                bDate = [bDateComponents[2], bDateComponents[0].padStart('0', 2), bDateComponents[1].padStart('0', 2)].join(' ');

            return aDate > bDate ? -1 : 1;
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
                            <Text style={[styles.date, styles.text, {color: theme.primaryText}]}>{item.date || ''}</Text>
                            <Text style={[styles.text, {color: theme.primaryText}]}>Download is ready</Text>
                        </View>
                        <View>
                            <Text style={styles.additionalText}>Roll #{item.rollId} in ready to download</Text>
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
                    <View>
                        <View style={styles.mainText}>
                            <Text style={[styles.date, styles.text, {color: theme.primaryText}]}>{item.date}</Text>
                            <Text style={[styles.text, {color: theme.primaryText}]}>{item.text}</Text>
                        </View>
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
            return filterByDate(notifications);
        }

        if (filter === 'DOWNLOADS')
        {
            return filterByDate(downloads);
        }

        return filterByDate([...notifications, ...downloads]);
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

                        <FlatList data={filteredData()} keyExtractor={item => item.downloadId || item.id} renderItem={renderItem}/>

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
        fontSize: 16
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
        justifyContent: 'space-between',
    },
    emptyMessage : {
        fontSize: 14,
        marginLeft: 15,
        marginTop: 15
    }
});
