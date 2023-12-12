import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import MainContainer from '../../components/MainContainer';
import { SecretIcon } from './SecretViewScreen'

function SecretRow({secret, navigation}) {
    const { name, description, data } = secret
    return <Pressable style={tw`flex flex-row items-center py-1 mb-1`}
            onPressOut={() => navigation.navigate(ROUTES.SecretViewRoute, {secretPk: secret.pk})}>
        <View style={tw`mr-2`}>
            <SecretIcon secretType={secret.secretType}/>
        </View>
        <View style={tw`flex flex-col`}>
            <Text style={ds.textLg}>{name}</Text>
            <Text style={ds.text}>{description}</Text>
            {/* <Text style={ds.text}>{data}</Text> */}
        </View>
    </Pressable>
}

function SecretsListScreen(props) {
    const [secrets, setSecrets] = useState([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[SecretsListScreen.js] focus()')
            const secrets = props.secretsManager.getSecretsArray()
            setSecrets(secrets.sort((a, b) => a.name.localeCompare(b.name)))
          });
        return unsubscribe;
    }, [])

    const header='Secrets'
    const buttonRow = <>
        {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
            onPressOut={() => props.navigation.navigate(ROUTES.DevSecretsRoute)}>
            <Text style={ds.buttonText}>Dev</Text>
        </Pressable>}
        <View style={tw`flex-grow-1`} />
        <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
            onPress={() => props.navigation.navigate(ROUTES.SecretCreateRoute)}>
            <Text style={ds.buttonText}>Add Secret</Text>
        </Pressable>
    </>

    return <MainContainer header={header} buttonRow={buttonRow}>
        {secrets.map((secret) => {
            return <SecretRow key={secret.pk} secret={secret} navigation={props.navigation} />
        })}
    </MainContainer>
}

export default SecretsListScreen