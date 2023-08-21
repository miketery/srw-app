import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import Cache from '../../classes/Cache';
import SI from '../../classes/StorageInterface';

import Secret from '../../classes/Secret';

function SecretRow(props) {
    const { name, description, data } = props.secret
    return <View style={tw`flex flex-col`}>
        <Text style={ds.text}>{name}</Text>
        <Text style={ds.text}>{description}</Text>
        <Text style={ds.text}>{data}</Text>
    </View>
}


function SecretsListScreen(props) {
    const [secrets, setSecrets] = useState([])

    useEffect(() => {
        const vault_pk = Cache.getVaultPk()
        const unsubscribe = props.navigation.addListener('focus', async() => {
            const secrets = await SI.getAll(SI.StoredTypes.secret, vault_pk)
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