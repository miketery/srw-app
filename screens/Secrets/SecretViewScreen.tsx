import { useEffect, useState } from "react";
import { Pressable, Text, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { GoBackButton } from '../../components';


import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import SecretsManager from '../../managers/SecretsManager'
import Secret, { SecretType } from '../../models/Secret';

import MainContainer from "../../components/MainContainer";


export const secretTypeStyleMap: { [k in SecretType]: {
    icon: string,
    background: any,
}} = {
    [SecretType.key]: {
        icon: 'key-outline',
        background: tw`bg-xyellow`,
    },
    [SecretType.note]: {
        icon: 'document-text-outline',
        background: tw`bg-xmidpurple`,
    },
    [SecretType.login]: {
        icon: 'medical-outline',
        background: tw`bg-xmidblue`,
    },
    [SecretType.document]: {
        icon: 'document-attach-outline',
        background: tw`bg-green-700`,
    },
}

export function SecretIcon({secretType, big}: {secretType: SecretType, big?: boolean}) {
    const icon = secretTypeStyleMap[secretType].icon
    const style = [
        big ? ds.largeCircle : ds.mediumCircle,
        secretTypeStyleMap[secretType].background,
        secretType === 'note' && tw`pl-1`, // misalignment adjust for note icon
    ]
    const size = big ? 42 : 22
    return <View style={style}>
        <Icon name={icon} size={size} color='white' style={tw`text-center`} />
    </View>
}

const SecretCard = ({ secret }: { secret: Secret }) => {
    const { name, description, data } = secret
    return <View>
        <View style={tw`flex flex-row items-center py-1 mb-1`}>
            <View>
                <View style={tw`flex flex-row items-center`}>
                    <Text style={ds.textLg}>{name}</Text>
                </View>
            </View>
        </View>
    </View>
}


type SecretViewScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
    route: {
        params: {
            secretPk: string,
        }
    }
}

function SecretViewScreen(props: SecretViewScreenProps) {
    // props get secretPk from nav
    const [secret, setSecret] = useState<Secret>(null)
    // const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const secretPk = props.route.params.secretPk
        const secret = props.secretsManager.getSecret(secretPk)
        console.log('secret', secret.toString())
        setSecret(secret)
        setLoading(false)
    }, [])
    const header = 'Secret Details'
    const buttonRow = <>
        <GoBackButton onPressOut={() => props.navigation.goBack()} />
    </>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        {loading && <Text>Loading...</Text>}
        {/* {error && <Text>{error}</Text>} */}
        {secret && <SecretCard secret={secret} />}
    </MainContainer>
}

export default SecretViewScreen;