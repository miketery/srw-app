import { useState } from 'react'
import { Text, View, Pressable, ScrollView, TextInput } from 'react-native'

import ds from '../assets/styles'
import { DEV, ROUTES, primary_route } from '../config'
import tw from '../lib/tailwind'

import VaultManager from '../classes/VaultManager'

import { trimAndLower, validateEmail } from '../lib/utils'
import { FieldError } from '../components/'

export default function VaultCreateScreen(props) {
    const [name, setName] = useState(DEV ? 'Alice Allison' : '');
    const [displayName, setDisplayName] = useState(DEV ? 'Ali' : '');
    const [email, setEmail] = useState(DEV ? 'alice@arxsky.com' : '');
    const [createLoading, setCreateLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigation = props.navigation

    const finishSubmit = (vault) => {
        console.log('[VaultCreateScreen.finishSubmit] ' + vault.getPk())
        Cache.setVaultPk(vault.getPk())
        navigation.dispatch(CommonActions.reset(primary_route()))
    }
    const checkForm = () => {
        const errors = {}
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
                const vault = await VaultManager.create_vault(name, displayName, email)
                VaultManager.init_managers()
                finishSubmit(vault)
            } catch (err) {
                console.log(err)
                setErrors({general: 'Something went wrong, unknown error.'})
                setCreateLoading(false)
            }
        }, 250);
    }

    return (
        <View style={[ds.mainContainerPtNoNav]}>
            <ScrollView>
                <Text style={ds.header}>Create Vault</Text>
                <View style={ds.inputContainer}>
                    <Text style={ds.label}>Name</Text>
                    <TextInput
                        style={ds.input}
                        placeholder="Alice Allison"
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                    />
                    <FieldError name="displayName" errors={errors} />
                </View>
                <View style={ds.inputContainer}>
                    <Text style={ds.label}>Display Name</Text>
                    <TextInput
                        style={ds.input}
                        placeholder="Ali"
                        placeholderTextColor="#888"
                        value={displayName}
                        onChangeText={setDisplayName}
                    />
                    <FieldError name="displayName" errors={errors} />
                </View>
                <View style={ds.inputContainer}>
                    <Text style={ds.label}>Email</Text>
                    <TextInput
                        style={ds.input}
                        placeholder="alice@arxsky.com"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <FieldError name="email" errors={errors} />
                </View>
            </ScrollView>
            <View style={tw`flex-grow-1`} />
            <Pressable style={ds.createButton}
                onPress={() => handleSubmit()}>
                <Text style={ds.textXl}>Create & Save</Text>
            </Pressable>
            <View style={tw`flex-grow-1`} />
        </View>
    )
}