// import React from 'react'
// import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'
// import { CommonActions, StackActions } from '@react-navigation/native'
// import Icon from 'react-native-vector-icons/Ionicons'

// import tw from '../../lib/tailwind'
// import ds from '../../assets/styles'

// // import Organization from '../../classes/Organization'
// import { Card, FieldError, Info, Loading, LoadingScreen, Warning } from '../../components'

// import axios from 'axios'

// const keyStyle = tw`text-blue-300 font-mono text-lg`

// // function OrganizationCard(props) {
// //     const c = props.Organization
// //     return <Card label={c.name} icon='person'>
// //         <View style={tw`flex flex-row items-start`}>
// //             <Text style={[ds.text, tw`mr-3`]}>
// //                 <Icon name="key" size={22} />
// //             </Text>
// //             <View>
// //                 <Text style={[ds.text, tw`mb-1`]}>
// //                 Public Identity Key (ed25519)
// //                 </Text>
// //                 <Pressable style={tw`flex flex-row justify-between`}
// //                 onPress={() => Clipboard.setString(c.verify_key)}>
// //                     <Text style={keyStyle}>
// //                         {c.verify_key.slice(0, 22) +'\n'+c.verify_key.slice(22)}
// //                     </Text>
// //                     <Text style={[keyStyle, tw`self-center pl-4`]}>
// //                         <Icon name='copy-outline' size={22} />
// //                     </Text>
// //                 </Pressable>
// //             </View>
// //         </View>
// //         {c.pk_if_exists ? <View>
// //             <Info t='Already have this Organization' />
// //             <View style={tw`flex-row justify-center my-2`}>
// //                 <Pressable style={[ds.button, ds.blueButton]} onPressOut={() => props.viewOrganization(c.pk_if_exists)}>
// //                     <Text style={ds.buttonText}>View Organization</Text>
// //                 </Pressable>
// //             </View>
// //         </View> :
// //         <View>
// //             <Info t={'Check with your Organization that the above Public Identity Key is theirs.'} />
// //             <View style={tw`flex-row justify-center my-2`}>
// //                 <Pressable style={[ds.button, ds.greenButton]} onPressOut={props.sendInvite}>
// //                     <Text style={ds.buttonText}>Send Invite</Text>
// //                 </Pressable>
// //             </View>
// //         </View>
// //         }
// //     </Card>
// // }

// export default class OrganizationCreateScreen extends React.Component {
//     Organization = null
//     state = {
//         loading: true,
//         errors: {},
//     }
//     constructor(props) {
//         super(props)
//         // this.vault_pk = props.vault_pk ? props.vault_pk : props.route.params.vault_pk
//     }
//     componentDidMount() {
//         this.setup()
//     }
//     render() {
//         if(this.state.loading)
//             return <LoadingScreen />
//         return <View style={ds.mainContainerPt}>
//             <Text style={ds.header}>Organization</Text>
//             <View style={{}}>
//                 <Text style={ds.label}>Short Code</Text>
//                 <TextInput style={[ds.input, tw`text-center text-3xl font-mono text-blue-300`]}
//                     onChangeText={this.handleCodeChange}
//                     value={this.state.code} />
//                 <FieldError name='general' errors={this.state.errors} />
//             </View>
//             <View style={tw`flex-col grow`}>
//                 {this.state.fetching ? <View style={tw`my-5`}><Loading /></View> : 
//                 this.state.not_found ? <Text style={tw`my-2 text-yellow-300`}>No Organization found, or server error.</Text> :
//                 this.Organization ? <OrganizationCard
//                     Organization={this.state.Organization}
//                     sendInvite={this.sendInvite}
//                     viewOrganization={this.viewOrganization} /> : null}
//             </View>
//             <View style={ds.buttonRow}>
//                 <View />
//                 <Pressable onPressOut={() => this.handleLookup()}
//                         style={[ds.button, ds.blueButton]}>
//                     <Text style={ds.buttonText}>Lookup</Text>
//                 </Pressable>
//             </View>
//         </View>
//     }
// }


