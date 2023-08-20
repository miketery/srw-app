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

export function Dialogue(props) {
  const [toggle, setToggle] = React.useState(false)
  const msg = props.error || props.warning || props.t || props.msg
  return <View style={[container_style, map[props.type].container]}>
    <View>
      <Text style={icon_style}>
        <Icon name={map[props.type].icon} size={icon_size} />
      </Text>
    </View>
    <View style={tw`shrink`}>
      <Text style={bold_style}>{props.type}</Text>
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
export function DialogueScreen(props) {
  return <View style={[ds.mainContainerPt, tw`justify-center`]}>
    <Dialogue {...props} />
  </View>
}

export const Info = (props) => <Dialogue type='Info' {...props} />
export const InfoScreen = (props) => <DialogueScreen type='Info' {...props} />
export const Loading = (props) => <Dialogue type='Loading' {...props} />
export const LoadingScreen = (props) => <DialogueScreen type='Loading' {...props} />
export const Warning = (props) => <Dialogue type='Warning' {...props} />
export const WarningScreen = (props) => <DialogueScreen type='Warning' {...props} />
export const Error = (props) => <Dialogue type='Error' {...props} />
export const ErrorScreen = (props) => <DialogueScreen type='Error' {...props} />

export function FieldError(props) {
  const style = 'style' in props ? 
    props.style : tw`text-yellow-300 text-base`
  if(!props.errors) return null
  if(!Object.keys(props.errors).includes(props.name)) return null
  if(typeof(props.errors[props.name]) == 'string' &&
    props.errors[props.name] != '')
    return <View style={tw`my-1`}>
      <Text style={style}>
        {props.errors[props.name]}
      </Text>
    </View>
  if(Array.isArray(props.errors[props.name]) &&
    props.errors[props.name].length > 0)
    return <View style={tw`my-1`}>
      <Text style={style}>
        {props.errors[props.name][0]}
      </Text>
    </View>
  return null
}