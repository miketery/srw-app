import { useEffect, useState } from 'react'
import { Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard';

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { ROUTES } from '../../config'
import { LoadingScreen, GoBackButton, BottomGradient, TopGradient, Error } from '../../components'
import Verifier from '../../classes/Verifier'
import { myGoBack } from '../../lib/utils';


const VerifyCredential = ({verifier}) => {
  const [credentialUUID, setCredentialUUID] = useState('')
  const [success, setSuccess] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const verifyCredential = async () => {
    setLoading(true)
    try {
      const result = await Verifier.verify(verifier.uuid, credentialUUID)
      console.log('Verification result: ' + result)
      if (result) {
        setSuccess(true)
      } else {
        setFailed(true)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setError(error)
      setLoading(false)
    }
  }
  const resetForm = () => {
    setCredentialUUID('')
    setSuccess(false)
    setFailed(false)
    setError(null)
  } 

  return <View>
    <View style={tw`bg-gray-200 rounded p-2 my-2`}>
      <View style={tw`mb-4`}>
        <Text style={tw`text-2xl`}>Verify Credential</Text>
      </View>
      <View style={tw`mb-4`}>
        {/* { error && <Error error={error} /> } */}
        {success && 
          <Pressable style={tw`bg-green-600 p-2 h-23 rounded-lg flex flex-row justify-center items-center`}
              onPressIn={resetForm}>
            <Text style={tw`text-3xl text-green-100 font-bold uppercase`}>Verified!</Text>
          </Pressable>} 
        {!success && failed && 
          <Pressable style={tw`bg-red-600 p-2 h-23 rounded-lg flex flex-row justify-center items-center`}
              onPressIn={resetForm}>
            <Text style={tw`text-3xl text-red-100 uppercase font-bold`}>Not verified!</Text>
          </Pressable>} 
        {!success && !failed && 
        <View style={tw`flex flex-col justify-between items-center`}>
          <TextInput
            style={tw`w-full p-2 border-2 border-blue-500 rounded-t-lg bg-blue-100 text-center text-lg font-mono font-bold text-blue-600`}
            onChangeText={setCredentialUUID}
            value={credentialUUID}
            placeholder="Enter credential UUID"
          />
          <Pressable style={[ds.blueButton, tw`w-full ml-0 rounded-b-lg p-2`]}
              onPressOut={verifyCredential}>
            <Text style={ds.buttonText}>Verify</Text>
          </Pressable>
        </View>
        }
      </View>
    </View>
  </View>
}



const Condition = ({condition, level=1}) => {
  const is_nested = condition.type === 'nested'
  const color = level % 2 == 0 ? 'bg-gray-300' : 'bg-gray-100'

  if (is_nested) {
    return (
      <View style={tw`p-2 flex flex-row items-center border-t border-l ${color}`}>
        <Text style={tw`text-lg uppercase mx-2 font-mono font-bold`}>{condition.operator}</Text>
        <View style={tw`flex-grow-1`}>
          {condition.conditions.map((condition, i) =>
            <Condition key={i} condition={condition} level={level+1} />
          )}
        </View>
        {/* <Text>{condition.value}</Text> */}
      </View>)
  } else {
    return (
      <View style={tw`flex flex-row justify-start items-center p-2 ${color} border-t border-l`}>
        <Text style={tw`font-mono text-blue-700 font-bold mr-1`}>{condition.type}</Text>
        <Text style={tw`font-mono text-red-700 font-bold mr-1`}>{condition.key}</Text>
        <Text style={tw`font-mono text-black font-bold mr-1`}>{condition.operator}</Text>
        <Text style={tw`font-mono text-green-700 font-bold mr-1`}>{condition.value.toString()}</Text>
      </View>
    )
  }
}

export const VerifierCard = ({verifier, navigation, request_view=true}) => {
  const [toggleConditions, setToggleConditions] = useState(!request_view)

  return <View style={tw`bg-gray-200 rounded p-2`}>
    <View style={tw`mb-4`}>
      <Text style={tw`text-2xl`}>{verifier.name}</Text>
    </View>
    <View style={tw`mb-4`}>
      <Text style={tw`text-lg`}>Description</Text>
      <Text>{verifier.description}</Text>
    </View>
    <View style={tw`mb-4`}>
      <View style={tw`flex flex-row justify-between items-center`}>
        <Text style={tw`text-lg`}>Conditions</Text>
        <Pressable style={[ds.buttonTiny, ds.blueButton, tw`w-16`]} 
            onPressIn={() => setToggleConditions(!toggleConditions)}>
          <Text style={ds.buttonTextSm}>{toggleConditions ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>
      {toggleConditions && <Condition condition={verifier.conditions} />}
    </View>
    <View style={tw`mb-4`}>
      <Text style={tw`text-lg`}>Verifier UUID</Text>
      <Pressable 
          style={tw`p-2 border-2 border-blue-500 rounded bg-blue-100 text-center flex flex-row justify-between items-center`}
          onPress={() => Clipboard.setString(verifier.uuid)}>
        <Text style={[ds.monoKeyVC, tw`text-lg`]}>{verifier.uuid}</Text>
        <View style={tw``}>
          <Icon name="copy-outline" size={30} color="#3b82f6" />
        </View>
      </Pressable>
    </View>
  </View>
}

export default function VerifierViewScreen({navigation, route}) {
  const [verifier, setVerifier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getVerifier = async () => {
      try {
        const verifier = await Verifier.get(route.params.verifier_uuid)
        console.log(verifier)
        setVerifier(verifier)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setError(error)
        setLoading(false)
      }
    }
    getVerifier()
  }, [])

  if (loading) return <LoadingScreen />
  if (error) return <Error error={error.message} />

  return (
    <View style={ds.mainContainerPtGradient}>
      <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
        <VerifierCard verifier={verifier} navigation={navigation} />
      </ScrollView>
      <TopGradient />
      <BottomGradient />
      <VerifyCredential verifier={verifier} navigation={navigation} />
      <View style={ds.buttonRow}>
        <GoBackButton onPressOut={() => myGoBack(navigation)} />
      </View>
    </View>
  )
}