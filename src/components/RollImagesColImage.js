import React, {useState} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Image, Dimensions} from 'react-native';

import LikeOff from './icons/LikeOff';
import {LikeOn, SelectOn} from './icons';
import SelectOff from './icons/SelectOff';
import {shallowEqual, useSelector} from 'react-redux';

export function RollImagesColImage ({image, onImageLikeToggle, onImageSelectToggle, selectionMode, onImageOpen, colNumber})
{
    const window = Dimensions.get('window');
    const imagesLikes = useSelector(state => state.main.imagesLikes, shallowEqual);
    const imagesRotation = useSelector(state => state.main.imagesRotation, shallowEqual);
    const [loaded, setLoaded] = useState(false);

    function imageRotationAngle (image)
    {
        if (imagesRotation[image.id] !== undefined && imagesRotation[image.id].date > image.updated_at)
        {
            return `${imagesRotation[image.id].angle}deg`;
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
        const rotationAngle = imageRotationAngle(image);
        return ["0deg", "180deg"].indexOf(rotationAngle) !== -1 ? 360 / 232 : 232 / 360;
        let ratio = index % 2 === colNumber ? 0.8 : 1.5;
        if (imagesRotation[image.id] !== undefined && imagesRotation[image.id] % 180 !== 0)
        {
            return 1;
        }

        return ratio;
    }

    function getImageDimensions ()
    {
        const rotationAngle = imageRotationAngle(image);

        if (["0deg", "180deg"].indexOf(rotationAngle) !== -1)
        {
            return {
                width:  (window.width - 30) * 0.5,
                height: (window.width - 30) * 0.5 * (232 / 360),
                resizeMode : 'cover',
                marginTop : 0,
                marginBottom : 0,
            };
        }
        else
        {
            let width = (window.width - 40) * 0.5 * 360 / 232,
                height = (window.width - 30) * 0.5,
                diff = Math.round((width - height) / 2);

            return {
                width,
                height,
                resizeMode : 'cover',
                marginLeft: -diff,
                marginTop : diff,
                marginBottom : diff,
            };
        }

    }

    const imageDimensions = getImageDimensions();

    return (
        <TouchableWithoutFeedback onPress={() => selectionMode ? onImageSelectToggle(image) : onImageOpen(image)}>
            <View style={[styles.imageWrapper]}>

                <React.Fragment>
                    {
                        loaded && imageIsLiked(image) &&
                        <LikeOn onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                    }
                    {
                        loaded && !imageIsLiked(image) &&
                        <LikeOff onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                    }

                    {
                        selectionMode && image.selected && <SelectOn style={styles.selectIcon}/>
                    }

                    {
                        selectionMode && !image.selected && <SelectOff style={styles.selectIcon}/>
                    }
                </React.Fragment>

                <Image resizeMode={imageDimensions.resizeMode} onLoad={() => setLoaded(true)} style={{
                    transform : [{rotate : imageRotationAngle(image)}],
                    ...imageDimensions
                }} source={{uri : image.image_urls.sm}}/>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        width: '100%'
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
