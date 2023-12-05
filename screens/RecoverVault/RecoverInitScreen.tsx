import { Text, View, Pressable } from 'react-native'
import React, { useState } from 'react'
import { CommonActions } from '@react-navigation/native'
import { ROUTES } from '../../config'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { GoBackButton } from '../../components'
import CtaButton from '../../components/CtaButton'
import RecoverVaultUtil from '../../managers/RecoverVaultUtil'
import VaultManager from '../../managers/VaultManager'
import StartContainer from '../Start/StartContainer'

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
        <StartContainer header={'Recover Your Vault'} imageStyle={null}>
            <View style={tw`flex-grow-1 justify-center items-center`}>
                <View style={tw`mb-4`}>
                    <Text style={ds.textXl}>Do you want to proceed?</Text>
                </View>
                <CtaButton onPressOut={() => !loading && vaulRecoverInit()}
                    label={loading ? 'Loading...' : 'Yes! Start Recovery Process'} color={'green'} />
            </View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </StartContainer>
    )
}