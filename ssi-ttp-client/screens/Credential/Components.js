import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../../lib/tailwind'

const stateToIconMap = {
  'issued': ['shield-checkmark', 'green-800', 'green-200'],
  'revoked': ['close-circle', 'red-700', 'red-200'],
  'pending': ['hourglass-outline', 'amber-800', 'amber-200'],
  'rejected': ['warning', 'gray-600', 'gray-200'],
  'default': ['question', 'gray-600', 'gray-200'],
}

export function VCstateBadge({state}) {
  const [iconName, color, bgColor] = stateToIconMap[state] || stateToIconMap['default']
  return (
    <View style={tw`px-3 py-1 border flex flex-row justify-between items-center border-2 rounded-lg text-${color} border-${color} w-28 bg-${bgColor}`}>
      <Text style={tw`flex flex-row capitalize mr-1 text-${color}`}>{state}</Text>
      <Icon name={iconName} style={tw`text-${color} -mr-1`} size={25}></Icon>
    </View>
  )
}
export function VCStateBadgeSm({state}) {
  const [iconName, color, bgColor] = stateToIconMap[state] || stateToIconMap['default']
  return (
    <View style={tw`p-1 border flex flex-row justify-between items-center border-2 rounded-lg text-${color} border-${color} w-22 bg-${bgColor}`}>
      <Text style={tw`flex flex-row capitalize mr-1 text-${color} text-sm`}>{state}</Text>
      <Icon name={iconName} style={tw`text-${color}`} size={16}></Icon>
    </View>
  )
}

const letterColorCombos = [
  // bg, text
  ['teal-400', 'orange-800'],
  ['orange-600', 'teal-300'],
  ['blue-700', 'yellow-300'],
  ['yellow-500', 'blue-700'],
  ['orange-600', 'violet-800'],
  ['purple-800', 'orange-300'],
  ['pink-700', 'lime-400'],
  ['lime-600', 'red-700'],
  ['red-800', 'lime-300'],
  ['green-800', 'red-300'],
]

export function LetterBadge({name, uuid}) {
  const s = name[0].toUpperCase()
  const num = parseInt(uuid.slice(-12), 16)
  const [bg, text] = letterColorCombos[num % letterColorCombos.length]
  return (
    <View style={tw`p-1 px-3 rounded-full bg-${bg}`}>
      <Text style={tw`capitalize text-${text} text-2xl font-bold`}>{s}</Text>
    </View>
  )
}