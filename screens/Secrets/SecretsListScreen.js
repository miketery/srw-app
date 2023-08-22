import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import Cache from '../../classes/Cache';
import SI, { StoredType } from '../../classes/StorageInterface';

import Secret from '../../classes/Secret';

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
        const vault_pk = Cache.getVaultPk()
        const unsubscribe = props.navigation.addListener('focus', async() => {
            const secrets = await SI.getAll(StoredType.secret, vault_pk)
            setSecrets(secrets)
          });
        return unsubscribe;
    }, [])

    return <View style={ds.mainContainerPt}>
        <View style={ds.headerRow}>
            <Text style={ds.header}>Secrets</Text>
        </View>
        <View>
            {secrets.map((secret) => {
                return <SecretRow key={secret.pk} secret={secret} />
            })}
        </View>
    </View>
}

export default SecretsListScreen