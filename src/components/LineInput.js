import React from 'react';
import {
    Platform,
    StyleSheet,
    Text, TextInput, View,
} from 'react-native';
import {useTheme} from '../theme-manager';

export function LineInput ({style, title, value, onChange, labelWidth = null, forceMode = null, disabled = false})
{
    const { mode, theme, toggle } = useTheme();

    return (
        <View style={[styles.wrapper, style]}>
            <Text style={[styles.title, {color: (forceMode || mode) === 'light' ? '#777' : '#bcb9b9'}, labelWidth ? {width : labelWidth} : {}]}>{title}</Text>
            <TextInput editable={!disabled} style={styles.input} value={value} onChangeText={onChange}/>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        flexDirection : 'row',
        borderTopWidth : 1,
        borderBottomWidth : 1,
        borderColor: '#686363',
        paddingHorizontal : 15,
    },
    title : {
        marginTop: 13,
        fontSize: 16,
        marginRight : 30
    },
    input : {
        width: '100%',
        color: '#827c7d',
        fontSize: 16,
        marginTop: Platform.OS === 'ios' ? 13 : 0,
        marginBottom: Platform.OS === 'ios' ? 13 : 0
    }
});
