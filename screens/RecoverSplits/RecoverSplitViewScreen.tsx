import React, { useEffect, useState } from 'react'
import { Pressable , Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton } from '../../components';

import RecoverSplit, { RecoverSplitParty } from '../../models/RecoverSplit'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import MainContainer from '../../components/MainContainer';


const PartyRow: React.FC<{party: RecoverSplitParty}> = ({party}) => {
    return <View style={[ds.row, tw`flex-col`]}>
        <Text style={ds.text}>{party.name}</Text>
        <Text style={ds.text}>{party.state}</Text>
        <Text style={ds.text}>{party.numShares}</Text>
    </View>
}


const RecoverSplitDetails: React.FC<{recoverSplit: RecoverSplit}> = ({recoverSplit}) => {
    return <View style={tw`flex-col`}>
        <Text style={ds.text}>{recoverSplit.name}</Text>
        <Text style={ds.text}>{recoverSplit.state}</Text>
        <View style={tw`flex-col`}>
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
        <Pressable style={[ds.button, ds.blueButton]}
                onPress={() => props.navigation.navigate('RecoverSplitEdit', {recoverSplitPk: recoverSplit.pk})}>
            <Text style={ds.buttonText}>Edit</Text>
        </Pressable>
    </>
    return <MainContainer header={header} buttonRow={buttonRow} >
        <View>
            {recoverSplit && <RecoverSplitDetails recoverSplit={recoverSplit} />}
        </View>
    </MainContainer>
}

export default RecoverSplitViewScreen