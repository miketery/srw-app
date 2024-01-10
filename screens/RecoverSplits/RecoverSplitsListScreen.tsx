import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import RecoverSplit from '../../models/RecoverSplit'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import { ROUTES } from '../../config';
import Guardian from '../../models/Guardian';
import GuardiansManager from '../../managers/GuardiansManager';
import MainContainer from '../../components/MainContainer';

import { RecoverSplitRow } from './RecoverSplitViewScreen'
import { DevButton } from '../../components/Button'
import { GuardianRow } from './GuardianViewScreen'


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

    const header = 'Recovery Plans'
    const buttonRow = <>
        <DevButton onPressOut={() => props.navigation.navigate(ROUTES.DevRecoverSplitsRoute)} />
        <View style={tw`flex-grow-1`} />
        <Pressable style={[ds.button, ds.greenButton, tw`flex-grow-1`]}
            onPressOut={() => props.navigation.navigate(ROUTES.RecoverSplitCreateRoute)}>
            <Text style={ds.buttonText}>Create Recovery</Text>
        </Pressable>
    </>

    return <MainContainer header={header} buttonRow={buttonRow}>
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
            <Text style={ds.header}>You are a Guardian for</Text>
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
    </MainContainer>
}

export default RecoverSplitList