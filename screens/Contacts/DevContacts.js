import { Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

export default function DevContacts(props) {
    const current_route = props.route.name
    return (
        <View style={ds.landingContainer}>

            <Text style={ds.header}>Dev Contacts</Text>
            <View>
                <Text style={ds.text}>Route: {current_route}</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>

            </View>
        </View>
    )
}