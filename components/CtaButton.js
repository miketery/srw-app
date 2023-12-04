import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';

import ds from '../assets/styles';
import tw from '../lib/tailwind';


const CtaButton = ({label, onPressOut}) => {
    return <Pressable style={tw`w-full`}
            onPressOut={onPressOut}>
        <LinearGradient style={ds.xcta}
                locations={[0.2,1]}
                start={{x: 0.2, y:1}}
                end={{x:1,y:0}}
                colors={['#3A50F7', '#35F9F9']}>
            <Text style={ds.buttonTextSm}>{label}</Text>
        </LinearGradient>
    </Pressable>
}

export default CtaButton