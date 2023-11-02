import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { FieldError, GoBackButton, MyTextInput, TopGradient } from '../../components';

import Vault from '../../models/Vault'

import RecoveryPlan from '../../models/RecoveryPlan'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import { DEV, ROUTES } from '../../config';
import Contact from '../../models/Contact';
import { type } from 'os';

type ContactPk = string


// name
// participants & threshold


type RecoveryPlanCreateScreenProps = {
    navigation: any,
    route: any,
    vault: Vault,
    recoveryPlansManager: RecoveryPlansManager
}

// 
enum Steps {
    CHOOSE_PARTICIPANTS = 0,
    CHOOSE_THRESHOLD = 1,
    REVIEW = 2,
    // CREATE
}
const StepNumber: {[k: number]: Steps} = Object.fromEntries(
    Object.keys(Steps).map((k) => [Steps[k], k])
) // i.e. 0: 'CHOOSE_PARTICIPANTS'...

const stepChecks: {[k in Steps]: ({}: any) => boolean} = {
    [Steps.CHOOSE_PARTICIPANTS]: ({participants, setError}) => {
        if(participants.length < 2) {
            setError('Select at least 2 participants')
            return false
        }
        return true
    },
    [Steps.CHOOSE_THRESHOLD]: ({threshold, participants, setError}) => {
        if(threshold < 2) {
            setError('Threshold must be at least 2')
            return false
        } else if (threshold > participants.length) {
            setError(`Threshold must be at most ${participants.length} (total participants)`)
            return false
        }
        return true
    },
    [Steps.REVIEW]: ({}) => {
        return true
    },
}

const StepControls = ({setStep, step, nextStep, prevStep}: {setStep: (step: number) => void, step: number, nextStep: () => void, prevStep: () => void}) => {
    return <View style={tw`flex flex-row justify-between items-center flex-grow`}>
        <Pressable style={tw`rounded-md border border-gray-700 p-2 m-2`} onPress={prevStep}>
            <Icon name='arrow-back' style={ds.text} size={20} />
        </Pressable>
        <Text style={ds.textLg}>{StepNumber[step]} {step}</Text>
        <Pressable style={tw`rounded-md border border-gray-700 p-2 m-2`} onPress={nextStep}>
            <Icon name='arrow-forward' style={ds.text} size={20} />
        </Pressable>
    </View>
}


const ContactSelectList = ({step, contacts, selected, onPress}: {step: Steps, contacts: Contact[], selected: ContactPk[], onPress: (pk: ContactPk) => void}) => {
    const currentStep = step === Steps.CHOOSE_PARTICIPANTS
    return <View>
        <Text style={ds.textLg}>Selected {selected.length} guardians.</Text>
            {contacts
                .filter(c => currentStep || selected.includes(c.pk)) // if not current step then only show selected
                .map((contact: Contact, index: number) => {
                const isSelected = selected.includes(contact.pk)
                return <Pressable key={index} 
                        style={[tw`p-2 my-2 rounded-md flex flex-row items-center`, isSelected ? (currentStep ? tw`bg-green-700` : tw`bg-green-900`): tw`bg-gray-700 text-red-500`]}
                        onPress={() => currentStep && onPress(contact.pk)}>
                    <View style={tw`mr-2`}>
                        <Icon name='person' style={isSelected ? tw`text-yellow-300` :  ds.text} size={20} />
                    </View>
                    <Text style={ds.textLg}>{contact.name}</Text>
                </Pressable>
            })}
    </View>
}

const ThresholdInput = ({step, selected, threshold, setThreshold}: 
    {step: Steps, selected: ContactPk[], threshold: number, setThreshold: (threshold: number) => void}) => {
    if(step < Steps.CHOOSE_THRESHOLD) return null
    const canGoUp = threshold < selected.length
    const canGoDown = threshold > 2
    return <View>
        <Text style={ds.textLg}>Threshold: {threshold}</Text>
        <View style={tw`flex flex-row`}>
            <Pressable style={[tw`rounded-md border border-gray-700 p-2 m-2`,
                        canGoUp ? tw`bg-slate-500` : tw`bg-slate-800`]}
                    onPress={() => canGoUp && setThreshold(threshold + 1)}>
                <Icon name='add' style={ds.text} size={20} />
            </Pressable>
            <Pressable style={[tw`rounded-md border border-gray-700 p-2 m-2`,
                        canGoDown ? tw`bg-slate-500` : tw`bg-slate-800`]}
                    onPress={() => canGoDown && setThreshold(threshold - 1)}>
                <Icon name='remove' style={ds.text} size={20} />
            </Pressable>
        </View>
        <View>
            <Text style={ds.text}>Select number of participanting guardians required to recover (minimum 2, maximum {selected.length})</Text>
        </View>
    </View>
}

const RecoveryPlanCreateScreen: React.FC<RecoveryPlanCreateScreenProps> = (props) => {
    const vault = props.vault
    const [step, setStep] = useState<number>(0)
    const [name, setName] = useState<string>('')
    const [participants, setParticipants] = useState<ContactPk[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [threshold, setThreshold] = useState<number>(2)

    const [error, setError] = useState<string>('')

    // useEffect(() => {
    //     if (DEV) console.log('RecoveryPlanCreateScreen: useEffect: step:', step)
    // }, [step])

    useEffect(() => {
        const contacts = props.recoveryPlansManager.contactsManager.getContactsArray()
        console.log(contacts)
        setContacts(contacts)
    }, [])
    const nextStep = () => {
        if (stepChecks[step]({participants, threshold, setError})) {
            setStep(step + 1)
            setError('')
        }
    }
    const prevStep = () => {
        if(step === 0)
            return props.navigation.goBack()
        setStep(step - 1)
    }

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
            <ContactSelectList step={step} contacts={contacts} selected={participants} onPress={(pk: ContactPk) => {
                if (participants.includes(pk)) {
                    setParticipants(participants.filter((p: ContactPk) => p !== pk))
                } else {
                    setParticipants([...participants, pk])
                }
            }} />
            <ThresholdInput step={step} selected={participants} threshold={threshold} setThreshold={setThreshold} />
            {error && <View style={tw`my-1`}>
                <Text style={tw`text-yellow-300 text-base`}>
                    {error}
                </Text>
            </View>}
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={[ds.buttonRowB, tw`w-full`]}>
            {/* <GoBackButton onPressOut={() => props.navigation.goBack()} /> */}
            <StepControls setStep={setStep} step={step} nextStep={nextStep} prevStep={prevStep} />
        </View>
    </View>
}

export default RecoveryPlanCreateScreen;