import React, {useEffect, useLayoutEffect, useState} from 'react';
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

export default function ImageDetail ({route, navigation})
{
    const spinValue = new Animated.Value(0);

    let rotation = 0;

// Second interpolate beginning and end values (in this case 0 and 1)
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const {album, rolls, image} = route.params;
    const {request, loading, error} = useRequest();

    const [saving, setSaving] = useState(false);
    const { mode, theme, toggle } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            ...customBackButtonHeaderProps('Roll')
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
            .fetch('GET', image.imageUrl)
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
        let newRotation = rotation + 0.25;
        rotation = newRotation;

        Animated.timing(
            spinValue,
            {
                toValue: newRotation,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }

    async function share ()
    {
        const shareOptions = {
            title: 'Share file',
            failOnCancel: false,
            urls: [image.imageUrl],
        };

        try
        {
            const ShareResponse = await SharedUtils.Share.open(shareOptions);
        }
        catch (error)
        {
            alert(error.toString());
        }
    }

    function like ()
    {

    }

    async function deleteImage ()
    {

    }

    return (
        <View style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>
            <Animated.Image
                style={[styles.image, {transform: [{rotate: spin}] }]}
                source={{uri : image.imageUrl}} />
            <View style={styles.actions}>
                <TouchableOpacity onPress={rotate}>
                    <Text>круг</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={share}>
                    <Text>шеринг</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={like}>
                    <Text>лайк</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={download}>
                    <Text>скачать</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteImage}>
                    <Text>удалить</Text>
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
    }
});
