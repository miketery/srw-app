import React from 'react'
import { Text, View, Pressable } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import SessionManager from '../../classes/SessionManager'
import { LoadingScreen } from '../../components'

export default class ProfileScreen extends React.Component {
  state = {
    user: {},
    loading: true,
  }
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.setState({user: SessionManager.getUser()}, () => this.setState({loading: false}))
  }
  logout = () => {
    SessionManager.logout()
    this.props.navigation.navigate('LandingRoute')
  }
  render() {
    if (this.state.loading)
      <LoadingScreen />
    return (
      <View style={ds.mainContainerPt}>
        <Text style={ds.header}>Profile</Text>
        <View style={tw`bg-gray-200 p-2`}>
          <Text style={tw`text-lg`}>{this.state.user.name}</Text>
          <Text style={tw`text-lg`}>{this.state.user.email}</Text>
          <Text>{this.state.user.uuid}</Text>
          {/* <Text>{this.state.user.created}</Text> */}
        </View>
        <View style={tw`flex-grow-1`} />
        <View style={tw`flex flex-row justify-center`}>
          <Pressable style={ds.buttonXs} onPress={this.logout}>
            <Text style={ds.buttonTextSm}>Logout</Text>
          </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
      </View>
    )
  }
}