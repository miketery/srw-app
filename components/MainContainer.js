import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { TopGradient } from '../components'

import tw from '../lib/tailwind';
import ds from '../assets/styles';

const colorGradient = {
    purple: {background: 'linear-gradient(197deg, rgba(55, 19, 138, 0.75) 29.44%, rgba(25, 25, 75, 0.00) 79.04%)'},
    blue: { background: 'linear-gradient(141deg, #19194B 14.58%, #3A50F7 69.26%)'},
}

const MainContainer = ({ children, buttonRow, header, color }) => {
    const gradient = colorGradient[color] || {}
    return<View style={[ds.mainContainerPtGradient, gradient]}>
        <ScrollView style={[ds.scrollViewGradient]}>
            {header && <View style={ds.headerRow}>
                <Text style={ds.header}>{header}</Text>
            </View>}
            <View style={ds.mainBody}>
                {children}
            </View>
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {buttonRow}
        </View>
    </View>
}

export default MainContainer;