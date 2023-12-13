import { View, Text, Pressable } from 'react-native'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { DEV, ROUTES } from '../config'

import { useSessionContext } from '../contexts/SessionContext'

import MainContainer from '../components/MainContainer'
import RecoverVaultHub from './RecoverVault/RecoverVaultHub'


function MainHubScreen(props) {
    const {vault, manager} = useSessionContext()

    const header = vault.recovery ? 
        '⚠️ Recovering Vault ⚠️' :
        `${vault.name} — Main Hub`

    const buttonRow = <>
        {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
            onPress={() => props.navigation.navigate(ROUTES.DevHasVaultRoute)}>
            <Text style={ds.buttonText}>Dev</Text>
        </Pressable>}
        <View style={tw`flex-grow-1`} />
    </>

    return <MainContainer color='blue' header={header} buttonRow={buttonRow}>
        <View style={tw`mb-10`}>
            <Text style={ds.textLg}>{vault.short_code || 'no short code...'}</Text>
        </View>
        <View style={tw`flex-grow-1`} />
        { vault.recovery && 
            <RecoverVaultHub 
                vault={vault}
                manager={manager}
                navigation={props.navigation}/>}
    </MainContainer>
}

export default MainHubScreen