import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import HeaderButton from '../components/HeaderButton';
import BackButton, {customBackButtonHeaderProps} from '../components/BackButton';
import {RollImagesCol} from '../components/RollImagesCol';
import {Close, Delete, Download, LikeOn, Share} from '../components/icons';
import DownloadFilm from '../components/icons/DownloadFilm';
import IconBadge from 'react-native-icon-badge';
import {SharedUtils} from '../shared';
import {shallowEqual, useSelector} from 'react-redux';
import {setImagesLikes, setRolls, setSelectedImage, setSelectedRoll} from '../ducks/main';
import LikeOff from '../components/icons/LikeOff';
import analytics from '@react-native-firebase/analytics';

export default function RollImages ({route, navigation})
{
    const album = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const roll = useSelector(state => state.main.selectedRoll, shallowEqual);
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);

    const [favouritesFilter, setFavouritesFilter] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [images1, setImages1] = useState([]);
    const [images2, setImages2] = useState([]);
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();

    useEffect(() =>
    {
        const images = favouritesFilter ? roll.images.filter(image => imagesLikes[image.id] !== undefined ? imagesLikes[image.id] : image.liked) : roll.images;
        const allImages1 = images.filter((roll, index) => index % 2 === 0);
        const allImages2 = images.filter((roll, index) => index % 2 === 1);
       /* const firstPart1 = allImages1.slice(0, 4);
        const firstPart2 = allImages2.slice(0, 4);*/
        setImages1(allImages1);
        setImages2(allImages2);

        /*setTimeout(() => {
            setImages1([...firstPart1, ...allImages1.slice(4)]);
            setImages2([...firstPart2, ...allImages2.slice(4)]);
        }, 300);*/

    }, [favouritesFilter]);

    useLayoutEffect(() => {

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
            options.headerLeft = () => <BackButton title={'Album'} navigation={navigation}/>;
        }

        navigation.setOptions(options);

    }, [navigation, selectionMode]);

    function toggleSelectAll (flag)
    {
        setSelectedImagesCount(flag ? roll.images.length : 0);
        setImages1(images1.map(img => {
            return {...img, selected : flag};
        }));

        setImages2(images2.map(img => {
            return {...img, selected : flag};
        }));

    }

    function onImageLikeToggle (col, image)
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
    }

    async function updateImageLikeState (image)
    {
        let updatedImagesLikes = {...imagesLikes, [image.id] : image.liked};
        setImagesLikes(updatedImagesLikes);

        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images/${image.id}`,
                {method : "PUT", body : JSON.stringify({id : image.id, liked : image.liked})});
        }
        catch (e)
        {
            console.warn('Error during image update');
        }
    }

    function onImageSelectToggle (col, image)
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
                    onPress: () => false
                }
            ], {cancelable: false});

    }

    function onDelete ()
    {

    }

    async function share ()
    {
        const shareOptions = {
            title: 'Share file',
            failOnCancel: false,
            urls: [],
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

    function onImageOpen (image)
    {
        setSelectedImage(image);
        navigation.navigate('ImageDetail');
    }

    function toggleFavouritesFilter ()
    {
        setFavouritesFilter(!favouritesFilter);
    }

    const downloadSelectedImages = useCallback(() =>
    {
        analytics().logEvent('downloadSelectedImages', {imagesCount : selectedImagesCount});
    }, [selectedImagesCount]);

    const downloadEntireRoll = useCallback(() =>
    {
        analytics().logEvent('downloadEntireRoll', {idRoll : roll.id});
    }, [roll]);

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

                {/*<MasonryList
                    images={roll.images.map(image => ({uri : image.image_urls.sm}))}
                    spacing={5}
                />*/}

            </ScrollView>
            {
                selectedImagesCount !== 0 &&
                <View style={styles.footer}>
                    <View style={styles.buttonWrapper}>
                        <Share style={styles.footerIcon}/>
                    </View>
                    <View style={styles.buttonWrapper}>
                        <IconBadge
                            MainElement={
                                <TouchableOpacity onPress={downloadSelectedImages}>
                                    <Download style={styles.footerIcon}/>
                                </TouchableOpacity>
                            }
                            BadgeElement={<Text style={styles.badgeText}>{selectedImagesCount}</Text>}
                            IconBadgeStyle={styles.badge}
                            Hidden={false}
                        />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <IconBadge
                            MainElement={
                                <TouchableOpacity onPress={downloadEntireRoll}>
                                    <DownloadFilm style={styles.footerIcon}/>
                                </TouchableOpacity>
                            }
                            BadgeElement={<Text style={styles.badgeText}>{roll.images.length}</Text>}
                            IconBadgeStyle={styles.badge}
                            Hidden={false}
                        />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Delete onPress={onDeleteRequest} style={styles.footerIcon}/>
                    </View>
                </View>
            }
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
        paddingVertical: 10
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
        width : 10,
        height : 20,
        right: -5,
        top: -5,
        backgroundColor: '#3e9d99'
    },
    badgeText : {
        color: '#fff'
    },
    containerStyle : {
        paddingBottom: 100
    }
});
