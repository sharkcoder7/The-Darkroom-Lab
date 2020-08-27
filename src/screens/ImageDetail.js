import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Text,
    PermissionsAndroid, Alert, Animated, Easing,
} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {customBackButtonHeaderProps} from '../components/BackButton';
import {SharedUtils} from '../shared';
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';
import HeaderButton from '../components/HeaderButton';
import {Delete, Download, LikeOff, LikeOffTool, Rotate, Share} from '../components/icons';
import {shallowEqual, useSelector} from 'react-redux';
import {setImagesLikes, setImagesRotation} from '../ducks/main';
import LikeOn from '../components/icons/LikeOn';
import analytics from '@react-native-firebase/analytics';

export default function ImageDetail ({route, navigation})
{
    let rotationBlock = false;

    const album = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const roll = useSelector(state => state.main.selectedRoll, shallowEqual);
    const image = useSelector(state => state.main.selectedImage, shallowEqual);
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);
    const imagesRotation = useSelector(state => state.main.imagesRotation, shallowEqual);

    let rotation = imagesRotation[image.id] !== undefined ? (imagesRotation[image.id] / 360) : 0;
    const spinValue = new Animated.Value(rotation);

// Second interpolate beginning and end values (in this case 0 and 1)
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const {request, loading, error} = useRequest();

    const [saving, setSaving] = useState(false);
    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View></View>
            ),
            ...customBackButtonHeaderProps('Roll', navigation)
        });
    }, [navigation]);

    async function getPermissionAndroid ()
    {
        try
        {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Image Download Permission',
                    message: 'Your permission is required to save images to your device',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            }
            Alert.alert(
                'Save remote Image',
                'Grant Me Permission to save Image',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
            );
        } catch (err) {
            Alert.alert(
                'Save remote Image',
                'Failed to save Image: ' + err.message,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
            );
        }
    }

    async function download ()
    {
        analytics().logEvent('downloadImage', {idImage : image.id});

        // if device is android you have to ensure you have permission
        if (Platform.OS === 'android') {
            const granted = await getPermissionAndroid();
            if (!granted) {
                return;
            }
        }

        setSaving(true);

        RNFetchBlob.config({
            fileCache: true,
            appendExt: 'png',
        })
            .fetch('GET', image.image_urls.sm)
            .then(res => {
                CameraRoll.save(res.data, {type : 'photo'})
                    .then(() => {
                        Alert.alert(
                            'Save remote Image',
                            'Image Saved Successfully',
                            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                            {cancelable: false},
                        );
                    })
                    .catch(err => {
                        Alert.alert(
                            'Save remote Image',
                            'Failed to save Image: ' + err.message,
                            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                            {cancelable: false},
                        );
                    })
                    .finally(() => setSaving(false));
            })
            .catch(error => {
                setSaving(false);
                Alert.alert(
                    'Save remote Image',
                    'Failed to save Image: ' + error.message,
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                );
            });
    }

    function rotate ()
    {
        if (rotationBlock)
        {
            return;
        }

        rotationBlock = true;

        let newRotation = rotation + 0.25;
        rotation = newRotation;
        let angle = Math.round(360 * newRotation) % 360;

        Animated.timing(
            spinValue,
            {
                toValue: newRotation,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();


        setTimeout(async () => {

            rotationBlock = false;

            let updatedImagesRotation = {...imagesRotation, [image.id] : angle};
            setImagesRotation(updatedImagesRotation);

            try
            {
                const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`,
                    {method : "PUT", body : JSON.stringify({id : image.id, rotationAngle : 90})});
            }
            catch (e)
            {
                console.warn('Error during image rotate');
            }
        }, 350);
    }

    async function share ()
    {
        const shareOptions = {
            title: 'Share darkroom image',
            failOnCancel: false,
            urls: [image.image_urls.sm.replace('\\/', '/')],
        };

        try
        {
            const ShareResponse = await SharedUtils.Share.open(shareOptions);
        }
        catch (error)
        {
            console.warn(error.toString());
        }
    }

    async function like (liked)
    {
        let updatedImagesLikes = {...imagesLikes, [image.id] : liked};
        setImagesLikes(updatedImagesLikes);

        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`,
                {method : "PUT", body : JSON.stringify({id : image.id, liked : liked})});
        }
        catch (e)
        {
            console.warn('Error during image update');
        }
    }

    function onDeleteRequest ()
    {
        SharedUtils.Alert.alert('The Darkroom Lab', 'Do you really want to delete selected imaged?',
            [
                {
                    text: 'Cancel',
                    onPress : () => false
                },
                {
                    text: 'Delete',
                    onPress: deleteImage
                }
            ], {cancelable: false});

    }

    async function deleteImage ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`, {method : "DELETE"});
            navigation.goBack();
        }
        catch (e)
        {
            console.warn('Error during image delete');
        }
    }

    const imageIsLiked = useCallback(() =>
    {
        if (imagesLikes[image.id] !== undefined)
        {
            return imagesLikes[image.id];
        }

        return image.liked;
    }, [imagesLikes]);

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <Animated.Image
                style={[styles.image, {transform: [{rotate: spin}] }]}
                source={{uri : image.image_urls.sq}} />
            <View style={styles.actions}>
                <TouchableOpacity onPress={rotate}>
                    <Rotate fill={theme.primaryText}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={share}>
                    <Share fill={theme.primaryText}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => like(!imageIsLiked())}>
                    {
                        imageIsLiked() &&
                        <LikeOn fill={theme.primaryText} style={styles.likeIcon}/>
                    }
                    {
                        !imageIsLiked() &&
                        <LikeOff fill={theme.primaryText} style={styles.likeIcon}/>
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={download}>
                    <Download fill={theme.primaryText} style={{marginTop: 3}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDeleteRequest}>
                    <Delete fill={theme.primaryText} style={{marginTop: 3}}/>
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 30
    },
    image : {
        width: '100%',
        aspectRatio: 1
    },
    actions : {
        flexDirection: 'row',
        justifyContent : 'space-around',
        marginTop: 10
    },
    likeIcon : {
        transform : [{scale: 1.5}],
        marginTop: 7
    }
});
