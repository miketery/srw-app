import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import MainContainer from '../../components/MainContainer';

const secretTypeStyleMap = {
    'password': {
        icon: 'key-outline',
        background: tw`bg-green-700`,
    },
    'key': {
        icon: 'key-outline',
        background: tw`bg-yellow-500`,
    },
    'note': {
        icon: 'document-text-outline',
        background: tw`bg-purple-600`,
    },
    'login': {
        icon: 'medical-outline',
        background: tw`bg-blue-500`,
    },
}

function SecretIcon({secretType}) {
    const icon = secretTypeStyleMap[secretType].icon
    const style = [
        tw`rounded-full h-11 w-11 items-center justify-center`,
        secretTypeStyleMap[secretType].background,
        secretType === 'note' && tw`pl-1`, // misalignment adjust for note icon
    ]
    return <View style={style}>
        <Icon name={icon} size={22} color='white' style={tw`text-center`} />
    </View>
}

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
            onPress={() => props.navigation.navigate(ROUTES.DevSecretsRoute)}>
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