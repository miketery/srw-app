import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import Cache from '../../classes/Cache';
import { BottomGradient, TopGradient } from '../../components';
// import SI, { StoredType } from '../../classes/StorageInterface';

// import Secret from '../../classes/Secret';
import SecretsManager from '../../classes/SecretsManager';

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
        const vault_pk = Cache.vault_pk
        const unsubscribe = props.navigation.addListener('focus', async() => {
            const secrets = await SecretsManager.get_secrets(vault_pk)
            //SI.getAll(StoredType.secret, vault_pk)
            setSecrets(secrets)
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
        <View style={tw`-mt-16 items-end pb-4 pr-2`}>
            <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPress={() => props.navigation.navigate('SecretAddRoute')}>
                <Text style={ds.buttonText}>Add Secret</Text>
            </Pressable>
        </View>
    </View>
}

export default SecretsListScreen