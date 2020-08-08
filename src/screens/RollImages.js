import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import {useRequest} from '../helper';
import {useTheme} from '../theme-manager';
import HeaderButton from '../components/HeaderButton';
import BackButton, {customBackButtonHeaderProps} from '../components/BackButton';
import {RollImagesCol} from '../components/RollImagesCol';
import {Close, Delete, Download, Share} from '../components/icons';
import DownloadFilm from '../components/icons/DownloadFilm';
import IconBadge from 'react-native-icon-badge';
import {SharedUtils} from '../shared';

export default function RollImages ({route, navigation})
{
    const {album, roll} = route.params;
    const [selectionMode, setSelectionMode] = useState(false);
    const [images1, setImages1] = useState(roll.images.slice(0, 2));
    const [images2, setImages2] = useState(roll.images.slice(2));
    const [selectedImagesCount, setSelectedImagesCount] = useState(0);
    const {request, loading, error} = useRequest();

    const { mode, theme, toggle } = useTheme();


    useLayoutEffect(() => {

        let options = {
            headerRight: () => (
                <HeaderButton text={selectionMode ? 'Select All' : 'Select'} onPress={selectionMode ? selectAll : () => setSelectionMode(true)}/>
            ),
            ...customBackButtonHeaderProps('Album', navigation)
        };

        if (selectionMode)
        {
            options.headerLeft = () =>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectionMode(false)}>
                    <Close style={styles.cancelButtonIcon} fill="#fff"/>
                </TouchableOpacity>;
        }
        else
        {
            options.headerLeft = () => <BackButton title={'Album'} navigation={navigation}/>;
        }

        navigation.setOptions(options);

    }, [navigation, selectionMode]);

    useEffect(() =>
    {
        getImages();
    }, []);

    async function getImages ()
    {
        try
        {
            const response = await request(`/albums/${album.id}/rolls/${roll.id}/images`);
        }
        catch (e)
        {
            alert('error:' + e);
        }
    }

    function selectAll ()
    {
        setSelectedImagesCount(roll.images.length);
        setImages1(images1.map(img => {
            return {...img, selected : true};
        }));

        setImages2(images2.map(img => {
            return {...img, selected : true};
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
        SharedUtils.Alert.alert('Delete images', 'Do you really want to delete selected imaged?',
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
            alert(error.toString());
        }
    }

    function onImageOpen (image)
    {
        navigation.navigate('ImageDetail', {album, roll, image : image});
    }

    return (
        <React.Fragment>
            <ScrollView style={[styles.wrapper, {backgroundColor : theme.backgroundColor}]} contentContainerStyle={styles.containerStyle}>
                <Text style={[styles.name, {color: theme.primaryText}]}>{roll.name}</Text>
                <View style={styles.colsWrapper}>
                    <RollImagesCol selectionMode={selectionMode}
                                   images={images1}
                                   onImageSelectToggle={(image) => onImageSelectToggle(1, image)}
                                   onImageLikeToggle={(image) => onImageLikeToggle(1, image)}
                                   onImageOpen={onImageOpen}
                    />
                    <RollImagesCol selectionMode={selectionMode}
                                   images={images2}
                                   onImageSelectToggle={(image) => onImageSelectToggle(2, image)}
                                   onImageLikeToggle={(image) => onImageLikeToggle(2, image)}
                                   onImageOpen={onImageOpen}
                    />
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.buttonWrapper}>
                    <Share style={styles.footerIcon}/>
                </View>
                <View style={styles.buttonWrapper}>
                    <IconBadge
                        MainElement={
                            <TouchableOpacity onPress={() => false}>
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
                            <TouchableOpacity>
                                <DownloadFilm style={styles.footerIcon}/>
                            </TouchableOpacity>
                        }
                        BadgeElement={<Text style={styles.badgeText}>{selectedImagesCount}</Text>}
                        IconBadgeStyle={styles.badge}
                        Hidden={false}
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Delete onPress={onDeleteRequest} style={styles.footerIcon}/>
                </View>
            </View>
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
    name : {
        color: '#fff',
        fontSize: 20,
        fontFamily : 'Montserrat-SemiBold',
        marginBottom: 15
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
