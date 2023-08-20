// import * as React from 'react'
// import Clipboard from '@react-native-clipboard/clipboard'
// import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
// import { CommonActions } from '@react-navigation/native'
// import Icon from 'react-native-vector-icons/Ionicons'

// import tw from '../../lib/tailwind'
// import ds from '../../assets/styles'

// import { LoadingScreen, Card } from '../../components'
// import Organization from '../../classes/Organization'
// import { primary_route } from '../LandingScreen'

// const iconSize = 22

// export default class OrganizationDeleteScreen extends React.Component {
//     Organization_pk = ''
//     Organization = null
//     state = {
//         loading: true,
//     }
//     constructor(props) {
//         super(props)
//         this.Organization_pk = props.route.params.Organization_pk
//     }
//     componentDidMount() {
//         Organization.load(this.Organization_pk).then(Organization => {
//             this.Organization = Organization
//             this.setState({loading: false})
//         })
//     }
//     finishSubmit() {
//         console.log('[OrganizationDeleteScreen.finishSubmit] '+this.Organization.pk)
//         const resetAction = CommonActions.reset(primary_route([
//             {
//                 name: 'OrganizationsRoute',
//                 state: {
//                     routes: [
//                         {
//                             name: 'OrganizationListRoute',
//                         }
//                     ]
//                 }
//             }
//         ]))
//         this.props.navigation.dispatch(resetAction)    
//     }
//     handleDelete = () => {
//         console.log('[OrganizationDeleteScreen.handleDelete]')
//         this.Organization.delete(() => this.finishSubmit()) 
//     }
//     cancelDelete() {
//         this.props.navigation.goBack()
//     }
//     render() {
//         if(this.state.loading)
//             return <LoadingScreen />
//         const verify_key = this.Organization.verifyKeyBase58()
//         return <View style={ds.mainContainerPtGradient}>
//         <ScrollView style={ds.scrollViewGradient}>
//             <Text style={ds.header}>Delete Organization</Text>
//             <View style={tw`mb-2`}>
//                 <Text style={ds.text}>Are you sure you want to delete this Organization?</Text>
//             </View>
//             <Card label={this.Organization.name} icon='person'>
//                 {this.Organization.state === 0 && 
//                     <View style={ds.cardRowStyle}>
//                         <Text style={tw`text-yellow-300 italic`}>[Request Pending]</Text>
//                     </View>}
//                 <View style={ds.cardRowStyle}>
//                     <Text style={[ds.text, tw`mr-3`]}>
//                         <Icon name="key" size={iconSize} />
//                     </Text>
//                     <View>
//                         <Text style={[ds.text, tw`mb-1`]}>
//                         Public Identity Key (ed25519)
//                         </Text>
//                         <Pressable style={ds.blueCopyBox}
//                             onPress={() => Clipboard.setString(verify_key)}>
//                             <Text style={ds.keyStyle}>
//                                 {verify_key.slice(0, 22) +'\n'+verify_key.slice(22)}
//                             </Text>
//                             <Text style={[ds.keyStyle, tw`self-center pl-4`]}>
//                                 <Icon name='copy-outline' size={iconSize} />
//                             </Text>
//                         </Pressable> 
//                     </View>
//                 </View>
//             </Card>
//             <View style={ds.buttonRow}>
//                 <Pressable onPress={() => this.cancelDelete()}
//                         style={ds.button}>
//                     <Text style={ds.buttonText}>Cancel</Text>
//                 </Pressable>
//                 <Pressable onPress={() => this.handleDelete()}
//                         style={[ds.button, ds.redButton]}>
//                     <Text style={ds.buttonText}>Delete</Text>
//                 </Pressable>
//             </View>
//         </ScrollView>
//         </View>
//     }
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
// })
