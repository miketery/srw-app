import { View } from 'react-native'
import tw from '../lib/tailwind'

export const TopGradient = (props) => (
    <View style={[tw`h-11 w-full absolute top-2 -ml-3`,
    {background: 'linear-gradient(180deg, rgba(13,16,32,1) 0%, rgba(255,255,255,0) 100%)'}]} />
)
export const BottomGradient = (props) => (
    <View style={[tw`h-11 -mt-10 w-full`,
    {background: 'linear-gradient(0deg, rgba(13,16,32,1) 0%, rgba(255,255,255,0) 100%)'}]} />
)