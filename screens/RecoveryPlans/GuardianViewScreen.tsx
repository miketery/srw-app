import { Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import GuardiansManager from '../../managers/GuardiansManager'
import { ROUTES } from '../../config'
import { GoBackButton, Info, MyTextInput, Warning } from '../../components'
import Guardian from '../../models/Guardian'
import DigitalAgentService from '../../services/DigitalAgentService'
import Vault from '../../models/Vault'
import base58 from 'bs58'
import { Success } from '../../components/Dialogue'


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
        // get use info using short code
        // send message
        setLoading(true)
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
            setNotFound(true)
        }
        setLoading(false)    
    }

    return <View>
        <Pressable style={[ds.buttonXs, ds.purpleButton]} onPressOut={() => setToggle(!toggle)}>
            <Text style={ds.textXs}>Share Manifest</Text>
        </Pressable>
        {toggle && <View style={[ds.card, tw`mt-2`]}>
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
                    <MyTextInput placeholder="a2c4e6" label={'Short Code'} value={shortCode} onChangeText={setShortCode} />
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



    if(loading)
        return <View>
            <Text style={ds.textLg}>Loading...</Text>
        </View>

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Guardian</Text>
            </View>
            {guardian === null ?
                <Text style={ds.text}>No guardian found...?</Text> :
                <View>
                    <GuardianInfo guardian={guardian} />
                    <ShareManifestForm guardian={guardian} vault={vault} />
                </View>
            }
        </ScrollView>
        <View style={ds.buttonRowB}>
            <GoBackButton onPressOut={() => navigation.goBack()} />
            <View style={tw`flex-grow`}></View>
            {/* <Pressable style={[ds.button, ds.blueButton]}
                    onPress={() => navigation.navigate('Delete...ROUTE', {recoveryPlanPk: recoveryPlan.pk})}>
                <Text style={ds.buttonText}>Delete?</Text>
            </Pressable> */}
        </View>
    </View>
}

export default GuardianViewScreen;