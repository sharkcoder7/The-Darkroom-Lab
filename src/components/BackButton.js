import React from 'react';
import {Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {Back} from './icons';

export default function BackButton ({navigation, title, forceTitle = false})
{
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Back style={styles.backButtonIcon}/>
            {
                (forceTitle || Platform.OS !== 'ios') && <Text style={styles.title}>{title}</Text>
            }
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    backButton : {
        marginRight: 5,
        marginTop: 5,
        marginLeft: 10,
        flexDirection: 'row'
    },
    backButtonIcon : {
        width : 17,
        height: 23,
        marginRight: 5,
        transform : [{scale : 1}]
    },
    title : {
        fontSize: 16,
        marginTop: -4,
        marginLeft: 3,
        color: '#fff'
    }
});

export const customBackButtonHeaderProps = (title, navigation) =>
{
    return {
        headerBackImage: () => <BackButton title={title} navigation={navigation}/>,
        headerLeftStyle : styles.backButton,
        headerBackTitleStyle : {color: '#fff', marginTop: 4},
        headerBackTitle : title
    };
};
