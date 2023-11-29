import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoverSplit from '../../models/RecoverSplit'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import { DEV, ROUTES } from '../../config';
import Guardian from '../../models/Guardian';
import GuardiansManager from '../../managers/GuardiansManager';

const RecoverSplitRow = ({recoverSplit}: {recoverSplit: RecoverSplit}) => {
    return <View style={[ds.row, tw`flex-col`]}>
        <Text style={ds.text}>{recoverSplit.name}</Text>
        <Text style={ds.text}>{recoverSplit.state}</Text>
        <View style={tw`flex-col`}>
            {recoverSplit.recoverSplitPartys.map((party, index) => {
                return <Text key={index} style={ds.text}>{party.name} {party.state}</Text>
            })}
        </View>
    </View>
}
const GuardianRow = ({guardian}: {guardian: Guardian}) => {
    return <View style={[ds.row, tw`flex-col`]}>
        <Text style={ds.text}>{guardian.contact.name}</Text>
        <Text style={ds.text}>{guardian.state}</Text>
    </View>
}

type RecoverSplitListProps = {
    navigation: any,
    recoverSplitsManager: RecoverSplitsManager,
    guardiansManager: GuardiansManager,
}

const RecoverSplitList: React.FC<RecoverSplitListProps> = (props) => {
    const [recoverSplits, setRecoverSplits] = useState<RecoverSplit[]>([])
    const [guardians, setGuardians] = useState<Guardian[]>([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[RecoverPlansListScreen] focus()')
            const recoverSplitsData = props.recoverSplitsManager.getRecoverSplitsArray()
            setRecoverSplits(recoverSplitsData.sort((a, b) => a.name.localeCompare(b.name)))
            const guardiansData = props.guardiansManager.getGuardiansArray()
            setGuardians(guardiansData.sort((a, b) => a.name.localeCompare(b.name)))
        });
        return unsubscribe;
    }, [])

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Recovery Plans</Text>
            </View>
            <View>
                {recoverSplits.map((recoverSplit, index) => {
                    return <Pressable key={index} onPress={() => 
                            props.navigation.navigate(
                                ROUTES.RecoverSplitViewRoute,
                                {recoverSplitPk: recoverSplit.pk})}>
                        <RecoverSplitRow recoverSplit={recoverSplit} />
                    </Pressable>
                })}
            </View>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Your a Guardian for</Text>
            </View>
            <View>
                {guardians.map((guardian, index) => {
                    return <Pressable key={index} onPress={() =>
                        props.navigation.navigate(
                                ROUTES.GuardianViewRoute,
                                {guardianPk: guardian.pk})}>
                    <GuardianRow guardian={guardian} />
                </Pressable>
                })}
            </View>
        </ScrollView>
        <TopGradient />
        
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
                onPressOut={() => props.navigation.navigate(ROUTES.DevReocveryPlanRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
            <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPressOut={() => props.navigation.navigate(ROUTES.RecoverSplitCreateRoute)}>
                <Text style={ds.buttonText}>Create Recovery</Text>
            </Pressable>
        </View>
    </View>
}

export default RecoverSplitList