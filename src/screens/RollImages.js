import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import HeaderButton from '../components/HeaderButton';
import {customBackButtonHeaderProps} from '../components/BackButton';

export default function RollImages ({route, navigation})
{
    const {album, roll} = route.params;
    const [selectionMode, setSelectionMode] = useState(false);
    const [images, setImages] = useState([]);
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Select" onPress={() => setSelectionMode(true)}/>
            ),
            ...customBackButtonHeaderProps('Album')
        });
    }, [navigation]);

    useEffect(() =>
    {
        getImages();
    }, []);

    async function getImages ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images`);
            //setImages(response);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function selectImage (image)
    {
        //navigation.navigate('Roll', {album, roll});
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <Text style={styles.name}>{roll.name}</Text>
            <Text>{images.length}</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 15,
        paddingHorizontal : 10
    },
    name : {
        color: '#fff',
        fontSize: 20,
        fontFamily : 'Montserrat-SemiBold',
        marginBottom: 15
    }
});
