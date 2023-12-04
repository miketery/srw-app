import React from 'react';
import { Text, View, ImageBackground } from 'react-native';

import tw from '../../lib/tailwind';
import ds from '../../assets/styles';

const StartContainer = ({imageStyle, children, header }) => {
    return <View style={tw`flex-grow`}>
        <ImageBackground source={require('../../assets/pawel-czerwinski-splash.png')}
                style={ds.landingContainer} imageStyle={imageStyle}>
            {header && <Text style={ds.header}>{header}</Text>}
            {children}
        </ImageBackground>
    </View>
}

export default StartContainer;