import React from 'react';
import {Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

export default function BackButton ({navigation})
{
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image style={styles.backButtonIcon} source={require('../assets/back_arrow_icon.png')}/>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    backButton : {
        marginRight: 5,
        marginTop: 0,
        marginLeft: 10
    },
    backButtonIcon : {
        width : 17,
        height: 23,
        marginRight: 5
    }
});

export const customBackButtonHeaderProps = (title, navigation) =>
{
    return {
        headerBackImage: () => <BackButton navigation={navigation}/>,
        headerLeftStyle : styles.backButton,
        headerBackTitleStyle : {color: '#fff', marginTop: 0},
        headerBackTitle : title
    };
};
