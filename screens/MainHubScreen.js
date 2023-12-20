import { View, Text } from 'react-native'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { ROUTES } from '../config'

import { useSessionContext } from '../contexts/SessionContext'

import MainContainer from '../components/MainContainer'
import RecoverVaultHub from './RecoverVault/RecoverVaultHub'
import { DevButton } from '../components/Button'


function MainHubScreen(props) {
    const {vault, manager} = useSessionContext()

    const header = vault.recovery ? 
        '⚠️ Recovering Vault ⚠️' :
        `${vault.name} — Main Hub`

    const buttonRow = <>
        <DevButton onPressOut={() => props.navigation.navigate(ROUTES.DevHasVaultRoute)} />
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