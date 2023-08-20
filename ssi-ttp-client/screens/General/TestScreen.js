import axios from 'axios'
import { View, Text, Pressable } from 'react-native'

import ds from '../../assets/styles'
import { ENDPOINTS } from '../../config'
import tw from '../../lib/tailwind'

const TestScreen = (props) => {
  const getPermissions = async () => {
    axios.get(ENDPOINTS.permissions).then((response) => {
      console.log(response.data)
    }).catch((error) => {
      console.log(error)
    })
  }


  return (
    <View style={ds.mainContainerPt}>
      <Text style={ds.header}>Test Screen</Text>
      <View style={tw`flex-grow-1`} />
      <Pressable onPress={getPermissions}>
        <View  style={[ds.button, ds.blueButton]}>
          <Text style={ds.buttonText}>Get Permissions</Text>
        </View>
      </Pressable>
      <View style={tw`flex-grow-1`} />
    </View>
  )
}

export default TestScreen