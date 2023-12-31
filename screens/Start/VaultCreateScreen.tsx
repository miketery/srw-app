import React, { useState } from 'react'
import { Text, View, Image } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import ds from '../../assets/styles'
import { primary_route } from '../../config'
import tw from '../../lib/tailwind'

import { useSessionContext } from '../../contexts/SessionContext'
import VaultManager from '../../managers/VaultManager'

import { trimAndLower, validateEmail } from '../../lib/utils'
import { GoBackButton } from '../../components'
import StartContainer from '../../components/StartContainer'
import { AnimatedLabelInput } from '../../components/Input'
import CtaButton from '../../components/CtaButton'
import Vault from '../../models/Vault'

const inputContainer = tw`mb-6`

export default function VaultCreateScreen({navigation}: {navigation: any}): React.FC {
    const {setVault, setManager} = useSessionContext();

    const [name, setName] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [createLoading, setCreateLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{[k: string]: string}>({});

    const finishSubmit = (vault: Vault) => {
        console.log('[VaultCreateScreen.finishSubmit] ' + vault.pk)
        navigation.dispatch(CommonActions.reset(primary_route()))
    }
    const checkForm = () => {
        const errors: {[k: string]: string} = {}
        if (!name || trimAndLower(name) === '') {
            errors.name = 'Name is required'
        }
        if (!displayName || trimAndLower(displayName) === '') {
            errors.displayName = 'Display name is required'
        }
        if (!validateEmail(email)) {
            errors.email = 'Valid email is required'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }
    const handleSubmit = () => {
        console.log('[VaultCreateScreen.js] handleSubmit()')
        if(!checkForm()) {
            console.log('[VaultCreateScreen.js] checkForm() failed')
            return
        }
        setCreateLoading(true)
        setTimeout(async () => {
            try {
                const vaultManager = new VaultManager()
                const vault: Vault = await vaultManager.createVault(
                    name, email, displayName, '', '', true)
                await vaultManager.initManagers()
                setVault(vaultManager.currentVault)
                setManager(vaultManager)
                finishSubmit(vault)
            } catch (err) {
                console.log(err)
                setErrors({general: 'Something went wrong, unknown error.'})
                setCreateLoading(false)
            }
        }, 250);
    }

    return (
        <StartContainer>
            <View style={tw`flex-grow-1`} />
            {/* <Text style={ds.header}>Create Vault</Text> */}
            <View style={tw`flex-row justify-center mb-8`}>
                <Image source={require('../../assets/logo-hor-short.png')} style={{width: 250, height: 85}} />
            </View>
            <Text style={tw`text-2xl text-white text-center mb-12 font-bold`}>CREATE AN ACCOUNT</Text>
            <View style={inputContainer}>
                {/* <Text style={ds.label}>Name</Text> */}
                <AnimatedLabelInput
                    label="Name"
                    // placeholder="Alice Allison"
                    value={name}
                    onChangeText={setName}
                    error={'name' in errors}
                />
                {/* <FieldError name="name" errors={errors} /> */}
            </View>
            <View style={inputContainer}>
                {/* <Text style={ds.label}>Display Name</Text> */}
                <AnimatedLabelInput
                    label="Display Name"
                    // placeholder="Ali"
                    value={displayName}
                    onChangeText={setDisplayName}
                    error={'displayName' in errors}
                />
                {/* <FieldError name="displayName" errors={errors} /> */}
            </View>
            <View style={inputContainer}>
                {/* <Text style={ds.label}>Email</Text> */}
                <AnimatedLabelInput
                    label="Email"
                    // placeholder="alice@arxsky.com"
                    value={email}
                    onChangeText={setEmail}
                    error={'email' in errors}
                />
                {/* <FieldError name="email" errors={errors} /> */}
            </View>
            <View style={tw`h-1`} />
            <CtaButton onPressOut={() => !createLoading && handleSubmit()} label={createLoading ? 'Working...' : 'Create & Save'}/>
            <View style={tw`flex-grow-2`} />
            <View style={tw`flex-row justify-start`}>
                {!createLoading && 
                <GoBackButton onPressOut={() => navigation.goBack()} />}
            </View>
        </StartContainer>
    )
}