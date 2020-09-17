import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform, ActivityIndicator,
} from 'react-native';
import {processError, useRequest, useUpdater} from '../helper';
import {useTheme} from '../theme-manager';
import HeaderButton from '../components/HeaderButton';
import BackButton, {customBackButtonHeaderProps} from '../components/BackButton';
import {RollImagesCol} from '../components/RollImagesCol';
import {Close, Delete, Download, LikeOn, Share} from '../components/icons';
import DownloadFilm from '../components/icons/DownloadFilm';
import IconBadge from 'react-native-icon-badge';
import {hasAndroidPermissionForCameraRoll, SharedUtils} from '../shared';
import {shallowEqual, useSelector} from 'react-redux';
import {
    setImagesLikes,
    setSelectedImage
} from '../ducks/main';
import LikeOff from '../components/icons/LikeOff';
import analytics from '@react-native-firebase/analytics';
import {RollDownload} from '../components/RollDownload';
import {SheetHeader} from '../components/SheetHeader';
import {SheetBody} from '../components/SheetBody';
import CopyLink from '../components/icons/CopyLink';
import BottomSheet from 'reanimated-bottom-sheet';
import Clipboard from "@react-native-community/clipboard";
import {ImageDownloadModal} from '../components/ImageDownloadModal';
import {hitSlop} from '../theme';
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';

export default function RollImages ({navigation})
{
    const album = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const roll = useSelector(state => state.main.selectedRoll, shallowEqual);
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);
    const orientation = useSelector(state => state.main.orientation, shallowEqual);

    const [imageDownloadModalVisible, setImageDownloadModalVisible] = useState(false);
    const [favouritesFilter, setFavouritesFilter] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [downloadCheckEnabled, setDownloadCheckEnabled] = useState(false);
    const [images1, setImages1] = useState([]);
    const [images2, setImages2] = useState([]);
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [dateMark, setDateMark] = useState(Date.now());
    const bottomSheetEl = useRef();

    const [rollDownloadProcessing, setRollDownloadProcessing] = useState(false);

    const {request} = useRequest();
    const {updateRoll} = useUpdater();

    const { theme } = useTheme();

    /**
     * Set header actions
     */
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton text={'Select'} onPress={() => setSelectionMode(true)}/>
            ),
            ...customBackButtonHeaderProps('Album', navigation)
        });
    }, [navigation]);

    /**
     * Update header actions on selection mode toggle
     */
    useEffect(() => {

        let options = {
            headerRight: () => (
                <HeaderButton text={selectionMode ? 'Select All' : 'Select'} onPress={selectionMode ? () => toggleSelectAll(true) : () => setSelectionMode(true)}/>
            ),
            ...customBackButtonHeaderProps('Album', navigation)
        };

        if (selectionMode)
        {
            options.headerLeft = () =>
                <TouchableOpacity style={styles.cancelButton} onPress={() => {setSelectionMode(false); toggleSelectAll(false);}}>
                    <Close style={styles.cancelButtonIcon} fill="#fff"/>
                </TouchableOpacity>;
        }
        else
        {
            options.headerLeft = () => <BackButton title={'Album'} navigation={navigation} forceTitle={true}/>;
        }

        navigation.setOptions(options);

    }, [navigation, selectionMode, images1, images2]);

    /**
     * Set images for render (apply favourites filter && split images to 2 columns)
     */
    useEffect(() =>
    {
        const images = favouritesFilter ? roll.images.filter(image => imagesLikes[image.id] !== undefined ? imagesLikes[image.id] : image.liked) : roll.images;
        setImages1(images.filter((roll, index) => index % 2 === 0));
        setImages2(images.filter((roll, index) => index % 2 === 1));
    }, [roll, favouritesFilter]);

    /**
     * Force rerender on orientation change
     */
    useEffect(() =>
    {
        setTimeout(() => setDateMark(Date.now()), 300);
    }, [orientation]);

    /**
     * Enable status updater for roll
     */
    useEffect(() =>
    {
        if (roll && roll.download && roll.download.status === 'processing')
        {
            setDownloadCheckEnabled(true);
        }
    }, [roll]);

    /**
     * Run status checker interval for roll download result
     */
    useEffect(() => {

        if (downloadCheckEnabled)
        {
            const downloadCheckInterval = setInterval(() => checkRollDownload(), 3000);
            return () => clearInterval(downloadCheckInterval);
        }

    }, [downloadCheckEnabled]);

    /**
     * Update roll download info using API
     */
    const checkRollDownload = useCallback(async () =>
    {
        try
        {
            let downloads = await request(`/downloads`);
            let rollDownload = downloads.find(downloadItem => +downloadItem.rollId === roll.id && downloadItem.downloadURL !== null && downloadItem.failed === false);
            if (rollDownload !== undefined)
            {
                updateRoll(roll.id, {download : rollDownload});
                setDownloadCheckEnabled(false);
            }
        }
        catch (e)
        {
            processError(e, 'Error during check roll download');
        }
    }, []);

    /**
     * Select/deselect all images
     */
    const toggleSelectAll = (flag) =>
    {
        setSelectedImagesCount(flag ? roll.images.length : 0);
        setImages1(images1.map(img => {
            return {...img, selected : flag};
        }));

        setImages2(images2.map(img => {
            return {...img, selected : flag};
        }));

    };

    /**
     * Like/dislike image
     */
    const onImageLikeToggle = (col, image) =>
    {
        if (col === 1)
        {
            setImages1(images1.map(img => {
                if (img.id === image.id)
                {
                    return {...img, liked : !image.liked};
                }
                return img;
            }));
        }
        else
        {
            setImages2(images2.map(img => {
                if (img.id === image.id)
                {
                    return {...img, liked : !image.liked};
                }
                return img;
            }));

        }

        updateImageLikeState({...image, liked : !image.liked});
    };

    /**
     * Save like/dislike image state to API
     */
    async function updateImageLikeState (image)
    {
        let updatedImagesLikes = {...imagesLikes, [image.id] : image.liked};
        setImagesLikes(updatedImagesLikes);

        try
        {
            await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`,
                {method : "PUT", body : JSON.stringify({id : image.id, liked : image.liked})});
        }
        catch (e)
        {
            processError(e, 'Error during image update');
        }
    }

    /**
     * Select/deselect image
     */
    const onImageSelectToggle = (col, image) =>
    {
        image.selected = image.selected !== undefined ? image.selected : false;
        setSelectedImagesCount(selectedImagesCount + (image.selected ? -1 : 1));
        if (col === 1)
        {
            setImages1(images1.map(img => {
                if (img.id === image.id)
                {
                    return {...img, selected : !image.selected};
                }
                return img;
            }));
        }
        else
        {
            setImages2(images2.map(img => {
                if (img.id === image.id)
                {
                    return {...img, selected : !image.selected};
                }
                return img;
            }));

        }
    };

    /**
     * Delete image using API
     */
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
                    onPress: deleteImages
                }
            ], {cancelable: false});

    }

    /**
     * Delete selected images using API
     */
    function deleteImages ()
    {
        try
        {
            const imageIds = [...images1, ...images2].filter(image => image.selected).map(item => item.id),
                updatedImages = roll.images.filter(image => imageIds.indexOf(image.id) === -1);

            updateRoll(roll.id, {images : updatedImages});

            setSelectedImagesCount(0);
            setSelectionMode(false);

            //request(`/albums/${album.id}/rolls/${roll.id}/images`, {method : "DELETE", body: JSON.stringify({imageIds}) });
        }
        catch (e)
        {
            processError(e, 'Error during selected images delete');
        }
    }

    /**
     * Share selected images urls
     */
    async function share ()
    {
        let urls = [...images1, ...images2].filter(image => image.selected).map(image => image.image_urls.sm.replace('\\/', '/'));

        if (urls.length === 0)
        {
            return;
        }

        if (Platform.OS === 'ios')
        {
          //  urls = urls.map(async url => 'data:image/png;base64,' + await ImgToBase64.getBase64String(url));
        }

        const shareOptions = {
            title: 'Share darkroom image',
            failOnCancel: false,
            urls
        };

        try
        {
            await SharedUtils.Share.open(shareOptions);
        }
        catch (e)
        {
            processError(e, 'Error during selected images share');
        }
    }

    /**
     * Open image when user taps on it
     */
    function onImageOpen (image)
    {
        setSelectedImage(image);
        navigation.navigate('ImageDetail');
    }

    /**
     * Toggle favourites filter
     */
    function toggleFavouritesFilter ()
    {
        setFavouritesFilter(!favouritesFilter);
    }

    /**
     * Download selected images to phone storage
     */
    const downloadSelectedImages = useCallback(async () =>
    {
        setSaving(true);
        analytics().logEvent('downloadSelectedImages', {imagesCount : selectedImagesCount});
        let urls = [...images1, ...images2].filter(image => image.selected).map(image => image.image_urls.social.replace('\\/', '/'));

        if (Platform.OS === 'android' && !(await hasAndroidPermissionForCameraRoll()))
        {
            SharedUtils.Alert.alert(
                'The Darkroom Lab',
                'No permission to save images',
                [{text: 'OK', onPress: () => false}],
                {cancelable: false},
            );
            return;
        }

        const onError = err =>
        {
            SharedUtils.Alert.alert(
                'The Darkroom Lab',
                'Failed to save Images: ' + err.message,
                [{text: 'OK', onPress: () => false}],
                {cancelable: false},
            );
        };

        const onEnd = () =>
        {
            setSaving(false);
            toggleSelectAll(false);
            setSelectionMode(false);
        };

        urls = urls.map(url => RNFetchBlob.config({fileCache: true, appendExt: 'png'}).fetch('GET', url));
        Promise.all(urls).then(images => {

            let fetches = images.map(imageData => CameraRoll.save(imageData.data, {type : 'photo'}));
            Promise.all(fetches).then(() =>
            {
                setImageDownloadModalVisible(true);
            })
            .catch(onError).finally(() => onEnd());
        }).catch(err => {onError(err); onEnd();});

    }, [selectedImagesCount]);

    /**
     * Request for entire roll download using API
     */
    async function downloadEntireRoll ()
    {
        setRollDownloadProcessing(true);
        analytics().logEvent('downloadEntireRoll', {idRoll : roll.id});

        try
        {
           let response = await request(`/albums/${album.id}/rolls/${roll.id}/download`, {method : "PUT" });
            if (response !== 'successful update')
            {
                throw new Error();
            }

            updateRoll(roll.id, {download : {status : 'processing'}});
            setDownloadCheckEnabled(true);
            toggleSelectAll(false);
            setSelectionMode(false);

            SharedUtils.Alert.alert(
                'The Darkroom Lab',
                'Your download is being prepared. After a few moments you will get notification.',
                [{text: 'OK', onPress: () => false}],
                {cancelable: false},
            );

            /*await request(`https://fcm.googleapis.com/fcm/send`, {method : "POST", body : JSON.stringify(
                {
                    "to" : "dniSYiF3TwCejyjItoxLqm:APA91bG3zNhzo2jSWocWrvgRmUpqbkkrUSoGk6Yg1j5KfklWVD9hEcPe93C_1wkmZTpT55luZPGIY1z2l1Sit0H-Mesgs8SboYZtnYDJYmsaVf2_vluVd-7oQRKWiilC4r0ijyuCO7Au",
                    "priority" : "high",
                    "notification" :
                        {
                            "title" : "test",
                            "body" : "test"
                        },
                    "data" : {
                        "field" : "anytext",
                        "type" : "Order"
                    }
                }) }, {'Authorization' : 'key=AAAAltOGyh0:APA91bFVEcXINFITjwxvQO7XuwXJ-RcXR7JJ-65AbjltPtBa8FD9lwQS_XaNoarevl86t9Sk88R6RLTTC90oT4UwN_l8GpXgkOiOv1YwXhNfH1AjQSwzhPgZAnzHqqYsI0CSnnmu-PAB'});
*/

        }
        catch (e)
        {
            processError(e, `Error during roll ${roll.id} download request`);
            SharedUtils.Alert.alert(
                'The Darkroom Lab', 'Error: ' + e.toString(),
                [{text: 'OK', onPress: () => false}],
                {cancelable: false},
            );
        }
        finally
        {
            setRollDownloadProcessing(false);
        }

    }

    function openSheet ()
    {
        bottomSheetEl.current.snapTo(1);
    }

    function renderBottomSheetHeader ()
    {
        return <SheetHeader rollDownloadIcon={true}
                            title={'Roll Download'}
                            additionalText={'Copy link to share or download'}
                            onPress={() => bottomSheetEl.current.snapTo(0)}/>;
    }

    function renderBottomSheetContent ()
    {
        const downloadUrl = roll.download && roll.download.downloadURL || '';

        return (
            <SheetBody style={{height: 220}}>

                <View style={styles.inputWrapper}>
                    <View pointerEvents='none'>
                        <Text style={styles.linkBlock} numberOfLines={1}>
                            {downloadUrl}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => Clipboard.setString(downloadUrl)} style={styles.copyWrapper}>
                        <CopyLink style={styles.copyIcon}/>
                        <Text style={styles.copyText}>COPY LINK</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.copyAdditionalText}>
                    Download is a compressed ZIP file with full resolution images. Downloading to your phone is not recommended.
                </Text>
            </SheetBody>
        );
    }

    return (
        <React.Fragment>
            <ScrollView showsVerticalScrollIndicator={false} style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]} contentContainerStyle={styles.containerStyle}>

                <View style={styles.header}>
                    <Text style={[styles.name, {color: theme.primaryText}]}>{roll.name}</Text>
                    <TouchableOpacity onPress={toggleFavouritesFilter} style={styles.filterIconWrapper}>
                        {favouritesFilter ? <LikeOn fill={theme.primaryText}/> : <LikeOff fill={theme.primaryText}/>}
                    </TouchableOpacity>
                </View>

                {
                    roll.download !== null &&
                    <RollDownload download={roll.download} openSheet={openSheet}/>
                }

                {
                    ((images1.length + images2.length) === 0) &&
                    <Text style={[{color: theme.primaryText}]}>No favourite images</Text>
                }
                <View style={styles.colsWrapper}>
                    <RollImagesCol selectionMode={selectionMode}
                                   images={images1}
                                   onImageSelectToggle={(image) => onImageSelectToggle(1, image)}
                                   onImageLikeToggle={(image) => onImageLikeToggle(1, image)}
                                   onImageOpen={onImageOpen}
                                   colNumber={0}
                    />
                    <RollImagesCol selectionMode={selectionMode}
                                   images={images2}
                                   onImageSelectToggle={(image) => onImageSelectToggle(2, image)}
                                   onImageLikeToggle={(image) => onImageLikeToggle(2, image)}
                                   onImageOpen={onImageOpen}
                                   colNumber={1}
                    />
                </View>

            </ScrollView>
            {
                selectedImagesCount !== 0 &&
                <View style={styles.footer}>
                    <TouchableOpacity hitSlop={hitSlop} onPress={share} style={styles.buttonWrapper}>
                        <Share style={styles.footerIcon}/>
                    </TouchableOpacity>
                    <View style={styles.buttonWrapper}>
                        {
                            saving && <ActivityIndicator style={{width: 24, marginLeft: 10}} size="large" color={theme.primaryText}/>
                        }
                        {
                            !saving &&
                            <IconBadge
                                MainElement={
                                    <TouchableOpacity hitSlop={hitSlop} onPress={downloadSelectedImages}>
                                        <Download style={styles.footerIcon}/>
                                    </TouchableOpacity>
                                }
                                BadgeElement={<Text onPress={downloadSelectedImages} style={styles.badgeText}>{selectedImagesCount}</Text>}
                                IconBadgeStyle={styles.badge}
                                Hidden={false}
                            />
                        }
                    </View>
                    <View style={styles.buttonWrapper}>
                        {
                            rollDownloadProcessing && <ActivityIndicator style={{width: 24, height: 37, marginLeft: 10}} size="large" color={theme.primaryText}/>
                        }
                        {
                            !rollDownloadProcessing &&
                            <IconBadge
                                MainElement={
                                    <TouchableOpacity hitSlop={hitSlop} onPress={downloadEntireRoll}>
                                        <DownloadFilm style={styles.footerIcon}/>
                                    </TouchableOpacity>
                                }
                                BadgeElement={<Text onPress={downloadEntireRoll} style={styles.badgeText}>{roll.images.length}</Text>}
                                IconBadgeStyle={styles.badge}
                                Hidden={false}
                            />
                        }
                    </View>
                    <TouchableOpacity hitSlop={hitSlop} onPress={onDeleteRequest} style={styles.buttonWrapper}>
                        <Delete style={styles.footerIcon}/>
                    </TouchableOpacity>
                </View>
            }

            <ImageDownloadModal isVisible={imageDownloadModalVisible} close={() => setImageDownloadModalVisible(false)}/>

            <BottomSheet
                ref={bottomSheetEl}
                initialSnap={0}
                snapPoints={[0, 300]}
                renderContent={renderBottomSheetContent}
                renderHeader={renderBottomSheetHeader}
            />
        </React.Fragment>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        width: '100%',
        paddingTop: 15,
        paddingHorizontal : 10
    },
    header : {
        flexDirection : 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    name : {
        color: '#fff',
        fontSize: 20,
        fontFamily : 'Montserrat-SemiBold'
    },
    filterIconWrapper : {
        marginRight: 15,
        padding: 5,
    },
    colsWrapper : {
        flexDirection : 'row',
        margin: -5
    },
    cancelButton : {
        backgroundColor: '#40908c',
        borderRadius : 50000,
        borderBottomLeftRadius: 50000,
        borderBottomRightRadius: 50000,
        borderTopLeftRadius: 50000,
        borderTopRightRadius: 50000,
        padding: 3,
        marginLeft: 15
    },
    cancelButtonIcon : {
        transform : [{scale : 0.9}]
    },
    footer : {
        backgroundColor: '#00000080',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        paddingTop: 15,
        paddingBottom: 25,
    },
    buttonWrapper : {
        width: '25%',
        alignItems : 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerIcon : {
        transform: [{scale: 0.8}]
    },
    badge : {
        paddingHorizontal: 3,
        paddingVertical: 3,
        right: -10,
        top: -10,
        width: 25,
        height : 'auto',
        backgroundColor: '#3e9d99'
    },
    badgeText : {
        color: '#fff'
    },
    containerStyle : {
        paddingBottom: 100
    },
    inputWrapper : {
        backgroundColor : '#e1e1e1',
        flexDirection : 'row',
        width : '100%',
        paddingLeft: 10,
        marginTop: 10
    },
    linkBlock : {
        width: Dimensions.get('window').width - 50 - 60,
        paddingVertical: 15
    },
    copyWrapper : {
        backgroundColor: '#bfbcbc',
        width: 70,
        flexDirection : 'column',
        justifyContent : 'center',
        alignItems : 'center'
    },
    copyIcon : {

    },
    copyText : {
        fontSize: 8,
        marginTop: 3
    },
    copyAdditionalText : {
        color: '#999',
        marginTop: 20
    }
});
