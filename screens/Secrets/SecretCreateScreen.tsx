import { useEffect, useState } from "react";
import { Pressable, Text, ScrollView, View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import SecretsManager from '../../managers/SecretsManager'
import { SecretType } from '../../models/Secret';

import MainContainer from "../../components/MainContainer";
import { GoBackButton } from '../../components';
import { XTextInput } from '../../components/Input'
import { SecretIcon, secretTypeStyleMap } from "./SecretViewScreen";

const labelMap: { [k in SecretType]?: string}= {
    [SecretType.note]: 'Note',
    [SecretType.key]: 'Key / Password',
    [SecretType.login]: 'Login',
    // [SecretType.document]: 'Document',
}

const SecretTypePicker = ({ onClick }) => {
    const baseStyle = tw`flex flex-col items-center justify-center h-30 w-60 mb-5 p-3 bg-slate-700 rounded-lg`
    const pickerItems = Object.keys(labelMap).map((key, index) => {
        const style = [
            baseStyle,
            secretTypeStyleMap[key].background
        ]
        const icon = secretTypeStyleMap[key].icon
        return <Pressable key={index} onPressOut={() => {
            onClick(key)
        }}>
            <View style={style}>
                <Icon name={icon} size={38} color='white' style={tw`text-center`} />
                <Text style={tw`text-xl capitalize font-bold text-slate-100`}>{labelMap[key]}</Text>
            </View>
        </Pressable>
    })
    return <View style={tw`flex flex-wrap flex-col items-center`}>
        {pickerItems}
    </View>
}


type CreateSecretScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
}

const CreateSecretScreen = ({navigation, secretsManager}: CreateSecretScreenProps) => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [secretData, setSecretData] = useState<string>(''); // for key or not

    const [username, setUsername] = useState<string>(''); // for login
    const [password, setPassword] = useState<string>(''); // for login

    const [errors, setErrors] = useState({});

    const [secretType, setSecretType] = useState<SecretType>(null)
    const [step, setStep] = useState<0|1>(0)

    useEffect(() => {
        // This effect can be used to perform any side effects when the component is mounted.
        // For example, you can fetch data or initialize the form.

        return () => {
            // This is the cleanup function. It's executed when the component is unmounted.
            // Any cleanup operations should be performed here.
        };
    }, []);

    const setSecretTypeAndNextStep = (secretType: SecretType) => {
        setSecretType(secretType)
        setStep(1)
    }

    const handleSubmit = async () => {
        console.log('[CreateSecretScreen.handleSubmit]', {
            title,
            description,
            secretData,
            username,
            password,
        });
        //TODO: implement types
        const data = secretType === SecretType.login ? {
            username,
            password,
        } : {secret: secretData}
        const secret = await secretsManager.createSecret(
            secretType, title, description, data);
        //TODO: alert
        navigation.goBack();
    };
    const header = step === 0 ? 'Create Secret' : labelMap[secretType]
    const buttonRow = <>
        <GoBackButton onPressOut={() => {
            step === 0 ? navigation.goBack() : setStep(0)
        }} />
        <View style={tw`flex-grow`} />
        {step === 1 && <Pressable onPress={handleSubmit}>
            <View style={ds.button}>
                <Text style={ds.buttonText}>Create Secret</Text>
            </View>
        </Pressable>}
    </>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        {step === 0 && <SecretTypePicker onClick={setSecretTypeAndNextStep} />}
        {step === 1 && <>
            <View style={tw`flex-row items-center mb-4`}>
                <SecretIcon secretType={secretType} big={true} />
                <Pressable onPressOut={() => setStep(0)}>
                    <View style={tw`flex-row ml-4`}>
                        {/* <Text style={tw`text-xl capitalize font-bold text-slate-100`}>{labelMap[secretType]}</Text> */}
                        <View style={tw`px-4 py-2 rounded-full border border-slate-100`}><Text style={ds.text}>Change</Text></View>
                    </View>
                </Pressable>
            </View>
            <XTextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
            />
            <XTextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline={true}
            />
            {[SecretType.note, SecretType.key].includes(secretType) && 
                <XTextInput
                    label="Secret Data"
                    value={secretData}
                    onChangeText={setSecretData}
                    multiline={true}
            />}
            {secretType === SecretType.login &&
            <>
                <XTextInput
                    label="Username / Email"
                    value={username}
                    onChangeText={setUsername} />
                <XTextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    password={true} />
            </>}
        </>}
    </MainContainer>
};

export default CreateSecretScreen;
