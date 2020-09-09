import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Dimensions, Text, TouchableOpacity, Switch, Keyboard, TextInput} from 'react-native';
import {useTheme} from '../theme-manager';
import DownloadFilm from './icons/DownloadFilm';
import Close from './icons/Close';
import {SheetBody} from './SheetBody';
import {TextInputMask} from 'react-native-masked-text';
import {SheetHeader} from './SheetHeader';
import BottomSheet from 'reanimated-bottom-sheet';
import CopyLink from './icons/CopyLink';

export function RollDownload ({openSheet})
{
    const { theme } = useTheme();

    const [hide, setHide] = useState(false);


    if (hide)
    {
        return null;
    }

    return (
        <React.Fragment>
            <View style={styles.wrapper}>
                <TouchableOpacity onPress={openSheet} style={styles.textWrapper}>
                    <DownloadFilm style={styles.icon}/>
                    <Text style={styles.text}>Sep 3 - Download is Ready</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setHide(true)}>
                    <Close style={styles.icon} fill="#d8d8d8"/>
                </TouchableOpacity>
            </View>
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        backgroundColor: '#42ada8',
        flexDirection: 'row',
        justifyContent : 'space-between',
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginBottom: 15
    },
    textWrapper : {
        flexDirection: 'row'
    },
    text : {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
        marginTop: 4
    },
    button : {
        backgroundColor: '#00000070',
        borderRadius : 50000,
        borderBottomLeftRadius: 50000,
        borderBottomRightRadius: 50000,
        borderTopLeftRadius: 50000,
        borderTopRightRadius: 50000,
        padding: 3,
        position : 'absolute',
        right: 10,
        top: 10
    },
    icon : {
        transform : [{scale: 0.8}]
    }
});
