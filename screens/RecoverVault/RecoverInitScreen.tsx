import { Text, View, Pressable } from 'react-native'
import React, { useState } from 'react'
import { CommonActions } from '@react-navigation/native'
import { ROUTES } from '../../config'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton } from '../../components'
import RecoverVaultUtil from '../../managers/RecoverVaultUtil'
import VaultManager from '../../managers/VaultManager'

export default function RecoverInitScreen({navigation}) {
    const [loading, setLoading] = useState(false)

    const vaulRecoverInit = async () => {
        setLoading(true)
        console.log('[RecoverInitScreen.vaulRecoverInit]')
        const { vault, recoverCombine } = await RecoverVaultUtil.init()
        vault.save()
        const vaultManager = new VaultManager()
        await vaultManager.init()
        const splash = {
            routes: [
                {
                    name: ROUTES.SplashRoute,
                },
            ]
        }
        navigation.dispatch(CommonActions.reset(splash))
    }

    return (
        <View style={ds.landingContainer}>
            <Text style={ds.header}>Recover Your Vault</Text>
            <View style={tw`flex-grow-1 justify-center items-center`}>
                <Text style={ds.textXl}>Do you want to proceed?</Text>
                <Pressable style={[ds.button, ds.greenButton, tw`mt-4 w-full`]}
                        onPress={() => !loading && vaulRecoverInit()}>
                    {loading ?
                    <Text style={ds.buttonText}>Loading...</Text> :
                    <Text style={ds.buttonText}>Yes! Start Recovery Process</Text>}
                </Pressable>
            </View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </View>
    )
}