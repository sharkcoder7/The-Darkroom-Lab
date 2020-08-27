import React from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Image} from 'react-native';

import LikeOff from './icons/LikeOff';
import {LikeOn, SelectOn} from './icons';
import SelectOff from './icons/SelectOff';
import {shallowEqual, useSelector} from 'react-redux';

export function RollImagesCol ({images, onImageLikeToggle, onImageSelectToggle, selectionMode, onImageOpen, colNumber})
{
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);
    const imagesRotation = useSelector(state => state.main.imagesRotation, shallowEqual);

    function imageRotationAngle (image)
    {
        if (imagesRotation[image.id] !== undefined)
        {
            return `${imagesRotation[image.id]}deg`;
        }

        return `0deg`;
    }

    function imageIsLiked (image)
    {
        if (imagesLikes[image.id] !== undefined)
        {
            return imagesLikes[image.id];
        }

        return image.liked;
    }

    function imageAspectRation (image, index)
    {
        let ratio = index % 2 === colNumber ? 0.8 : 1.5;
        if (imagesRotation[image.id] !== undefined && imagesRotation[image.id] % 180 !== 0)
        {
            return 1;
        }

        return ratio;
    }

    return (
        <View style={styles.wrapper}>
            {
                images.map((image, index) =>
                    <TouchableWithoutFeedback onPress={() => selectionMode ? onImageSelectToggle(image) : onImageOpen(image)}>
                        <View style={styles.imageWrapper}>

                            <React.Fragment>
                                {
                                    imageIsLiked(image) &&
                                    <LikeOn onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                                }
                                {
                                    !imageIsLiked(image) &&
                                    <LikeOff onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                                }

                                {
                                    selectionMode && image.selected && <SelectOn style={styles.selectIcon}/>
                                }

                                {
                                    selectionMode && !image.selected && <SelectOff style={styles.selectIcon}/>
                                }
                            </React.Fragment>

                            {/*<FullWidthImage source={{uri : image.image_urls.sm}}/>*/}
                            {/*<FullWidthImage onInit={() => setTimeout(() => setInit(true), 0)} source={{uri : image.image_urls[['sq', 'lg'][Math.floor(Math.random() * ['sq', 'lg'].length)]]}}/>*/}
                            <Image resizeMode="cover" style={{
                                width: '100%',
                                aspectRatio : imageAspectRation(image, index),
                                transform : [{rotate : imageRotationAngle(image)}]
                            }} source={{uri : image.image_urls.sm}}/>
                        </View>
                    </TouchableWithoutFeedback>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        width: '50%'
    },
    imageWrapper : {
        width: '100%',
        padding: 5,
        minHeight : 122,
        position: 'relative',
        overflow: 'hidden'
    },
    image : {
        width: '100%',
    },
    likeIcon : {
        position: 'absolute',
        left: 15,
        top: 15,
        zIndex: 1
    },
    selectIcon : {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1
    }
});
