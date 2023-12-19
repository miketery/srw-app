import { Text, Pressable } from 'react-native'
import ds from '../assets/styles'
import { DEV } from '../config'
import tw from '../lib/tailwind'

type ButtonProps = {
    text: string,
    onPress: () => void,
    style?: object,
    color?: object,
    textStyle?: object
}

export const Button = (props: ButtonProps) => {
    const style = props.style || ds.button
    const color = props.color || ds.blueButton
    const textStyle = props.textStyle || ds.buttonText
    // Pressable
    return <Pressable style={[style, color]} onPress={props.onPress}>
        <Text style={textStyle}>{props.text}</Text>
    </Pressable>
}

export const DevButton = DEV ? ({onPressOut}: {onPressOut: () => void}) => {
    return <Pressable style={[ds.button, tw`w-25`]}
                onPressOut={onPressOut}>
            <Text style={ds.buttonText}>Dev</Text>
        </Pressable>
    } : null