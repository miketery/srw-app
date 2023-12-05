import React from 'react';
import { Text, View, ImageBackground } from 'react-native';

import tw from '../../lib/tailwind';
import ds from '../../assets/styles';

const purpleGardient = {background: 'linear-gradient(197deg, rgba(55, 19, 138, 0.75) 29.44%, rgba(25, 25, 75, 0.00) 79.04%)'}

const StartContainer = ({imageStyle, children, header }) => {
    return <View style={tw`flex-grow`}>
        <ImageBackground source={require('../../assets/pawel-czerwinski-splash.png')}
                style={tw`h-full`} imageStyle={imageStyle}>
                    <View style={[ds.landingContainer, purpleGardient]}>
            {header && <Text style={ds.header}>{header}</Text>}
            {children}
                    </View>
        </ImageBackground>
    </View>
}

export default StartContainer;