import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
    StyleSheet,
    Dimensions,
    View,
    TouchableOpacity,
    PermissionsAndroid, Alert, Animated, Easing, ActivityIndicator, SafeAreaView, Platform, Text, StatusBar,
} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import {customBackButtonHeaderProps} from '../components/BackButton';
import {hasAndroidPermissionForCameraRoll, SharedUtils} from '../shared';
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';
import {Delete, Download, LikeOff, Rotate, Share} from '../components/icons';
import {shallowEqual, useSelector} from 'react-redux';
import {
    setImagesLikes,
    setImagesRotation, setImagesTooltipProcessed,
    setRolls,
    setSelectedRoll,
} from '../ducks/main';
import LikeOn from '../components/icons/LikeOn';
import analytics from '@react-native-firebase/analytics';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import {ImageDownloadModal} from '../components/ImageDownloadModal';
import ImgToBase64 from 'react-native-image-base64';
import {hitSlop} from '../theme';
import Modal from 'react-native-translucent-modal';
import Bugsnag from '@bugsnag/react-native'

export default function ImageDetail ({navigation})
{
    let rotationBlock = false;

    const album = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const rolls = useSelector(state => state.main.rolls, shallowEqual);
    const roll = useSelector(state => state.main.selectedRoll, shallowEqual);
    const image = useSelector(state => state.main.selectedImage, shallowEqual);
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);
    const imagesRotation = useSelector(state => state.main.imagesRotation, shallowEqual);
    const imagesTooltipProcessed = useSelector(state => state.main.imagesTooltipProcessed, shallowEqual);
    const orientation = useSelector(state => state.main.orientation, shallowEqual);

    let rotation = (imagesRotation[image.id] !== undefined && imagesRotation[image.id].date > image.updated_at) ? (imagesRotation[image.id].angle / 360) : 0;
    //let rotation = 0;
    const spinValue = React.useMemo(() => new Animated.Value(rotation), [rotation]);

    const spin = React.useMemo(() => spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    }), [rotation]);

    const {request} = useRequest();

    const [imageDownloadModalVisible, setImageDownloadModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sharing, setSharing] = useState(false);
    const { theme } = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View></View>
            ),
            ...customBackButtonHeaderProps('Roll', navigation)
        });

    }, [navigation]);


    async function download ()
    {
        analytics().logEvent('downloadImage', {idImage : image.id});

        if (Platform.OS === 'android' && !(await hasAndroidPermissionForCameraRoll()))
        {
            alert('No permission');
            return ;
        }

        const onError = err =>
        {
            Alert.alert(
                'Save Image',
                'Failed to save Image: ' + err.message,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
            );
        };

        RNFetchBlob.config({fileCache: true, appendExt: 'png'})
            .fetch('GET', image.image_urls.sm)
            .then(res => {
                CameraRoll.save(res.data, {type : 'photo'})
                    .then(() => setImageDownloadModalVisible(true))
                    .catch(onError)
            })
            .catch(onError);
    }

    async function rotate ()
    {
        if (rotationBlock || saving)
        {
            return;
        }

        rotationBlock = true;

        if (!imagesTooltipProcessed)
        {
            SharedUtils.Alert.alert('The Darkroom Lab', 'It won’t be rotated in your online gallery. Coming soon!',
                [
                    {
                        text: 'OK',
                        onPress : () => false
                    }
                ], {cancelable: false});

            setImagesTooltipProcessed(true);
            return ;
        }

        let newRotation = rotation + 0.25;
        rotation = newRotation;
        let originalAngle = Math.round(360 * rotation) % 360;
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

        setTimeout(() =>
        {
            rotationBlock = false;
            setImagesRotation({...imagesRotation, [image.id] : {angle, date : new Date().toISOString()}});
        }, 300);

        //setSaving(true);
        /*try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}/rotate`,
                {method : "PUT", body : JSON.stringify({id : image.id, rotationAngle : 90})}, {}, true);

            if (!response.thumbnail)
            {
                alert('Thumbnail not found');
                throw new Error();
            }

            let updatedImage = {...image, image_urls : {...image.image_urls, sm : response.thumbnail, social : response.thumbnail}, updated_at : new Date().toISOString()},
                updatedImages = roll.images.map(existingImage => {return existingImage.id === image.id ? updatedImage : existingImage}),
                updatedRoll = {...roll, images : updatedImages},
                updatedRolls = rolls.map(roll => roll.id === updatedRoll.id ? updatedRoll : roll);

            setSelectedImage(updatedImage);
            setSelectedRoll(updatedRoll);
            setRolls(updatedRolls);
            //setImagesRotation({...imagesRotation, [image.id] : {angle : originalAngle, date : new Date().toISOString()}});
        }
        catch (e)
        {
            console.warn('Error during image rotate');
        }
        finally {
            setSaving(false);
        }*/
    }

    async function share ()
    {
        setSharing(true);
        let url = image.image_urls.sm.replace('\\/', '/');

        try
        {
            if (Platform.OS === 'ios')
            {
                url = 'data:image/png;base64,' + await ImgToBase64.getBase64String(url);
            }

            const ShareResponse = await SharedUtils.Share.open({
                title: 'Share darkroom image',
                failOnCancel: false,
                type : 'image/png',
                urls: [url]
            });
        }
        catch (error)
        {
            Bugsnag.notify(e);
            console.warn(error.toString());
        }
        finally
        {
            setSharing(false);
        }
    }

    async function like (liked)
    {
        let updatedImagesLikes = {...imagesLikes, [image.id] : liked};
        setImagesLikes(updatedImagesLikes);

        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`,
                {method : "PUT", body : JSON.stringify({id : image.id, liked : liked})}, {});
        }
        catch (e)
        {
            Bugsnag.notify(e);
            console.warn('Error during image update');
        }
    }

    function onDeleteRequest ()
    {
        SharedUtils.Alert.alert('The Darkroom Lab', 'Do you really want to delete selected photo?',
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
            let updatedImages = roll.images.filter(existingImage => existingImage.id !== image.id),
                updatedRoll = {...roll, images : updatedImages},
                updatedRolls = rolls.map(roll => roll.id === updatedRoll.id ? updatedRoll : roll);

            setSelectedRoll({...roll, images : updatedImages});

            navigation.goBack();

            setTimeout(() => {
                setRolls(updatedRolls);
                request(`/albums/${album.id}/rolls/${roll.id}/images`, {method : "DELETE", body : JSON.stringify({imageIds : [image.id]})} );
            }, 0);
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

    const window = Dimensions.get('window');

    let imageParams = {};

    if (orientation !== 'LANDSCAPE')
    {
        imageParams.width = '100%';
        imageParams.height = [0, 0.5].indexOf(rotation) !== -1 ? window.height * (795 / 1200) + 20 : window.height - 50;
    }
    else
    {
        imageParams.height = window.height;
        imageParams.width = [0, 0.5].indexOf(rotation) !== -1 ? imageParams.height / (795 / 1200) : imageParams.height;
        imageParams.marginTop = 0;
        imageParams.modalView = true;
    }

    const imageView = (
        <View style={[styles.imageWrapper, {...imageParams}]}>
            <ReactNativeZoomableView
                captureEvent={true}
                maxZoom={1.5}
                minZoom={0.5}
                zoomStep={0.5}
                initialZoom={1}
                bindToBorders={true}
                style={{}}
            >
                <Animated.Image
                    resizeMode="cover"
                    style={[styles.image, {transform: [{rotate: spin}]}]}
                    source={{uri : image.image_urls.social}} />
            </ReactNativeZoomableView>
        </View>
    );

    return (
        <React.Fragment>

            <Modal mode="pop" visible={imageParams.modalView === true} deviceWidth={window.width} animationIn={'fadeIn'} animationOut={'fadeOut'} hasBackdrop={true} backdropOpacity={1}>
                <View style={styles.modalViewWrapper}>
                    {imageView}
                </View>
            </Modal>

            <SafeAreaView style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]}>

                {imageView}

                <View style={[styles.actions, {backgroundColor : theme.backgroundColor, width: window.width}]}>
                    {
                        !saving &&
                        <TouchableOpacity hitSlop={hitSlop} style={{width: 24}} onPress={rotate}>
                            <Rotate fill={theme.primaryText}/>
                        </TouchableOpacity>
                    }
                    {
                        saving && <ActivityIndicator style={{width: 24}} size="large" color={theme.primaryText}/>
                    }
                    {
                        !sharing &&
                        <TouchableOpacity hitSlop={hitSlop} onPress={share}>
                            <Share fill={theme.primaryText}/>
                        </TouchableOpacity>
                    }
                    {
                        sharing && <ActivityIndicator style={{width: 33}} size="large" color={theme.primaryText}/>
                    }
                    <TouchableOpacity hitSlop={hitSlop} onPress={() => like(!imageIsLiked())}>
                        {
                            imageIsLiked() &&
                            <LikeOn fill={theme.primaryText} style={styles.likeIcon}/>
                        }
                        {
                            !imageIsLiked() &&
                            <LikeOff fill={theme.primaryText} style={styles.likeIcon}/>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={hitSlop} onPress={download}>
                        <Download fill={theme.primaryText} style={{marginTop: 3}}/>
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={hitSlop} onPress={onDeleteRequest}>
                        <Delete fill={theme.primaryText} style={{marginTop: 3}}/>
                    </TouchableOpacity>
                </View>

                <ImageDownloadModal isVisible={imageDownloadModalVisible} close={() => setImageDownloadModalVisible(false)}/>

            </SafeAreaView>
        </React.Fragment>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems : 'center'
    },
    imageWrapper : {
        position: 'relative',
        marginTop: -30
    },
    image : {
        width: '100%',
        aspectRatio: 1200 / 795,
    },
    actions : {
        position : 'absolute',
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        bottom: 0,
        paddingTop: 20,
        left: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent : 'space-around',
        marginTop: 0
    },
    likeIcon : {
        transform : [{scale: 1.5}],
        marginTop: 7
    },
    disabled : {
        opacity: 0.5
    },
    modalViewWrapper : {
        flex: 1,
        alignItems: 'center',
        justifyContent : 'center',
        backgroundColor: '#000'
    }
});
