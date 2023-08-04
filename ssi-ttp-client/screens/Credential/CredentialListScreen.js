import axios from 'axios'
import React from 'react'
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';

import { formatDate } from '../../lib/utils'
import { ROUTES } from '../../config'
import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { BottomGradient, LoadingScreen, TopGradient } from '../../components'

import Credential from '../../classes/Credential';
import { LetterBadge, VCstateBadge } from './Components'


function CredentialSmall(props) {
  const {name, type, state, issuer, issuer_name, issue_date, uuid} = props.credential
  return <View key={uuid} style={ds.row}>
  <View style={tw`flex flex-col flex-grow-1`}>
    <View style={tw`flex flex-row justify-between items-center mb-1`}>
      <View style={tw`flex flex-row items-center`}>
        <LetterBadge name={issuer_name} uuid={issuer} />
        <View style={tw`flex flex-col flex-grow-1 ml-2`}>
          <Text style={ds.text}>{issuer_name}</Text>
          <Text style={ds.text}>{name}</Text>
          <Text style={ds.textXs}>{formatDate(issue_date)}</Text>
        </View>
      </View>
      <View style={tw`flex flex-col items-end`}>
        <VCstateBadge state={state} />
      </View>
    </View>
    <View style={tw`text-center`}>
      <Text style={ds.monoKeyVC}>{uuid}</Text>
    </View>
  </View>
  </View>
}

const CredentialList = (props) => {
  const { credentials } = props
  return <View>
  {credentials.map((credential, index) => 
  <Pressable key={index} onPress={() => 
      props.navigation.navigate(ROUTES.CredentialViewRoute, 
      {credential_uuid: credential.uuid})}>
    <CredentialSmall credential={credential} />
  </Pressable>)}
  </View>
}

const getCredentialsAndSet = (setCredentials) => {
  Credential.getAll().then((credentials) => {
    setCredentials(credentials)
  }).catch((error) => {
    console.log(error);
  });
}

const CredentialListScreen = (props) => {
  const [credentials, setCredentials] = React.useState([])

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      console.log('[CredentialListScreen.focus]')
      getCredentialsAndSet(setCredentials)
    });
    return unsubscribe;
  }, []);

  return (
    <View style={ds.mainContainerPtGradient}>
      <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
        <Text style={ds.header}>My Credentials</Text>
        <CredentialList credentials={credentials} navigation={props.navigation} />
        <View style={tw`flex-grow-1`} />
      </ScrollView>
      <TopGradient />
      <BottomGradient />
    </View>
  )
}

export default CredentialListScreen