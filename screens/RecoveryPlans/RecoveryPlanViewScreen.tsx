import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton, TopGradient } from '../../components';

import RecoveryPlan, { RecoveryParty } from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'


const PartyRow: React.FC<{party: RecoveryParty}> = ({party}) => {
    return <View style={[ds.row, tw`flex-col`]}>
        <Text style={ds.text}>{party.name}</Text>
        <Text style={ds.text}>{party.state}</Text>
        <Text style={ds.text}>{party.numShares}</Text>
    </View>
}


const RecoveryPlanDetails: React.FC<{recoveryPlan: RecoveryPlan}> = ({recoveryPlan}) => {
    return <View style={tw`flex-col`}>
        <Text style={ds.text}>{recoveryPlan.name}</Text>
        <Text style={ds.text}>{recoveryPlan.state}</Text>
        <View style={tw`flex-col`}>
            {recoveryPlan.recoveryPartys.map((party, index) => {
                return <PartyRow key={index} party={party} />
            })}
        </View>
    </View>
}


type RecoveryPlanViewProps = {
    navigation: any,
    route: {params: {recoveryPlanPk: string}},
    recoveryPlansManager: RecoveryPlansManager,
}

const RecoveryPlanView: React.FC<RecoveryPlanViewProps> = (props) => {
    const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan>(null)

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            const recoveryPlanPk = props.route.params['recoveryPlanPk']
            console.log('[RecoveryPlanViewScreen] focus()', recoveryPlanPk)
            const recoveryPlan = props.recoveryPlansManager.getRecoveryPlan(recoveryPlanPk)
            setRecoveryPlan(recoveryPlan)
        });
        return unsubscribe;
    }, [])

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Recovery Plan</Text>
            </View>
            <View>
                {recoveryPlan && <RecoveryPlanDetails recoveryPlan={recoveryPlan} />}
            </View>
        </ScrollView>
        <View style={ds.buttonRowB}>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
            <View style={tw`flex-grow`}></View>
            <Pressable style={[ds.button, ds.blueButton]}
                    onPress={() => props.navigation.navigate('RecoveryPlanEdit', {recoveryPlanPk: recoveryPlan.pk})}>
                <Text style={ds.buttonText}>Edit</Text>
            </Pressable>
        </View>
    </View>
}

export default RecoveryPlanView