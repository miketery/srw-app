import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton, MyTextInput, TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoveryPlan from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import { DEV, ROUTES } from '../../config';
import Contact from '../../models/Contact';
import { type } from 'os';

const ContactSelectList = ({contacts, selected, onPress}) => {
    return <View>
        {contacts.map((contact: Contact, index: number) => {
            return <Pressable key={index} onPress={() => onPress(contact)}>
                <Text>{contact.name}</Text>
            </Pressable>
        })}
    </View>
}

// name
// participants & threshold


type RecoveryPlanCreateScreenProps = {
    navigation: any,
    route: any,
    vault: Vault,
    recoveryPlansManager: RecoveryPlansManager
}
type ContactPk = string

const RecoveryPlanCreateScreen: React.FC<RecoveryPlanCreateScreenProps> = (props) => {
    const vault = props.vault
    const [step, setStep] = useState<number>(0)
    const [name, setName] = useState<string>('')
    const [participants, setParticipants] = useState<ContactPk[]>([])
    const [threshold, setThreshold] = useState<number>(2)

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Create Recovry</Text>
            </View>
            <MyTextInput
                label="Recover Plan Name"
                placeholder={'Alice\'s Recovery Plan'}
                value={name}
                onChangeText={setName}
            />
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}

export default RecoveryPlanCreateScreen;