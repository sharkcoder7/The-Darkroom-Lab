
import React, {Component, useState} from 'react';
import {Image, Text, View} from 'react-native';

function FullWidthImage ({source, ratio, onInit})
{
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [origWidth, setOrigWidth] = useState(0);
    const [origHeight, setOrigHeight] = useState(0);
    const [init, setInit] = useState(false);

    function _onLayout (event)
    {
        const containerWidth = event.nativeEvent.layout.width;

        if (ratio)
        {
            setWidth(containerWidth);
            setHeight(containerWidth * ratio);
            setInit(true);
            onInit();
        }
        else if (typeof source === 'number')
        {
            const source = Image.resolveAssetSource(source);

            setWidth(containerWidth);
            setHeight(containerWidth * source.height / source.width);
            setInit(true);
            onInit();
        }
        else if (typeof source === 'object')
        {
            Image.getSize(source.uri, (width, height) =>
            {
                setWidth(containerWidth);
                setHeight(Math.round(containerWidth * height / width));
                setOrigWidth(width);
                setOrigHeight(height);

                /*setInit(true);
                onInit();*/
            });
        }
    }

    return (
        <View onLayout={_onLayout}>
            {/*<Text style={{color: '#fff', paddingBottom : 10}}>width: {this.state.origWidth} height: {this.state.origHeight}</Text>*/}

            <View style={{width, height}}>
                <Image
                    source={source}
                    style={{width, height}} />
            </View>
        </View>
    );
}

const MemoizedFullWidthImage = React.memo(FullWidthImage);
export default MemoizedFullWidthImage;
