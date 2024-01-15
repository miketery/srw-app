import { Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { CommonActions } from '@react-navigation/native'

import FaIcon from 'react-native-vector-icons/FontAwesome'
import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { ROUTES } from '../../config'

import { ShortCode } from '../MainHubScreen'
import { Error, Info } from '../../components'
import { ContactIcon } from '../Contacts/ContactViewScreen'

import RecoverVaultUtil from '../../managers/RecoverVaultUtil'
import RecoverCombine, { CombineParty, CombinePartyState, RecoverCombineState } from '../../models/RecoverCombine'
import { StepsLine } from '../../components/StepLine'
import CtaButton from '../../components/CtaButton'
import { Success } from '../../components/Dialogue'


const RecoverCombineStateStyle: {[k in RecoverCombineState]: {label: string, text, bg}} = {
    [RecoverCombineState.START]: {
        label: 'Start',
        text: tw`text-slate-200`,
        bg: tw`bg-slate-600`,
    },
    [RecoverCombineState.MANIFEST_LOADED]: {
        label: 'Manifest Loaded',
        text: tw`text-purple-300`,
        bg: tw`bg-slate-600`,
    },
    [RecoverCombineState.SENDING_REQUESTS]: {
        label: 'Sending Requests',
        text: tw`text-orange-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverCombineState.WAITING_ON_PARTICIPANTS]: {
        label: 'Waiting on Participants',
        text: tw`text-yellow-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverCombineState.RECOVERING]: {
        label: 'Recovering',
        text: tw`text-cyan-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverCombineState.FINAL]: {
        label: 'Complete',
        text: tw`text-green-400`,
        bg: tw`bg-slate-600`,
    },
}
const CombinePartyStateStyle = {
    [CombinePartyState.START]: {
        label: 'Ready to Request',
        text: tw`text-blue-400`,
        bg: tw`bg-slate-600`,
    },
    [CombinePartyState.SENDING_REQUEST]: {
        label: 'Sending',
        text: tw`text-orange-400`,
        bg: tw`bg-slate-600`,
    },
    [CombinePartyState.PENDING]: {
        label: 'Pending',
        text: tw`text-yellow-400`,
        bg: tw`bg-slate-600`,
    },
    [CombinePartyState.ACCEPTED]: {
        label: 'Accepted',
        text: tw`text-green-400`,
        bg: tw`bg-slate-600`,
    },
    [CombinePartyState.DECLINED]: {
        label: 'Declined',
        text: tw`text-red-400`,
        bg: tw`bg-slate-600`,
    },
}

export const CombinePartyStatePill = ({state}: {state: CombinePartyState}) => {
    const viewStyle = [
        tw`px-2 rounded-full`,
        CombinePartyStateStyle[state].bg
    ]
    const textStyle = [
        tw`text-sm`,
        CombinePartyStateStyle[state].text
    ]
    return <View style={viewStyle}>
        <Text style={textStyle}>{CombinePartyStateStyle[state].label}</Text>
    </View>
}

const RecoverCombinePartyRow = ({party}: {party: CombineParty}) => {
    return <View style={tw`flex-row items-center justify-start pb-2 mb-2 border-b border-purple-200 border-dashed`}>
        <View style={tw`mr-2`}>
            <ContactIcon md={true} />
        </View>
        <View style={tw`flex-col`}>
            <Text style={tw`text-white`}>{party.name}</Text>
            <View style={tw`flex-row`}>
                <Text style={tw`text-white mr-1`}>
                    {party.numShares || '?'}
                </Text>
                <FaIcon name='ticket' size={16} color='white' style={tw`text-center`} />
            </View>
        </View>
        <View style={tw`grow-1`} />
        <CombinePartyStatePill state={party.state} />
    </View>
}

const RecoverCombineStatePill = ({state}: {state: RecoverCombineState}) => {
    const viewStyle = [
        tw`px-2 rounded-full`,
        RecoverCombineStateStyle[state].bg
    ]
    const textStyle = [
        tw`text-sm`,
        RecoverCombineStateStyle[state].text
    ]
    return <View style={viewStyle}>
        <Text style={textStyle}>{RecoverCombineStateStyle[state].label}</Text>
    </View>
}

const RecoverVaultStatus = ({recoverCombine, shortCode}: {recoverCombine: RecoverCombine, shortCode: string}) => {
    console.log('XXX', RecoverCombineState)
    return <View>
        <View style={tw`flex flex-row items-center justify-start my-2`}>
            <Text style={[ds.text, tw`mr-2`]}>Recovery Status</Text>
            <RecoverCombineStatePill state={recoverCombine.state} />
        </View>
        {recoverCombine.state === RecoverCombineState.START && <View style={tw`mb-2`}>
            <Text style={ds.text}>Get participant to share the manifest, provide one of your guardians the short code.</Text>
            <View style={tw`mt-2`}>
                <ShortCode shortCode={shortCode} />
            </View>
        </View>}
        {recoverCombine.state !== RecoverCombineState.START && <View>
            <Text style={tw`text-white text-2xl border-b border-purple-200 border-dashed mb-2 pb-2`}>
                Your Guardians ({recoverCombine.totalParties})
            </Text>
            {recoverCombine.combinePartys.map((party, i) => {
                return <RecoverCombinePartyRow key={i} party={party} />
            })}
        </View>}
    </View>
}

export default function RecoverVaultHubScreen({navigation, vault, manager, notifications}) {
    // fetch RecoverCombine
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [recoverCombine, setRecoverCombine] = useState(null)

    useEffect(() => {
        const fetchRecoverCombine = async () => {
            const data = manager.recoverCombine
            if(data)
                setRecoverCombine(data)
            setLoading(false)
        }
        fetchRecoverCombine()
    }, [notifications])

    const recoverVault = async () => {
        try {
            await RecoverVaultUtil.recoverVault(recoverCombine)
            navigation.dispatch(CommonActions.reset({
                routes: [{name: ROUTES.SplashRoute}]
            }))
        } catch(e) {
            console.log('[RecoverVaultHubScreen.recoverVault] error', e)
            setError(e.message)
        }
    }

    if(loading)
        return <View>
            <Text style={ds.textLg}>Loading...</Text>
        </View>

    return <View>
        <StepsLine 
            totalSteps={Object.values(RecoverCombineState).length} 
            currentStep={Object.values(RecoverCombineState).indexOf(recoverCombine.state) + 1} />
        {recoverCombine !== null && <RecoverVaultStatus recoverCombine={recoverCombine} shortCode={vault.short_code} />}
        {recoverCombine.state === RecoverCombineState.MANIFEST_LOADED && <View>
            <Pressable style={[ds.buttonSm, ds.purpleButton]} onPress={() => recoverCombine.fsm.send('SEND_REQUESTS')}>
                <Text style={ds.buttonTextSm}>Send Requests for Shares</Text>
            </Pressable>
        </View>}
        {recoverCombine.state === RecoverCombineState.FINAL && <View>
            <Success msg='Sufficient shares have been collected, and the vault has been reconstructed! You can now go to your recovered vault' />
            <CtaButton label='Go To Recovered Vault' onPressOut={() => recoverVault()} color='purple' />
        </View>}
        {error && <Error error={error} />}
    </View>
}