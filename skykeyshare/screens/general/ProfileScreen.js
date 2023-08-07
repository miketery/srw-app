import React from 'react'
import { Text, View, Pressable, ScrollView } from 'react-native'

import SI from '../../classes/SI'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'


const ProfileScreen = (props) => {
    const [name, setName] = React.useState(props.vault.my_name)
    const [email, setEmail] = React.useState(props.vault.email)

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}> 
        <Text style={ds.header}>Profile</Text>
        <View>
            <Text style={ds.label}>{name}</Text>
        </View>
        <View>
            <Text style={ds.label}>{email}</Text>
        </View>
        </ScrollView>
    </View>
}

export default ProfileScreen