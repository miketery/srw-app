import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { GoBackButton } from '../../components';
import Clipboard from '@react-native-clipboard/clipboard';


import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import SecretsManager from '../../managers/SecretsManager'
import Secret, { HistoricSecretData, SecretType } from '../../models/Secret';

import MainContainer from "../../components/MainContainer";
import { ROUTES } from "../../config";
import { formatDate, formatTime } from "../../lib/utils";


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

export function SecretIcon({secretType}: {secretType: SecretType, big?: boolean}) {
    const icon = secretTypeStyleMap[secretType].icon
    const style = [
        ds.mediumCircle,
        secretTypeStyleMap[secretType].background,
        secretType === 'note' && tw`pl-1`, // misalignment adjust for note icon
    ]
    const size = 22
    return <View style={style}>
        <Icon name={icon} size={size} color='white' style={tw`text-center`} />
    </View>
}

export const SecretRow = ({secret}) => {
    const { name, secretType, data, } = secret
    return <View style={tw`flex flex-row items-center py-1 mb-1`}>
        <View style={tw`mr-2`}>
            <SecretIcon secretType={secret.secretType}/>
        </View>
        <View style={tw`flex flex-col`}>
            <Text style={ds.textLg}>{name}</Text>
            {secretType === SecretType.login &&
                <Text style={ds.textSm}>{data.username}</Text>}
        </View>
    </View>
}
type SecretHistoryProps = {
    secretType: SecretType,
    history: HistoricSecretData[],
}
const SecretHistory: React.FC<SecretHistoryProps> = (props) => {
    const [showHistory, setShowHistory] = useState(false)
    const toggleShowHistory = () => setShowHistory(!showHistory)
    if(props.history.length === 0) return null

    return <View style={ds.col}>
        <Pressable style={tw``}
            onPressOut={toggleShowHistory}>
            <Text style={tw`text-cyan-400 text-base`}>{showHistory ? 'Hide' : 'Show'} History</Text>
        </Pressable>
        {showHistory && props.history.map((historicSecretData, index) => {
            const { ts, data } = historicSecretData
            return <View key={index} style={tw`flex flex-row items-center py-2 border-b border-slate-400 border-dashed`}>
                <View style={tw`mr-2`}>
                    <Text style={ds.text}>{formatDate(ts)}</Text>
                    <Text style={ds.text}>{formatTime(ts)}</Text>
                </View>
                <View style={tw`flex flex-col`}>
                    {props.secretType === SecretType.login ? <>
                        <Text style={ds.text}>{data.username}</Text>
                        <Text style={ds.text}>{data.password}</Text>
                    </> : <Text style={ds.text}>{data.secret}</Text>}
                </View>
            </View>
        })}
    </View>

}

const SecretCard = ({ secret }: { secret: Secret }) => {
    const { description, data, secretType, history, created, updated } = secret
    return <View>
        <SecretRow secret={secret} />
        <View style={tw`mb-4 pb-4 border-b border-slate-400`}>
            <Text style={ds.text}>{description}</Text>
        </View>
        <View style={tw`flex flex-col items-start`}>
            {secretType === SecretType.login ? <>
                <View style={[ds.col, tw`w-full mb-4`]}>
                    <Text style={[ds.text, tw`mb-1`]}>
                        Username / Email
                    </Text>
                    <Pressable style={[ds.xinput, tw`flex-row items-center justify-between border-slate-600`]}
                        onPress={() => Clipboard.setString(data.username)}>
                        <Text style={ds.textXl}>
                            {data.username}
                        </Text>
                        <Text style={[ds.text, tw`self-center pl-4`]}>
                            <Icon name='copy-outline' size={24} />
                        </Text>
                    </Pressable> 
                </View>
                <View style={[ds.col, tw`w-full mb-4`]}>
                    <Text style={[ds.text, tw`mb-1`]}>
                        Password
                    </Text>
                    <Pressable style={[ds.xinput, tw`flex-row items-center justify-between border-slate-600`]}
                        onPress={() => Clipboard.setString(data.password)}>
                        <Text style={ds.textLg}>
                            {data.password}
                        </Text>
                        <Text style={[ds.text, tw`self-center pl-4`]}>
                            <Icon name='copy-outline' size={24} />
                        </Text>
                    </Pressable> 
                </View>
            </> : 
            <View style={[ds.col, tw`w-full mb-4`]}>
                <Text style={[ds.text, tw`mb-1`]}>
                    Secret Data
                </Text>
                <Pressable style={[ds.xinput, tw`flex-row items-center justify-between border-slate-600 w-full`]}
                    onPress={() => Clipboard.setString(data.secret)}>
                    <Text style={[ds.textLg, tw`w-full pr-10 -mr-10`, {wordBreak: 'all'}]}>
                        {data.secret}
                    </Text>
                    <Text style={[ds.text, tw`self-center pl-4`]}>
                        <Icon name='copy-outline' size={24} />
                    </Text>
                </Pressable>
            </View>}
        </View>
        <SecretHistory history={history} secretType={secretType} />
        <View style={tw`self-end my-2`}>
            <Text style={ds.textXs}>Date {updated === created ? 'created' : 'modified'} {formatDate(updated)}</Text>
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

const SecretViewScreen = (props: SecretViewScreenProps) => {
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
        <View style={tw`flex-grow-1`} />
        <Pressable style={[ds.button, ds.greenButton]}
            onPressOut={() => props.navigation.navigate(
                ROUTES.SecretEditRoute, {secretPk: secret.pk})}>
            <Text style={ds.buttonText}>Edit</Text>
        </Pressable>
    </>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        {loading && <Text>Loading...</Text>}
        {/* {error && <Text>{error}</Text>} */}
        {secret && <SecretCard secret={secret} />}
    </MainContainer>
}

export default SecretViewScreen;