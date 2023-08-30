import { Text, Pressable } from 'react-native'
import ds from '../assets/styles'

export const Button = (props) => {
    const style = props.style || ds.button
    const color = props.color || ds.blueButton
    const textStyle = props.textStyle || ds.buttonText
    // Pressable
    return <Pressable style={[style, color]} onPress={props.onPress}>
        <Text style={textStyle}>{props.text}</Text>
    </Pressable>
}