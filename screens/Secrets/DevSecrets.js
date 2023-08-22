import { Pressable, Text, View } from 'react-native'
import Secret, { SecretType } from '../../classes/Secret'
import { test_secrets } from '../../testdata/test_secrets'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import VM from '../../classes/VaultManager'

// import Cache from '../../classes/Cache'

function ClearSecrets() {

}
async function AddTestSecrets() {
    const vault_pk = VM.current_vault_pk
    const secret = await Secret.create(
        SecretType.Text,
        'Test Text Secret',
        'This is a test secret',
        'Secret Data',
        vault_pk)
    return secret.save()
}
async function AddManyTestSecrets() {
    const vault_pk = VM.current_vault_pk
    return test_secrets.forEach(async (secret) => {
        const secret_obj = await Secret.create(
            SecretType.Text,
            secret.name,
            secret.description,
            secret.data,
            vault_pk)
        return secret_obj.save()
    }
    )
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
                    onPress={() => AddTestSecrets()}>
                    <Text style={ds.buttonText}>Add Secret</Text>
                </Pressable>
            </View>
            <View style={tw`mt-8`}>
                <Pressable style={[ds.ctaButton, ds.greenButton]}
                    onPress={() => AddManyTestSecrets()}>
                    <Text style={ds.buttonText}>Add Many Secrets</Text>
                </Pressable>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>

            </View>
        </View>
    )
}