import React, { useEffect, useState } from 'react'
import { Pressable , Text, View } from 'react-native'

import IonIcon from 'react-native-vector-icons/Ionicons'
import FaIcon from 'react-native-vector-icons/FontAwesome'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton } from '../../components';

import RecoverSplit, { RecoverSplitParty, RecoverSplitState } from '../../models/RecoverSplit'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import MainContainer from '../../components/MainContainer';
import { ContactIcon } from '../Contacts/ContactViewScreen'


const RecoverSplitStateStyle = {
    [RecoverSplitState.START]: {
        label: 'Start',
        text: tw`text-slate-200`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.SPLITTING_KEY]: {
        label: 'Splitting Key',
        text: tw`text-purple-300`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.READY_TO_SEND_INVITES]: {
        label: 'Ready to Invite',
        text: tw`text-blue-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.SENDING_INVITES]: {
        label: 'Sending Invites',
        text: tw`text-orange-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.WAITING_ON_PARTICIPANTS]: {
        label: 'Responses Pending',
        text: tw`text-yellow-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.READY]: {
        label: 'Ready',
        text: tw`text-green-400`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.FINAL]: {
        label: 'Final',
        text: tw`text-green-600 font-bold`,
        bg: tw`bg-slate-600`,
    },
    [RecoverSplitState.ARCHIVED]: {
        label: 'Archived',
        text: tw`text-slate-300`,
        bg: tw`bg-slate-600`,
    }
}

const RecoverSplitStateText = (state: RecoverSplitState) => {
    const viewStyle = [
        tw`px-2 rounded-full`,
        RecoverSplitStateStyle[state].bg
    ]
    const textStyle = [
        tw`text-sm`,
        RecoverSplitStateStyle[state].text
    ]
    return <View style={viewStyle}>
        <Text style={textStyle}>{RecoverSplitStateStyle[state].label}</Text>
    </View>
}
const RecoverSplitBox = (threshold: number, shares: number) => {
    const style = tw`w-16 flex flex-col items-center justify-center px-1 py-1` //bg-slate-600 rounded-lg 
    const blockSize = shares < 5 ? tw`h-7 w-7` :
        shares < 10 ? tw`h-5 w-5` :
        shares < 17 ? tw`h-4 w-4` :
        shares < 26 ? tw`h-3 w-3` : null
    const rows = Math.ceil(Math.sqrt(shares))
    return <View style={style}>
        {Array.from(Array(rows).keys()).map((row) => {
            return <View key={row} style={tw`flex flex-row`}>
                {Array.from(Array(Math.ceil(Math.sqrt(shares))).keys()).map((col) => {
                    const index = row * rows + col
                    if (index >= shares) {
                        return null
                    }
                    return <View key={col} style={[blockSize, tw`rounded-full border`,
                        index < threshold ? tw`bg-purple-500 border-purple-700` : tw`bg-green-500 border-green-700`]} />
                })}
            </View>
        })}
    </View>
    // return <View style={viewStyle}>
    //     <Text style={textStyle}>{RecoverSplitStateStyle[state].label}</Text>
    // </View>
}

export const RecoverSplitRow = ({recoverSplit}: {recoverSplit: RecoverSplit}) => {
    const totalShares = recoverSplit.totalShares
    return <View style={tw`flex-row mb-2 items-center pb-2 border-b border-slate-400`}>
        <View style={tw`mr-2`}>
            {RecoverSplitBox(recoverSplit.threshold, totalShares)}
        </View>
        <View style={tw`flex flex-col items-start`}>
            <View>
                <Text style={ds.text}>{recoverSplit.name}</Text>
            </View>
            <View style={tw`mt-1`}>
                {RecoverSplitStateText(recoverSplit.state)}
            </View>
            <View style={tw`mt-1 flex-row items-start`}>
                <View style={tw`px-2 mr-2 flex-row`}>
                    <Text style={tw`text-white mr-1`}>
                        {recoverSplit.totalParties}
                    </Text>
                    <IonIcon name='person' size={16} color='white' style={tw`text-center`} />
                </View>
                <View style={tw`px-2 mr-2 flex-row`}>
                    <Text style={tw`text-white mr-1`}>
                        {recoverSplit.threshold}
                    </Text>
                    <IonIcon name='git-merge' size={16} color='white' style={tw`text-center`} />
                </View>
                <View style={tw`px-2 mr-2 flex-row`}>
                    <Text style={tw`text-white mr-1`}>
                        {totalShares}
                    </Text>
                    <FaIcon name='ticket' size={16} color='white' style={tw`text-center`} />
                </View>
            </View>
            {/* {RecoverSplitStateText(RecoverSplitState.START)}
            {RecoverSplitStateText(RecoverSplitState.SPLITTING_KEY)}
            {RecoverSplitStateText(RecoverSplitState.READY_TO_SEND_INVITES)}
            {RecoverSplitStateText(RecoverSplitState.SENDING_INVITES)}
            {RecoverSplitStateText(RecoverSplitState.WAITING_ON_PARTICIPANTS)}
            {RecoverSplitStateText(RecoverSplitState.READY)}
            {RecoverSplitStateText(RecoverSplitState.FINAL)}
            {RecoverSplitStateText(RecoverSplitState.ARCHIVED)} */}
        </View>
        {/* <View style={tw`flex-col`}>
            {recoverSplit.recoverSplitPartys.map((party, index) => {
                return <Text key={index} style={ds.text}>{party.name} {party.state}</Text>
            })}
        </View> */}
    </View>
}
const PartyRow: React.FC<{party: RecoverSplitParty}> = ({party}) => {
    return <View style={tw`flex-row items-center justify-start pb-2 mb-2 border-b border-purple-200 border-dashed`}>
        <View style={tw`mr-2`}>
            {ContactIcon()}
        </View>
        <View style={tw`flex-col`}>
            <Text style={tw`text-white`}>{party.name}</Text>
            <View style={tw`flex-row`}>
                <Text style={tw`text-white mr-1`}>
                    {party.numShares}
                </Text>
                <FaIcon name='ticket' size={16} color='white' style={tw`text-center`} />
            </View>
        </View>
        <View style={tw`grow-1`} />
        <Text style={ds.text}>{party.state}</Text>
    </View>
}


const RecoverSplitDetails: React.FC<{recoverSplit: RecoverSplit}> = ({recoverSplit}) => {
    return <View style={tw`flex-col`}>
        <RecoverSplitRow recoverSplit={recoverSplit} />
        <View style={tw`border-b border-slate-400 pb-2 mb-2`}>
            {/* <Text style={tw`text-white`}>{recoverSplit.totalParties} participants</Text> */}
            <Text style={tw`text-white`}>Threshold set to {recoverSplit.threshold} (i.e. shares needed to recover)</Text>
            <Text style={tw`text-white`}>Issued {recoverSplit.totalShares} total shares.</Text>
            <Text></Text>
        </View>
        <View style={tw`flex-col`}>
            <Text style={tw`text-white text-2xl border-b border-purple-200 border-dashed mb-2 pb-2`}>Participants ({recoverSplit.totalParties})</Text>
            {recoverSplit.recoverSplitPartys.map((party, index) => {
                return <PartyRow key={index} party={party} />
            })}
        </View>
    </View>
}


type RecoverSplitViewScreenProps = {
    navigation: any,
    route: {params: {recoverSplitPk: string}},
    recoverSplitsManager: RecoverSplitsManager,
}

const RecoverSplitViewScreen: React.FC<RecoverSplitViewScreenProps> = (props) => {
    const [recoverSplit, setRecoverSplit] = useState<RecoverSplit>(null)

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            const recoverSplitPk = props.route.params['recoverSplitPk']
            console.log('[RecoverSplitViewScreen] focus()', recoverSplitPk)
            const recoverSplit = props.recoverSplitsManager.getRecoverSplit(recoverSplitPk)
            setRecoverSplit(recoverSplit)
        });
        return unsubscribe;
    }, [])

    const header = 'Recovery Plan'
    const buttonRow = <>
        <GoBackButton onPressOut={() => props.navigation.goBack()} />
        <View style={tw`flex-grow`}></View>
        {/* <Pressable style={[ds.button, ds.blueButton]}
                onPress={() => props.navigation.navigate('RecoverSplitEdit', {recoverSplitPk: recoverSplit.pk})}>
            <Text style={ds.buttonText}>Edit</Text>
        </Pressable> */}
    </>
    return <MainContainer header={header} buttonRow={buttonRow} >
        <View>
            {recoverSplit && <RecoverSplitDetails recoverSplit={recoverSplit} />}
        </View>
    </MainContainer>
}

export default RecoverSplitViewScreen