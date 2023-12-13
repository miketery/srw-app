import { Pressable, Text, View } from 'react-native'
import Secret, { SecretType } from '../../models/Secret'
import { test_secrets } from '../../testdata/test_secrets'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import MainContainer from '../../components/MainContainer'


async function DeleteAllSecrets(secretsManager) {
    return secretsManager.getSecretsArray().forEach(async (secret) => {
        return secretsManager.deleteSecret(secret)
    })
}
async function AddTestSecrets(secretsManager) {
    const secret = await Secret.create(
        SecretType.Text,
        'Test Text Secret',
        'This is a test secret',
        'Secret Data',
        secretsManager.vault.pk)
    return secretsManager.saveSecret(secret)
}
export async function AddManyTestSecrets(secretsManager) {
    return test_secrets.forEach(async (s, i) => {
        const secret = await Secret.create(
            s.secretType,
            s.name,
            s.description,
            s.data,
            secretsManager.vault.pk)
        return secretsManager.saveSecret(secret)
    })
}

export default function DevSecrets(props) {
    const current_route = props.route.name
    const header = 'Dev Secrets'
    const buttonRow = <></>
    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        <View>
            <Text style={ds.text}>Route: {current_route}</Text>
        </View>
        <View>
            <Pressable style={[ds.ctaButton]}
                onPress={() => AddTestSecrets(props.secretsManager)}>
                <Text style={ds.buttonText}>Add Secret</Text>
            </Pressable>
        </View>
        <View style={tw`mt-8`}>
            <Pressable style={[ds.ctaButton, ds.greenButton]}
                onPress={() => AddManyTestSecrets(props.secretsManager)}>
                <Text style={ds.buttonText}>Add Many Secrets</Text>
            </Pressable>
        </View>
        <View style={tw`mt-8`}>
            <Pressable style={[ds.ctaButton, ds.redButton]}
                onPress={() => DeleteAllSecrets(props.secretsManager)}>
                <Text style={ds.buttonText}>Delete all secrets</Text>
            </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
        <View style={tw`justify-around mb-10 flex-col items-center`}>

        </View>
    </MainContainer>
}