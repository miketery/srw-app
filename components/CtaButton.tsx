import React from 'react';
import { Pressable, Text } from 'react-native';

import ds from '../assets/styles';

const colorMap = {
    blue: {background: 'linear-gradient(115deg, #3A50F7 40%, #35F9F9 100%)'},
    green: {background: 'linear-gradient(115deg, #007E11 40%, #D0FF22 100%)'},
    purple: {background: 'linear-gradient(115deg, #6A00BD 40%, #F53059 100%)'},
}
// green: {background: 'linear-gradient(115deg, #30974A 40%, #30D7AA 100%)'},


// props for CtaButton
type CtaButtonProps = {
    label: string,
    onPressOut: () => void,
    color?: keyof typeof colorMap,
}

const CtaButton: React.FC<CtaButtonProps> = ({label, onPressOut, color}) => {
    const style = color ? colorMap[color] : colorMap.blue
    return <Pressable style={[ds.xcta, style]}
            onPressOut={onPressOut}>
        <Text style={ds.xctaText}>{label}</Text>
    </Pressable>
}

export default CtaButton

// import { LinearGradient } from 'expo-linear-gradient';
// <LinearGradient style={ds.xcta}
// locations={[0.2,1]}
// start={{x: 0.2, y:1}}
// end={{x:1,y:0}}
// colors={['#3A50F7', '#35F9F9']}>
// </LinearGradient>