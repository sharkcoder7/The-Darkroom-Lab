import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, Image, ScrollView, KeyboardAvoidingView} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {AlbumInfo} from '../components/AlbumInfo';
import HeaderButton from '../components/HeaderButton';
import {customBackButtonHeaderProps} from '../components/BackButton';
import {LineInput} from '../components/LineInput';

export default function EditAlbum ({route, navigation})
{
    const {album, rolls} = route.params;
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();
    const [updatedAlbum, setUpdatedAlbum] = useState(JSON.parse(JSON.stringify(album)));
    const [updatedRolls, setUpdatedRolls] = useState(JSON.parse(JSON.stringify(rolls)));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Done" onPress={submit}/>
            ),
            ...customBackButtonHeaderProps('Album', navigation)
        });
    }, [navigation]);

    async function submit ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls`);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function updateAlbum (text)
    {
        setUpdatedAlbum({...updatedAlbum, name : text});
    }

    function updateRolls (editableRoll, name)
    {
        let newUpdatedRolls = updatedRolls.map(roll => {
            if (editableRoll.id === roll.id)
            {
                roll.name = name;
            }
            return roll;
        });

        setUpdatedRolls(newUpdatedRolls);
    }

    return (
        <ScrollView style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]} contentContainerStyle={styles.containerStyle}>
            <AlbumInfo album={album} isInsideAlbumBlock={false} showName={false}/>
            <LineInput style={styles.albumInput} title="Album name" value={updatedAlbum.name} onChange={updateAlbum}/>

            <KeyboardAvoidingView>
                {
                    updatedRolls.map((roll) =>
                        <View style={styles.rollWrapper}>
                            <View style={styles.imagesWrapper}>
                                <View style={styles.images}>
                                    {
                                        roll.images.slice(0, 2).map(image =>
                                            <View style={styles.imageWrapper}>
                                                <Image style={styles.image} resizeMode="cover" source={{uri : image.imageUrl, width : 100, height: 100}}/>
                                            </View>
                                        )
                                    }
                                </View>
                            </View>
                            <LineInput title="Roll name" value={roll.name} onChange={text => updateRolls(roll, text)}/>
                        </View>
                    )
                }
            </KeyboardAvoidingView>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
    },
    containerStyle : {
        paddingTop: 15,
        paddingBottom: 25
    },
    imagesWrapper : {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 10
    },
    images : {
        flexDirection: 'row',
        flexWrap : 'wrap',
        margin: -5
    },
    imageWrapper : {
        width : '50%',
        aspectRatio: 1,
        padding: 5
    },
    image : {
        width: '100%',
        height: '100%'
    },
    rollWrapper : {
        marginTop: 30
    },
    albumInput : {
        marginTop: 20
    }
});
