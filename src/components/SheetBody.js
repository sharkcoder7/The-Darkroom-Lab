import React from 'react';
import {Image, View, StyleSheet, Text} from 'react-native';

export function SheetBody ({children})
{
    return (
        <View style={styles.wrapper}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        width : '100%',
        paddingVertical : 10,
        paddingHorizontal : 20,
        backgroundColor: '#eef0ee',
        height: 500
    },
});
