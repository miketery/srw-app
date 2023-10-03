import { Pressable, Text, View } from 'react-native'
import Secret, { SecretType } from '../../models/Secret'
import { test_secrets } from '../../testdata/test_secrets'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'


async function DeleteAllSecrets(secrets_manager) {
    return secrets_manager.getSecretsArray().forEach(async (secret) => {
        return secrets_manager.deleteSecret(secret)
    })
}
async function AddTestSecrets(secrets_manager) {
    const secret = await Secret.create(
        SecretType.Text,
        'Test Text Secret',
        'This is a test secret',
        'Secret Data',
        secrets_manager.vault.pk)
    return secrets_manager.saveSecret(secret)
}
async function AddManyTestSecrets(secrets_manager) {
    return test_secrets.forEach(async (s) => {
        const secret = await Secret.create(
            SecretType.Text,
            s.name,
            s.description,
            s.data,
            secrets_manager.vault.pk)
        return secrets_manager.saveSecret(secret)
    })
}



export default function DevSecrets(props) {

    const current_route = props.route.name
    return (
        <View style={ds.landingContainer}>

            <Text style={ds.header}>Dev Secrets</Text>
            <View>
                <Text style={ds.text}>Route: {current_route}</Text>
            </View>
            <View>
                <Pressable style={[ds.ctaButton]}
                    onPress={() => AddTestSecrets(props.secrets_manager)}>
                    <Text style={ds.buttonText}>Add Secret</Text>
                </Pressable>
            </View>
            <View style={tw`mt-8`}>
                <Pressable style={[ds.ctaButton, ds.greenButton]}
                    onPress={() => AddManyTestSecrets(props.secrets_manager)}>
                    <Text style={ds.buttonText}>Add Many Secrets</Text>
                </Pressable>
            </View>
            <View style={tw`mt-8`}>
                <Pressable style={[ds.ctaButton, ds.redButton]}
                    onPress={() => DeleteAllSecrets(props.secrets_manager)}>
                    <Text style={ds.buttonText}>Delete all secrets</Text>
                </Pressable>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>

            </View>
        </View>
    )
}