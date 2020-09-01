import React from 'react';
import {View, StyleSheet} from 'react-native';
import {RollImagesColImage} from './RollImagesColImage';

export function RollImagesCol ({images, onImageLikeToggle, onImageSelectToggle, selectionMode, onImageOpen, colNumber})
{
    return (
        <View style={styles.wrapper}>
            {
                images.map((image, index) => <RollImagesColImage image={image} index={index} onImageLikeToggle={onImageLikeToggle}
                                                            onImageSelectToggle={onImageSelectToggle}
                                                            onImageOpen={onImageOpen} selectionMode={selectionMode}
                                                            colNumber={colNumber}/>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper : {
        width: '50%'
    }
});
