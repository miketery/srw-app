// view verifier
// see credentials that match
// option to present credential
import { useEffect, useState } from 'react'
import { Text, View, Pressable, ScrollView } from 'react-native'
import { LoadingScreen, ErrorScreen, BottomGradient, TopGradient } from '../../components'


import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { formatDate } from '../../lib/utils'
import { ROUTES } from '../../config'
import Verifier from '../../classes/Verifier'
import Credential, {CredentialState} from '../../classes/Credential'
import { VerifierCard } from '../Organization/VerifierViewScreen'


const CredentialCard = ({credential, relevantFields, navigation}) => {
  return <Pressable style={tw`flex flex-col p-2 bg-gray-400 mb-2 rounded`}
      onPress={() => navigation.navigate(ROUTES.CredentialViewRoute, {
        credential_uuid: credential.uuid
      })}>
    <View style={tw`flex flex-row justify-between items-start`}>
      <Text style={tw`font-bold text-xl`}>{credential.name}</Text>
      <View style={tw`flex flex-col items-end`}>
        <Text style={tw``}>{formatDate(credential.issue_date)}</Text>
        <Text style={tw``}>State: {credential.state}</Text>
      </View>
    </View>
    <View style={tw`flex flex-col`}>
      {relevantFields.map((field, index) => {
        const value = credential.data[field]
        return <Text key={index} style={tw`capitalize text-sm`}>{field}: {value.toString()}</Text>
      })}
    </View>
  </Pressable>
}

// given a dictionary of conditions (with some nested conditions)
// traverse and find all values for key "name"
// return a list of names
const getConditionNames = (conditions) => {
  let names = []
  for (const condition of conditions) {
    if (condition.type != "nested") {
      names.push(condition.key)
    } else {
      names = names.concat(getConditionNames(condition.conditions))
    }
  }
  return [...new Set(names)] // dedupe
}

export default function CredentialPresentScreen({navigation, route}) {
  const [verifier, setVerifier] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [relevantFields, setRelevantFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getVerifier = async () => {
      try {
        const verifier = await Verifier.get(route.params.verifier_uuid)
        setVerifier(verifier)
        setRelevantFields(getConditionNames([verifier.conditions]))
        const credentials = await Credential.getForTemplates(verifier.templates)
        setCredentials(credentials)
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
  if (error) return <ErrorScreen error={error.message} />

  return (
    <View style={ds.mainContainerPtGradient}>
      <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
        <VerifierCard verifier={verifier} request_view={true} />
        {credentials.length > 0 && <View style={tw`p-2 bg-gray-600 rounded my-4`}>
          <Text style={[ds.textXl, tw`mt-2`]}>Available Credentials</Text>
          <Text style={[ds.textSm, tw`mb-2 italic`]}>These credentials match the templates of the verifier.</Text>
            {credentials.filter((c) => c.state == CredentialState.PENDING || true).map((credential, index) => (
              <CredentialCard key={index} credential={credential} relevantFields={relevantFields} navigation={navigation} />
            ))}
        </View>}
      </ScrollView>
      <TopGradient />
      <BottomGradient />
    </View>
  )
}

// TODO
// list credentials
// select whcih to present...
// copies UUID
// paste UUID in verifeir
// process whether is verified!!
