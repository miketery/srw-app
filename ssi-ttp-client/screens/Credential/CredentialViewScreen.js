import React, { useEffect, useState } from 'react'
import { Text, View, Pressable, ScrollView } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Icon from 'react-native-vector-icons/Ionicons'


import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { formatDate, myGoBack } from '../../lib/utils'

import { LoadingScreen, BottomGradient, TopGradient, GoBackButton } from '../../components'
import Credential, { CredentialState } from '../../classes/Credential'
import { VCstateBadge } from './Components'

const PrimaryFields = (props) => {
  const {name, type, state,
    issuer_name, issuer, holder_name, holder, 
    issue_date, not_before, not_after} = props.credential
  return <View>
    <View style={tw`flex flex-row justify-between items-center`}>
      <Text style={tw`text-2xl`}>{name}</Text>
      <VCstateBadge state={state} />
    </View>
    <View>
      <Text style={ds.labelVC}>Credential Type</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.valueVC}>{type}</Text>
      </View>
    </View>
    <View>
      <Text style={ds.labelVC}>Issuer</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.valueVC}>{issuer_name}</Text>
        <Text style={ds.monoKeyVC}>{issuer}</Text>
      </View>
    </View>
    <View>
      <Text  style={ds.labelVC}>Holder</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.value}>{holder_name}</Text>
        <Text style={ds.monoKeyVC}>{holder}</Text>
      </View>
    </View>
    <View>
      <Text  style={ds.labelVC}>Issued</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.valueVC}>{formatDate(issue_date)}</Text>
      </View>
    </View>
    {not_before != null && <View>
      <Text  style={ds.labelVC}>Valid From</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.valueVC}>{formatDate(not_before)}</Text>
      </View>
    </View>}
    {not_after != null && <View>
      <Text  style={ds.labelVC}>Expires</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.valueVC}>{formatDate(not_after)}</Text>
      </View>
    </View>}
  </View>
}

const TemplateFields = ({credential}) => {
  const { data, template } = credential
  return <View>
    {template.fields.map((field) => {
      return <View key={field.name}>
        <Text style={ds.labelVC}>{field.label}</Text>
        <View style={ds.staticBoxVC}>
          <Text style={ds.valueVC}>{data[field.name].toString()}</Text>
        </View>
      </View>
    }
    )}
  </View>
}

const UpdateCredentialState = (credential, state, navigation) => {
  Credential.UpdateState(credential.uuid, state)
    .then(() => { navigation.goBack(); })
    .catch((error) => {
      // TODO: alert of ERROR
      console.log(error);
    });
}



const CredentialViewScreen = (props) => {
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const credential_uuid = props.route.params.credential_uuid;
    Credential.get(credential_uuid, true)
      .then((credential) => {
        setCredential(credential);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (loading)
    return <LoadingScreen />
  return (
    <View style={ds.mainContainerPtGradient}>
      <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
        <View style={ds.formVC}>
          <PrimaryFields credential={credential} />
          <TemplateFields credential={credential} />
        </View>
      </ScrollView>
      <TopGradient />
      <BottomGradient />
      <View style={[ds.buttonRow]}>
        <GoBackButton onPressOut={() => myGoBack(props.navigation)} />
         {/* //props.navigation.goBack()} /> */}
        <View style={tw`flex-1`} />
        {('from_org' in props.route.params && props.route.params.from_org) ?
          <View style={tw`flex flex-row`}>
            {credential.state == CredentialState.PENDING && 
            <Pressable style={[ds.buttonXs, ds.redButton]}
              onLongPress={() => UpdateCredentialState(credential, CredentialState.REJECTED, props.navigation)}
              onPress={() => alert('Long press to Reject')}>
              <Text style={ds.buttonTextSm}>Reject</Text>
            </Pressable>}
            {(credential.state == CredentialState.PENDING || credential.state == CredentialState.REJECTED || credential.state == CredentialState.REVOKED) &&
            <Pressable style={[ds.buttonXs, ds.greenButton]}
              onLongPress={() => UpdateCredentialState(credential, CredentialState.ISSUED, props.navigation)}
              onPress={() => alert('Long press to Issue')}>
              <Text style={ds.buttonTextSm}>Issue</Text>
            </Pressable>}
            {credential.state == CredentialState.ISSUED &&
            <Pressable style={[ds.buttonXs, ds.redButton]}
              onLongPress={() => UpdateCredentialState(credential, CredentialState.REVOKED, props.navigation)}
              onPress={() => alert('Long press to Revoke')}>
              <Text style={ds.buttonTextSm}>Revoke</Text>
            </Pressable>}
          </View> : 
          <View>
            {credential.state == CredentialState.ISSUED &&
            <Pressable style={[ds.buttonXs, ds.purpleButton, tw`flex flex-row justify-around`]}
              onPress={() => Clipboard.setString(credential.uuid)}>
              <Text style={ds.buttonTextSm}>Verify</Text>
              <Icon name="copy-outline" size={20} color="white" />
            </Pressable>}
          </View>
          }
          
      </View>
    </View>
  );
};

export default CredentialViewScreen;