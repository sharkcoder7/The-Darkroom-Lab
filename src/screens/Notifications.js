import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
    Text,
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Switch,
    TextInput, Platform,
} from 'react-native';
import {useRequest} from '../helper';
import HeaderButton from '../components/HeaderButton';
import Separator from '../components/Separator';
import BottomSheet from 'reanimated-bottom-sheet';
import {SheetHeader} from '../components/SheetHeader';
import {SheetBody} from '../components/SheetBody';
import {useTheme} from '../theme-manager';

export default function Notifications ({navigation})
{
    const [notifications, setNotifications] = useState([]);
    const [SMSEnabled, setSMSEnabled] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const {request} = useRequest();
    const bottomSheetEl = useRef();

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
            setNotifications(response);
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
                    <Text style={[styles.date, styles.text, {color: theme.primaryText}]}>{item.date}</Text>
                    <Text style={[styles.text, {color: theme.primaryText}]}>{item.text}</Text>
                </View>
                <Separator/>
            </React.Fragment>
        );
    }

    function openSettingsSheet ()
    {
        bottomSheetEl.current.snapTo(1);
    }

    function renderHeader()
    {
        return <SheetHeader title="Settings" onPress={() => bottomSheetEl.current.snapTo(0)}/>;
    }

    function renderContent ()
    {
        return (
            <SheetBody>
                <TouchableOpacity onPress={() => setSMSEnabled(!SMSEnabled)} style={styles.switchWrapper}>
                    <Switch
                        style={styles.switch}
                        trackColor={{ false: "#999", true: "rgba(33,183,153,0.32)" }}
                        thumbColor={SMSEnabled ? "#42ada8" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setSMSEnabled}
                        value={SMSEnabled}
                    />
                    <Text style={styles.switchLabel}>SMS Notification</Text>
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                        Phone number
                    </Text>
                    <TextInput style={styles.input}
                               returnKeyType="done"
                               onChangeText={setPhoneNumber}
                               placeholder="555-555-555-555"
                               autoCapitalize='none'/>
                </View>

            </SheetBody>
        );
    }

    return (
        <React.Fragment>
            <View style={[styles.wrapper, {backgroundColor: theme.backgroundColor}]}>
                {/*<TouchableOpacity onPress={openSettingsSheet} style={styles.link}>
                    <Text style={styles.linkText}>Settings</Text>
                </TouchableOpacity>
                <Separator/>*/}
                <FlatList data={notifications} keyExtractor={item => item.id} renderItem={renderItem}></FlatList>
            </View>
            <BottomSheet
                ref={bottomSheetEl}
                initialSnap={0}
                snapPoints={[0, 400]}
                renderContent={renderContent}
                renderHeader={renderHeader}
            />
        </React.Fragment>
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
    },
    link : {
        marginBottom: 10,
        paddingHorizontal: 15
    },
    linkText : {
        color: '#3e9d99',
        fontSize: 18
    },
    switchWrapper : {
        flexDirection: 'row',
        marginTop: 20
    },
    switch : {
        transform : [{scale : Platform.OS === 'ios' ? 1 : 1.5}],
        marginRight: 15,
        marginLeft: 10
    },
    switchLabel : {
        fontSize: 18
    },
    inputWrapper : {
        marginTop: 30
    },
    inputLabel : {
        fontSize: 16,
        marginBottom: 5
    },
    input : {
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 18,
        borderWidth: 2,
        borderColor: '#4893fb',
        marginBottom: 10,
        color: '#000'
    }
});
