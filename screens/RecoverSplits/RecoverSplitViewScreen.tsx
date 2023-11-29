import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton, TopGradient } from '../../components';

import RecoverSplit, { RecoverSplitParty } from '../../models/RecoverSplit'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'


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

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Recovery Plan</Text>
            </View>
            <View>
                {recoverSplit && <RecoverSplitDetails recoverSplit={recoverSplit} />}
            </View>
        </ScrollView>
        <View style={ds.buttonRowB}>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
            <View style={tw`flex-grow`}></View>
            <Pressable style={[ds.button, ds.blueButton]}
                    onPress={() => props.navigation.navigate('RecoverSplitEdit', {recoverSplitPk: recoverSplit.pk})}>
                <Text style={ds.buttonText}>Edit</Text>
            </Pressable>
        </View>
    </View>
}

export default RecoverSplitViewScreen