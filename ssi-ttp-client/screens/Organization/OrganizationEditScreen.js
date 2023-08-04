// import * as React from 'react'
// import { Text, View, ScrollView, Pressable } from 'react-native'
// import { CommonActions } from '@react-navigation/native'

// import { GoBackButton, LoadingScreen } from '../../components'

// import Organization from '../../classes/Organization'
// import { OrganizationForm } from './components/OrganizationForm'

// import ds from '../../assets/styles'

// export default class OrganizationEditScreen extends React.Component {
//     organization_uuid = ''
//     organization = null
//     state = {
//         loading: true,
//     }
//     constructor(props) {
//         super(props)
//         this.organization_uuid = props.route.params.organization_uuid
//     }
//     getOrganization() {
//         Organization.get(this.organization_uuid).then((organization) => {
//             console.log(organization)
//             this.organization = organization
//             this.setState({loading: false})
//         })
//     }
//     componentDidMount() {
//         this.getOrganization()
//     }
//     handleNameChange = (data) => {
//         this.setState({name: data})
//     }
//     handleNotesChange = (data) => {
//         this.setState({notes: data})
//     }
//     finishSubmit() {
//         console.log('[OrganizationEditScreen.finishSubmit] '+this.Organization.pk)        
//         this.props.navigation.goBack()
//     }
//     handleSubmit = () => {
//         console.log('[OrganizationEditScreen.handleSubmit]')
//         this.Organization.update(this.state.name, this.state.notes)
//         this.Organization.save(() => this.finishSubmit()) 
//     }
//     toDeleteScreen = () => {
//         // this.props.navigation.navigate('OrganizationDeleteRoute', {Organization_pk: this.Organization.pk})
//     }
//     render() {
//         if(this.state.loading)
//             return <LoadingScreen />
//         return <View style={ds.mainContainerPtGradient}>
//         <ScrollView style={ds.scrollViewGradient}>
//         <Text style={ds.header}>Organization</Text>
//         <OrganizationForm state={this.state}
//             handleNameChange={this.handleNameChange}
//             handleNotesChange={this.handleNotesChange}
//             toDeleteScreen={this.toDeleteScreen}
//         />
//         </ScrollView>
//         <View style={ds.buttonRow}>
//             <GoBackButton onPressOut={() => this.props.navigation.goBack()} />
//             <Pressable onPressOut={() => this.handleSubmit()}
//                     style={[ds.button, ds.greenButton]}>
//                 <Text style={ds.buttonText}>Update</Text>
//             </Pressable>
//         </View>
//         </View>
//     }
// }

