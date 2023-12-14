import React from 'react';
import { Text, View, ImageBackground } from 'react-native';

import tw from '../lib/tailwind';
import ds from '../assets/styles';

const purpleGardient = {background: 'linear-gradient(197deg, rgba(55, 19, 138, 0.75) 29.44%, rgba(25, 25, 75, 0.00) 79.04%)'}

type StartContainerProps = {
    imageStyle?: object,
    children: React.ReactNode,
    header?: string
}

const StartContainer = ({imageStyle, children, header }: StartContainerProps) => {
    return <View style={tw`flex-grow bg-xmidnight`}>
        <ImageBackground source={require('../assets/pawel-czerwinski-splash.png')}
                style={tw`h-full`} imageStyle={imageStyle}>
                    <View style={[ds.startContainer, purpleGardient]}>
            {header && <Text style={ds.header}>{header}</Text>}
            {children}
                    </View>
        </ImageBackground>
    </View>
}

export default StartContainer;