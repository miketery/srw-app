import { View, Text, Pressable, ScrollView } from 'react-native'

import { useSessionContext } from '../contexts/SessionContext'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { DEV, ROUTES } from '../config'
import { TopGradient } from '../components'

import RecoverVaultHub from './RecoverVault/RecoverVaultHub'

function MainHubScreen(props) {
    const {vault, manager} = useSessionContext()

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                {vault.recovery ? 
                <Text style={ds.header}>⚠️ Recovering Vault ⚠️</Text> :
                <Text style={ds.header}>{vault.name} — Main Hub</Text>}
            </View>
            <View style={tw`mb-10`}>
                <Text style={ds.textLg}>{vault.short_code}</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            { vault.recovery && 
            <RecoverVaultHub 
                vault={vault}
                manager={manager}
                navigation={props.navigation} />}
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}

                onPress={() => props.navigation.navigate(ROUTES.DevHasVaultRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
        </View>
    </View>
}

export default MainHubScreen