import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Platform, KeyboardAvoidingView,
} from 'react-native';
import {useRequest} from '../helper';
import HeaderButton from '../components/HeaderButton';
import Separator from '../components/Separator';
import {useTheme} from '../theme-manager';
import DownloadFilm from '../components/icons/DownloadFilm';

export default function Notifications ({navigation})
{
    const [notifications, setNotifications] = useState([]);
    const {request} = useRequest();
    const { theme } = useTheme();

    useEffect(() =>
    {
        getNotifications();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft : () => <View></View>,
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
            //setNotifications(response);
            setNotifications([{date : '8/15/2020', text : 'Download is ready'}, {date : '8/15/2020', text : 'Download is ready'}, {date : '8/15/2020', text : 'Download is ready'}, {date : '8/15/2020', text : 'Download is ready'}]);
        }
        catch (e)
        {
            console.warn('error:' + e);
        }
    }

    function renderItem ({item})
    {
        return (
            <React.Fragment>
                <View style={styles.item}>
                    <View>
                        <View style={styles.mainText}>
                            <Text style={[styles.date, styles.text, {color: theme.primaryText}]}>{item.date}</Text>
                            <Text style={[styles.text, {color: theme.primaryText}]}>{item.text}</Text>
                        </View>
                        <View>
                            <Text style={styles.additionalText}>Roll #1234 in ready to download</Text>
                        </View>
                    </View>
                    <View style={styles.downloadIconWrapper}>
                        <DownloadFilm/>
                    </View>
                </View>
                <Separator/>
            </React.Fragment>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
            <View style={[styles.wrapper, {backgroundColor: theme.backgroundColor}]}>
                <View style={styles.filters}>
                    <TouchableOpacity onPress={() => false}>
                        <Text style={styles.filterButton}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.filterButton}>Downloads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.filterButton}>Alerts</Text>
                    </TouchableOpacity>
                </View>
                {/*<TouchableOpacity onPress={openSettingsSheet} style={styles.link}>
                    <Text style={styles.linkText}>Settings</Text>
                </TouchableOpacity>
                <Separator/>*/}
                <FlatList data={notifications} keyExtractor={item => item.id} renderItem={renderItem}></FlatList>
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
        fontSize: 18
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
    }
});
