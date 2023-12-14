import React from 'react'
import { Pressable, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../lib/tailwind'
import ds from '../assets/styles'

const container_style = tw`flex flex-row border p-2 items-center my-4 rounded-xl`
const text_style = tw`text-slate-200`
const bold_style = [tw`font-bold`, text_style]
const icon_style = [tw`px-2 mr-2`, text_style]
const icon_size = 24

const map = {
    Success: {
        icon: 'checkmark-circle-outline',
        container: tw`border-green-200 bg-slate-700`,
    },
    Info: {
        icon: 'information-circle-outline',
        container: tw`border-blue-200 bg-slate-700`,
    },
    Loading: {
        icon: 'hourglass-outline',
        container: tw`border-lightblue bg-darkblue`,
    },
    Warning: {
        icon: 'warning',
        container: tw`border-lightyellow bg-darkyellow`,
    },
    Error: {
        icon: 'close-circle-outline',
        container: tw`bg-darkred border-red-400`,
    },
}

type DialogueProps = {
    type: keyof typeof map,
    header?: string,
    msg?: string,
    error?: string,
    warning?: string,
    details?: string,
    toggle?: () => void,
}

export function Dialogue(props: DialogueProps) {
    const [toggle, setToggle] = React.useState(false)
    const msg = props.error || props.warning || props.msg
    return <View style={[container_style, map[props.type].container]}>
        <View>
            <Text style={icon_style}>
                <Icon name={map[props.type].icon} size={icon_size} />
            </Text>
        </View>
        <View style={tw`shrink`}>
            <Text style={bold_style}>{props.header ? props.header : props.type}</Text>
            <Text style={text_style}>
                {msg}
            </Text>
            {props.details ? 
            <Pressable onPress={() => setToggle(!toggle)}>
                <Text style={text_style}><u>Details</u></Text>
            </Pressable> : null}
            {toggle ? <Text style={text_style}>{props.details}</Text> : null}
            {'toggle' in props ? <View style={tw`items-center`}>
                <Pressable style={tw`p-1 rounded my-2 items-center bg-seethrough-30 px-6`} onPress={props.toggle}>
                    <Text style={text_style}>Try Again</Text>
                </Pressable>
            </View> : null}
        </View>
    </View>
}

export function DialogueScreen(props: DialogueProps) {
    return <View style={[ds.mainContainerPt, tw`justify-center`]}>
        <Dialogue {...props} />
    </View>
}

type DialogueTypeProps = {
    header?: string,
    msg?: string,
    error?: string,
    warning?: string,
    details?: string,
    toggle?: () => void,
}

export const Success = (props: DialogueTypeProps) => <Dialogue type='Success' {...props} />
export const SuccessScreen = (props: DialogueTypeProps) => <DialogueScreen type='Success' {...props} />
export const Info = (props: DialogueTypeProps) => <Dialogue type='Info' {...props} />
export const InfoScreen = (props: DialogueTypeProps) => <DialogueScreen type='Info' {...props} />
export const Loading = (props: DialogueTypeProps) => <Dialogue type='Loading' {...props} />
export const LoadingScreen = (props: DialogueTypeProps) => <DialogueScreen type='Loading' {...props} />
export const Warning = (props: DialogueTypeProps) => <Dialogue type='Warning' {...props} />
export const WarningScreen = (props: DialogueTypeProps) => <DialogueScreen type='Warning' {...props} />
export const Error = (props: DialogueTypeProps) => <Dialogue type='Error' {...props} />
export const ErrorScreen = (props: DialogueTypeProps) => <DialogueScreen type='Error' {...props} />

// export function FieldError(props) {
//     if(!props.errors) return null
//     if(Object.keys(props.errors).includes(props.name) &&
//         props.errors[props.name] != '')
//         return <View style={tw`my-1`}>
//             <Text style={tw`text-yellow-300 text-base`}>
//                 {props.errors[props.name]}
//             </Text>
//         </View>
//     return null
// }