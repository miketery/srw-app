import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import { TopGradient } from '../../components';

import { getSecretsManager } from '../../classes/Cache';

function SecretIcon(props) {
    return <View style={tw`bg-gray-400 rounded-full h-16 w-16`} />
}

function SecretRow(props) {
    const { name, description, data } = props.secret
    return <View style={tw`flex flex-row items-center py-1 mb-1 bg-slate-600`}>
        <View style={tw`mr-1`}>
            <SecretIcon />
        </View>
        <View style={tw`flex flex-col`}>
            <Text style={ds.textLg}>{name}</Text>
            <Text style={ds.text}>{description}</Text>
            {/* <Text style={ds.text}>{data}</Text> */}
        </View>
    </View>
}


function SecretsListScreen(props) {
    const [secrets, setSecrets] = useState([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[SecretsListScreen.js] focus()')
            const secrets = getSecretsManager().getSecretsArray()
            setSecrets(secrets.sort((a, b) => a.name.localeCompare(b.name)))
          });
        return unsubscribe;
    }, [])

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Secrets</Text>
            </View>
            <View>
                {secrets.map((secret) => {
                    return <SecretRow key={secret.pk} secret={secret} />
                })}
            </View>
            
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.DevSecretsRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
            <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.SecretCreateRoute)}>
                <Text style={ds.buttonText}>Add Secret</Text>
            </Pressable>
        </View>
    </View>
}

export default SecretsListScreen