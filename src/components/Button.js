import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

export function Button ({onPress, text, style})
{
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
            <Text style={styles.buttonText}>{text}</Text>
            <Image style={styles.arrowIcon} source={require('../assets/back_arrow_icon.png')}></Image>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button : {
        flexDirection : 'row',
        justifyContent: 'space-between',
        backgroundColor: '#33333380',
        borderWidth: 1,
        borderColor: '#999',
        paddingVertical: 18,
        paddingHorizontal : 30,
        marginBottom: 7,
        width: '100%'
    },
    buttonText : {
        color: 'white',
        fontSize: 16
    },
    arrowIcon : {
        transform: [{ rotate: '180deg'}],
        width : 12,
        aspectRatio : 0.764,
        marginTop: 5
    }
});
