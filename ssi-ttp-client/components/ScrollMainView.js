// TODO doesn't work yet
// higher order component to wrap main screens of the app
import React from 'react'
import { View, Text } from 'react-native'


import { LoadingScreen, ErrorScreen } from './'
import ds from '../assets/styles'
import tw from '../lib/tailwind'

export default class ScrollMainView extends React.Component {
  render() {
    // if(this.props.loading)
    //   return LoadingScreen
    // if(this.props.error)
    //   return ErrorScreen
    return (
      <View style={ds.mainContainerPtGradient} showsVerticalScrollIndicator={false}>
        <ScrollView style={ds.scrollViewGradient}>
          <Text style={ds.header}>{this.props.title}</Text>
          {this.props.children}
        </ScrollView>
      </View>
    );
  }
}