import { Text, Pressable } from 'react-native'
import ds from '../assets/styles'

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