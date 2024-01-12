import { Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import GuardiansManager from '../../managers/GuardiansManager'
import { GoBackButton, Info, MyTextInput, Warning } from '../../components'
import Guardian, { GuardianState } from '../../models/Guardian';
import DigitalAgentService from '../../services/DigitalAgentService'
import Vault from '../../models/Vault'
import base58 from 'bs58'
import { LoadingScreen, Success } from '../../components/Dialogue'
import MainContainer from '../../components/MainContainer'
import { XTextInput } from '../../components/Input'


export const GuardianIcon = ({lg, md}: {lg?: boolean, md?: boolean}) => { // TODO_BADGE
    const style = [tw`bg-purple-900`, lg ? ds.lgCircle : md ? ds.mdCircle : ds.smCircle]
    const size = lg ? 44 : md ? 32 : 20
    return <View style={style}>
        <Icon name='shield' size={size} color='white' style={tw`text-center`} />
    </View>
}

export const GuardianStatePill = ({state}: {state: string}) => { // TODO
    const style = tw`text-sm mr-2 px-2 rounded-full bg-slate-600 `
    switch (state) {
        case GuardianState.INIT:
            return <Text style={[style, tw`text-slate-300`]}>Draft</Text>
        case GuardianState.SENDING_ACCEPT:
            return <Text style={[style, tw`text-yellow-400`]}>Sending Accept</Text>
        case GuardianState.SENDING_DECLINE:
            return <Text style={[style, tw`text-yellow-400`]}>Sending Decline</Text>
        case GuardianState.ACCEPTED:
            return <Text style={[style, tw`text-green-400`]}>Accepted</Text>
        case GuardianState.DECLINED:
            return <Text style={[style, tw`text-red-400`]}>Declined</Text>
        default:
            return null
    }
}

export const GuardianRow = ({guardian}: {guardian: Guardian}) => {
    const { contact, state } = guardian
    return <View style={tw`flex flex-row items-center py-2`}>
        <View style={tw`mr-2`}>
            <GuardianIcon md={true} />
        </View>
        <View style={tw`flex flex-row items-center justify-between grow-1`}>
            <Text style={ds.textLg}>{contact.name}</Text>
            <GuardianStatePill state={state} />
        </View>
    </View>
}

const GuardianInfo = ({guardian}: {guardian: Guardian}) => {
    return <View>
        <View style={[ds.row, tw`flex-col`]}>
            <Text style={ds.text}>{guardian.name}</Text>
            <Text style={ds.text}>{guardian.contact.name}</Text>
            <Text style={ds.text}>{guardian.state}</Text>
        </View>
    </View>
}

const ShareManifestForm = ({guardian, vault}: {guardian: Guardian, vault: Vault}) => {
    const [toggle, setToggle] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [shortCode, setShortCode] = useState('')
    const [complete, setComplete] = useState(false)

    useEffect(() => {
        console.log('[ShareManifestForm] useEffect()')
    }, [])

    const sendManifest = async () => {
        // get user info using short code
        // send message
        setLoading(true)
        setNotFound(false)
        try {
            const res = await DigitalAgentService.contactLookUp(vault, shortCode)
            if(res.error) {
                setError(res.error)
                setNotFound(false)
            }
            else if(res.found) {
                setNotFound(false)
                setError(null)
                const data = res.data as {did: string, verify_key: string, public_key: string}
                const msg = guardian.manifestMsg({
                    did: data.did,
                    verify_key: base58.decode(data.verify_key),
                    public_key: base58.decode(data.public_key)
                })
                const out = vault.sender(msg)
                if(out) {
                    setComplete(true)
                    setShortCode('')
                }
            } else {
                setError(null)
                setNotFound(true)
            }
        } catch (e) {
            console.log('[ContactAddScreen.handleLookup] error', e)
            setError('Unexpected error: ' + e.message)
        }
        setLoading(false)    
    }

    return <View>
        <Warning header='Danger Zone!' containerStyle={tw`bg-darkred border-red-400`}
            msg={'Do not share the manifest with anyone you do not trust. ' +
            'Confirm you are sending the Manifest to the intended person. ' +
            'Do this in person or use multiple channels. For example, if not in person, then use email and a phone call.'}
            />
        <Text style={ds.textSm}>
            If {guardian.contact.name} is trying to recover their vault, they will send you a short code to which you can share the manifest.
        </Text>
        <Pressable style={[ds.buttonSm, ds.blueButton, tw`self-center mt-2`]} onPressOut={() => setToggle(!toggle)}>
            <Text style={ds.textXs}>Share Manifest</Text>
        </Pressable>
        {toggle && <View style={[tw`mt-2`]}>
            {error && <Warning msg={error} />}
            {notFound && <Info header={'Not found'} msg={'Make sure the short code is correct'} />}
            {complete ? 
                <View>
                    <Success header={'Success'} msg={'Manifest sent!'} />
                    <Pressable style={[ds.button, tw`w-full`]}
                            onPress={() => setComplete(false)}>
                        <Text style={ds.buttonText}>Reset?</Text>
                    </Pressable>
                </View> :
                <View>
                    <XTextInput placeholder="a2c4e6" label={'Short Code'} value={shortCode} onChangeText={setShortCode} />
                    <Pressable style={[ds.button, !loading ? ds.blueButton : null, tw`w-full`]}
                            onPress={() => !loading && sendManifest()}>
                        <Text style={ds.buttonText}>{loading ? 'Loading...' : 'Send Manifest'}</Text>
                    </Pressable>
                </View>
            }
        </View>}
    </View>
}

type GuardianViewProps = {
    navigation: any,
    route: any,
    guardiansManager: GuardiansManager,
    vault: Vault,
}

const GuardianViewScreen: React.FC<GuardianViewProps> = 
        ({navigation, route, guardiansManager, vault}) => {
    // fetch RecoverCombine
    const [loading, setLoading] = useState(true)
    const [guardian, setGuardian] = useState<Guardian>(null)

    useEffect(() => {
        const pk = route.params.guardianPk

        const fetchGuardian = async () => {
            const data = guardiansManager.getGuardian(pk)
            setGuardian(data)
            setLoading(false)
        }
        fetchGuardian()
    }, [])

    const header = 'Guardian'
    const buttonRow = <>
        <GoBackButton onPressOut={() => navigation.goBack()} />
        <View style={tw`flex-grow`}></View>
        {/* <Pressable style={[ds.button, ds.blueButton]}
                onPress={() => navigation.navigate('Delete...ROUTE', {recoverSplitPk: recoverSplit.pk})}>
            <Text style={ds.buttonText}>Delete?</Text>
        </Pressable> */}
    </>
    if(loading)
        return <LoadingScreen />
    return <MainContainer header={header} buttonRow={buttonRow}>
        {guardian === null ?
            <Text style={ds.text}>No guardian found...?</Text> :
            <View>
                <GuardianRow guardian={guardian} />
                {guardian.state === GuardianState.ACCEPTED && 
                    <ShareManifestForm guardian={guardian} vault={vault} />}
            </View>
        }
    </MainContainer>
}

export default GuardianViewScreen;