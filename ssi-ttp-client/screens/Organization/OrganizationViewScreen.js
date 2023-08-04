import { useEffect, useState } from 'react'
import { Text, View, Pressable, ScrollView } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { ROUTES } from '../../config'
import { LoadingScreen, GoBackButton, BottomGradient, TopGradient } from '../../components'
import Organization from '../../classes/Organization'
import Template from '../../classes/Template'
import Credential from '../../classes/Credential'
import { VCStateBadgeSm } from '../Credential/Components'
import Verifier from '../../classes/Verifier'

const OrganizationCard = (props) => {
  return (
    <Pressable style={tw`bg-gray-200 rounded p-2`}
      onPress={() => props.onPress(props.organization)}>
      <Text style={tw`text-lg`}>{props.organization.name}</Text>
      <Text>{props.organization.address}</Text>
      <Text>{props.organization.city}, {props.organization.state} {props.organization.zip}</Text>
      <Text>{props.organization.country}</Text>
    </Pressable>
  )
}

const TemplatesList = (props) => 
  <View style={tw`bg-gray-200 rounded p-2 mt-4`}>
    <View style={tw`mb-2`}>
      <Text style={tw`text-lg`}>Request Credentials</Text>
    </View>
    {props.templates.map((template) => 
    <View key={template.uuid} style={tw`flex flex-row justify-between items-center p-2 bg-gray-400 mt-2`}>
      <Text>{template.name}</Text>
      <View>
        <Pressable onPressIn={() => props.navigate(
              ROUTES.CredentialRequestRoute,
              {organization_uuid: props.organization_uuid, template_uuid: template.uuid}
            )}
            style={[ds.buttonTiny, ds.purpleButton, tw`w-20`]}>
          <Text style={ds.buttonTextSm}>Form</Text>
        </Pressable>
      </View>
    </View>)}
  </View>


const CredentialRow = ({credential, navigation}) =>
  <Pressable onPressIn={() => navigation.navigate(
      ROUTES.CredentialViewRoute,
      {credential_uuid: credential.uuid, from_org: true})} 
      style={tw`flex flex-row justify-between items-center p-2 bg-gray-400 mt-2`}>
    <Text>{credential.name}</Text>
    <View>
      <VCStateBadgeSm state={credential.state} />
    </View>
  </Pressable>

const VerifierRow = ({verifier, navigation}) =>
  <View style={tw`flex flex-row justify-between items-center p-2 bg-gray-400 mt-2`}>
    <Text>{verifier.name}</Text>
    <Pressable onPressIn={() => navigation.navigate(ROUTES.VerifierViewRoute,
          {verifier_uuid: verifier.uuid})} 
        style={[ds.buttonTiny, ds.purpleButton, tw`w-20`]}>
      <Text style={ds.buttonTextSm}>Verifier</Text>
    </Pressable>
  </View>
  

export default function OrganizationViewScreen(props) {
  const [organization, setOrganization] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const organization_uuid = props.route.params.organization_uuid;

  useEffect(() => {
    Organization.get(organization_uuid).then((organization) => {
      setOrganization(organization);
      setLoading(false);
    });
    Template.getOrgTemplates(organization_uuid).then((templates) => {
      setTemplates(templates);
    });
    Verifier.getByOrg(organization_uuid).then((verifiers) => {
      console.log('verifiers', verifiers);
      setVerifiers(verifiers);
    });
    const unsubscribe = props.navigation.addListener('focus', () => {
      console.log('[OrganizationViewScreen.focus]')
      Credential.getCredentialsByOrg(organization_uuid).then((credentials) => {
      setCredentials(credentials);
    });
    return unsubscribe;
  });
  }, []);

  if (loading)
    return <LoadingScreen />
  return (
    // show organization name, address, city, state, country, zip, phone, email, website
    <View style={ds.mainContainerPtGradient}>
      <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
        <Text style={ds.header}>Organization</Text>
        <OrganizationCard organization={organization} onPress={() => console.log('Pressed')} />
        {templates.length > 0 && <TemplatesList
            templates={templates}
            organization_uuid={organization_uuid}
            navigate={props.navigation.navigate} />}
        {verifiers.length > 0 && <View style={tw`bg-gray-200 rounded p-2 mt-4`}>
          <View style={tw`mb-2`}>
            <Text style={tw`text-lg`}>Verifiers</Text>
          </View>
          {verifiers.map((verifier) =>
            <VerifierRow key={verifier.uuid} verifier={verifier} navigation={props.navigation} />)}
        </View>}
        {credentials.length > 0 && <View style={tw`bg-gray-200 rounded p-2 mt-4`}>
          <View style={tw`mb-2`}>
            <Text style={tw`text-lg`}>Credentials</Text>
          </View>
          {credentials.map((credential) =>
            <CredentialRow key={credential.uuid} credential={credential} navigation={props.navigation} />)}
        </View>}
        <View style={tw`flex-grow-1`} />
      </ScrollView>
      <TopGradient />
      <BottomGradient />
      <View style={ds.buttonRow}>
        <GoBackButton onPressOut={() => props.navigation.navigate(ROUTES.OrganizationListRoute)} />
        <Pressable onPressIn={() => props.navigation.navigate(ROUTES.VerifierCreateRoute)} 
            style={[ds.buttonXs, ds.purpleButton]} >
          <Text style={ds.buttonTextSm}>Verifier TEST</Text>
        </Pressable>
      </View>
    </View>
  );
}