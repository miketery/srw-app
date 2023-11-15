import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoveryPlan from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import { DEV, ROUTES } from '../../config';
import Guardian from '../../models/Guardian';
import GuardiansManager from '../../managers/GuardiansManager';

const RecoveryPlanRow = ({recoveryPlan}: {recoveryPlan: RecoveryPlan}) => {
    return <View style={[ds.row, tw`flex-col`]}>
        <Text style={ds.text}>{recoveryPlan.name}</Text>
        <Text style={ds.text}>{recoveryPlan.state}</Text>
        <View style={tw`flex-col`}>
            {recoveryPlan.recoveryPartys.map((party, index) => {
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

type RecoveryPlanListProps = {
    navigation: any,
    recoveryPlansManager: RecoveryPlansManager,
    guardiansManager: GuardiansManager,
}

const RecoveryPlanList: React.FC<RecoveryPlanListProps> = (props) => {
    const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([])
    const [guardians, setGuardians] = useState<Guardian[]>([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[RecoverPlansListScreen] focus()')
            const recoveryPlansData = props.recoveryPlansManager.getRecoveryPlansArray()
            setRecoveryPlans(recoveryPlansData.sort((a, b) => a.name.localeCompare(b.name)))
            const guardiansData = props.guardiansManager.getGuardianArray()
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
                {recoveryPlans.map((recoveryPlan, index) => {
                    return <Pressable key={index} onPress={() => 
                            props.navigation.navigate(
                                ROUTES.RecoveryPlanViewRoute,
                                {recoveryPlanPk: recoveryPlan.pk})}>
                        <RecoveryPlanRow recoveryPlan={recoveryPlan} />
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
                                {guardian: guardian.pk})}>
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
                onPressOut={() => props.navigation.navigate(ROUTES.RecoveryPlanCreateRoute)}>
                <Text style={ds.buttonText}>Create Recovery</Text>
            </Pressable>
        </View>
    </View>
}

export default RecoveryPlanList