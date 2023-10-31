import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoveryPlan from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import { DEV, ROUTES } from '../../config';

const RecoveryPlanRow = ({recoveryPlan: RecoveryPlan}) => {
    return <View>
        <Text>Test</Text>
    </View>
}

type RecoveryPlanListProps = {
    navigation: any,
    recoveryPlansManager: RecoveryPlansManager
}

const RecoveryPlanList: React.FC<RecoveryPlanListProps> = (props) => {
    const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[RecoverPlansListScreen.js] focus()')
            const plans = props.recoveryPlansManager.getRecoveryPlansArray()
            setRecoveryPlans(plans.sort((a, b) => a.name.localeCompare(b.name)))
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
                    return <Pressable key={index} onPress={() => props.navigation.navigate('RecoveryPlan', {recoveryPlan: recoveryPlan})}>
                        <RecoveryPlanRow recoveryPlan={recoveryPlan} />
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