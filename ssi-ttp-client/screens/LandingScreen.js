import React from 'react'
import { StyleSheet, Text, View, Button, Pressable } from 'react-native'

import ds from '../assets/styles'
import { ROUTES } from '../config'
import tw from '../lib/tailwind'

export default class LandingScreen extends React.Component {
  render() {
    return (
      <View style={ds.landingContainer}>
        <Text style={ds.header}>Self-Sovereigne Identity Demo</Text>
        <View>
          <Text style={ds.text}>by ARX SKY</Text>
          {/* <Pressable style={[ds.button, ds.purpleButton]}
              onPress={() => this.props.navigation.navigate(ROUTES.PasskeyRoute)}>
            <Text style={ds.buttonText}>Passkey</Text>
          </Pressable> */}
          {/* <h1 style={tw`text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600`}>Arx Sky</h1> */}
        </View>
        <View style={tw`flex-grow-1`} />
        <View style={[ds.buttonRow, tw`justify-around mb-10`]}>
          <Pressable style={[ds.button, ds.greenButton]}
              onPress={() => this.props.navigation.navigate(ROUTES.RegisterRoute)}>
            <Text style={ds.buttonText}>Register</Text>
          </Pressable>
          <Pressable style={[ds.button, ds.lightblueButton]}
              onPress={() => this.props.navigation.navigate(ROUTES.LoginRoute)}>
            <Text style={ds.buttonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    )
  }
}