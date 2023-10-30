import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoveryPlan from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'

const RecoveryPlanRow = ({recoveryPlan: RecoveryPlan}) => {
    return <View>
        <Text>Test</Text>
    </View>
}

function RecoveryPlanList(props: {navigation: any, recoveryPlansManager: RecoveryPlansManager}) {
    const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[RecoverPlansListScreen.js] focus()')
            const contacts = props.recoveryPlansManager.getRecoveryPlansArray()
            setRecoveryPlans(recoveryPlans.sort((a, b) => a.name.localeCompare(b.name)))
        });

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
    </View>
}

export default RecoveryPlanList