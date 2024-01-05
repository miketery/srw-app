import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Secret from "../../models/Secret";
import SecretsManager from "../../managers/SecretsManager";
import SecretForm from './SecretForm';
import { LoadingScreen, Warning } from '../../components';
import MainContainer from '../../components/MainContainer';
import { SecretRow } from './SecretViewScreen';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { CommonActions } from '@react-navigation/native';
import { ROUTES } from '../../config';

type SecretEditScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
    route: {
        params: {
            secretPk: string,
        }
    }
}

const SecretEditScreen: React.FC<SecretEditScreenProps> = (props) => {
    // props get secretPk from nav
    const [secret, setSecret] = useState<Secret>(null)
    // const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleteToggle, setDeleteToggle] = useState(false)

    useEffect(() => {
        const secretPk = props.route.params.secretPk
        const secret = props.secretsManager.getSecret(secretPk)
        console.log('secret', secret.toString())
        setSecret(secret)
        setLoading(false)
    }, [])

    const deleteSecret = async () => {
        await props.secretsManager.deleteSecret(secret)
        props.navigation.dispatch(CommonActions.reset({routes: [
            {name: ROUTES.SecretsListRoute}]}))
    }

    if(loading)
        return <LoadingScreen />
    if(deleteToggle)
        return <MainContainer header='Delete?'>
            <SecretRow secret={secret} />
            <Warning msg='Are you sure you want to delete this secret' />
            <View style={tw`flex flex-row justify-end`}>            
                <Pressable style={[ds.buttonSm, ds.blueButton, tw`mr-2`]}
                    onPress={() => setDeleteToggle(false)}>
                    <Text style={ds.buttonTextSm}>Cancel</Text>
                </Pressable>
                <Pressable style={[ds.buttonSm, ds.redButton]}
                    onPress={deleteSecret}>
                    <Text style={ds.buttonTextSm}>Delete</Text>
                </Pressable>
            </View>
        </MainContainer>
    return <SecretForm create={false} navigation={props.navigation} 
        secretsManager={props.secretsManager} secret={secret}
        toggleDelete={() => setDeleteToggle(true)} />
}

export default SecretEditScreen;