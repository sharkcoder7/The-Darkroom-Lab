import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {StyleSheet, View, FlatList, ActivityIndicator} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {AlbumInfo} from '../components/AlbumInfo';
import {Roll} from '../components/Roll';
import HeaderButton from '../components/HeaderButton';
import {customBackButtonHeaderProps} from '../components/BackButton';
import {shallowEqual, useSelector} from 'react-redux';
import {setForceAlbumId, setForceRollId, setRolls, setSelectedRoll} from '../ducks/main';

export default function AlbumRolls ({navigation})
{
    const album = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const rolls = useSelector(state => state.main.rolls, shallowEqual);
    const forceRollId = useSelector(state => state.main.forceRollId, shallowEqual);

    const {request, loading} = useRequest();

    const { theme } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text="Edit Album" onPress={toEditAlbum}/>
            ),
            ...customBackButtonHeaderProps('Orders', navigation)
        });
    }, [navigation, rolls]);

    useEffect(() =>
    {
        getRolls();
    }, []);

    async function getRolls ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls`);
            setRolls(response);
            if (forceRollId)
            {
                findAndSelectForceRoll();
            }
        }
        catch (e)
        {
            console.warn('error:' + e);
        }
    }

    const toEditAlbum = useCallback(() =>
    {
        navigation.navigate('EditAlbum');
    }, [album, rolls]);

    function selectRoll (roll)
    {
        setSelectedRoll(roll);
        navigation.navigate('RollImages');
    }

    useEffect(() =>
    {
        if (!forceRollId)
        {
            return () => false;
        }

        if (rolls.length !== 0)
        {
            findAndSelectForceRoll();
        }
        else
        {
            getRolls();
        }

    }, [forceRollId]);

    function findAndSelectForceRoll ()
    {
        const existingRoll = rolls.find(roll => roll.id === forceRollId);
        if (existingRoll !== undefined)
        {
            selectRoll(existingRoll);
            setForceRollId(null);
        }
    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <AlbumInfo album={album} isInsideAlbumBlock={false}/>
            {
                loading && <ActivityIndicator style={styles.loader} size="large" color={theme.primaryText}/>
            }
            {
                !loading &&
                <FlatList showsVerticalScrollIndicator={false} style={styles.listWrapper} data={rolls} keyExtractor={item => item.id.toString()} renderItem={({item}) => <Roll roll={item} onPress={() => selectRoll(item)}/>}/>
            }
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 15,
        paddingHorizontal: 10
    },
    listWrapper : {
        width: '100%',
        marginTop: 15
    },
    loader : {
        position : 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -20
    }
});
