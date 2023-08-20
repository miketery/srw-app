import { useState, useEffect } from 'react'
import { Text, View, Pressable } from 'react-native'

import { ROUTES } from '../../config'
import { LoadingScreen } from '../../components'
import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import Organization from '../../classes/Organization'

const OrganizationListScreen = (props) => {
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState([])
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      console.log('[OrganizationListScreen.focus]')
      getOrganizations()
    });
    return unsubscribe;
  }, []);
  const getOrganizations = () => {
    Organization.getAll()
      .then((organizations) => {
        setOrganizations(organizations)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  if (loading)
    return <LoadingScreen />
  return (
    <View style={ds.mainContainerPt}>
      <Text style={ds.header}>Organizations</Text>
      {organizations.map((organization, index) => (
        <Pressable key={index} onPress={() =>
            props.navigation.navigate(ROUTES.OrganizationViewRoute, {
              organization_uuid: organization['uuid'],
            })}>
          <View key={index} style={ds.row}>
            <Text style={ds.text}>{organization.name}</Text>
          </View>
        </Pressable>
      ))}
      <View style={tw`flex-grow-1`} />
      <View style={ds.buttonRow}>
        <View />
        <Pressable style={[ds.buttonXs, ds.purpleButton]} onPress={() => alert('Not implemented')}>
          <Text style={ds.buttonTextSm}>Create</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default OrganizationListScreen