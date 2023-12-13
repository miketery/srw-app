import { Text, View, Pressable } from 'react-native'
import { useEffect, useState } from 'react'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import DAS from '../../services/DigitalAgentService'
import { useSessionContext } from '../../contexts/SessionContext'

import { GoBackButton } from '../../components'
import getTestVaultsAndContacts from '../../testdata/genData'
import MainContainer from '../../components/MainContainer'

function registerVault(vault) {
    console.log('registerVault')
    DAS.registerVault(vault)
}
async function amIRegistered(vault, setRegisteration) {
    console.log('amIRegistered')
    const data = await DAS.amIRegistered(vault)
    if(!data)
        return setRegisteration({registered: false})
    setRegisteration({registered: true, ...data})
}
async function sendMessage() {
    console.log('sendMessage')
    const vm = Cache.vaultManager
    // const cm = vm.contactsManager
    // const bob = cm.getContactByDid('Bob')
    // const vault = vm.currentVault
    // const msg = Message.forContact(vault, )
    // DAS.sendMessage(vault)
    const [vaults, contacts] = await getTestVaultsAndContacts()
    console.log(vaults)
    console.log(contacts)
}


export default function DevDigitalAgentScreen(props) {
    const {vault} = useSessionContext()
    const [registration, setRegistration] = useState({registered: null})

    useEffect(() => {
        console.log('[DevDigitalAgentScreen] useEffect')
        amIRegistered(vault, setRegistration)
        return () => {
            console.log('[DevDigitalAgentScreen] cleanup')
        }
    }, [])
    const header = 'Dev Digital Agent Test'
    const buttonRow = <>
        <GoBackButton onPressOut={() => props.navigation.goBack()} />
    </>
    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
        onPress={() => registerVault(vault)}>
            <Text style={ds.buttonText}>Register Vault</Text>
        </Pressable>
        <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
        onPress={() => amIRegistered(vault, setRegistration)}>
            <Text style={ds.buttonText}>Am I Registered</Text>
        </Pressable>
        <View>
            <Text style={ds.textXl}>Registeration:</Text>
            {registration.registered === null ? <Text style={ds.textXl}>Not Checked</Text> : <View>
                <Text style={ds.textXl}>{registration.name}</Text>
                <Text style={ds.textXl}>{registration.short_code}</Text>
                <Text style={ds.textXl}>{registration.email}</Text>
                <Text style={ds.textXs}>{registration.did}</Text>
            </View>}
            {/* <Text style={ds.textXl}>{registration.did}</Text> */}
        </View>
    </MainContainer>
}