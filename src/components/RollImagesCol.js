import React from 'react';
import {Image, View, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import {useTheme} from '../theme-manager';
import LikeOff from './icons/LikeOff';
import {LikeOn, SelectOn} from './icons';
import SelectOff from './icons/SelectOff';

export function RollImagesCol ({images, onImageLikeToggle, onImageSelectToggle, selectionMode, onImageOpen})
{
    const { mode, theme, toggle } = useTheme();

    return (
        <View style={styles.wrapper}>
            {
                images.map(image =>
                    <TouchableWithoutFeedback onPress={() => selectionMode ? onImageSelectToggle(image) : onImageOpen(image)}>
                        <View style={styles.imageWrapper}>
                            {
                                image.liked &&
                                <LikeOn onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                            }
                            {
                                !image.liked &&
                                <LikeOff onPress={(e) => {e.stopPropagation(); onImageLikeToggle(image);}} style={styles.likeIcon}/>
                            }

                            {
                                selectionMode && image.selected && <SelectOn style={styles.selectIcon}/>
                            }

                            {
                                selectionMode && !image.selected && <SelectOff style={styles.selectIcon}/>
                            }

                            <Image style={styles.image} resizeMode="cover" source={{uri : image.imageUrl, width : 100, height: 100}}/>
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
        position: 'relative'
    },
    image : {
        width: '100%',
        height: 300
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
