import { useEffect, useState } from "react";
import { Pressable, Text, View } from 'react-native';
import { CommonActions } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons'
import Toast from "react-native-toast-message";

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { GoBackButton } from '../../components';
import MainContainer from "../../components/MainContainer";

import Secret, { SecretType } from '../../models/Secret';
import { SecretIcon, secretTypeStyleMap } from "./SecretViewScreen";
import { XTextInput } from '../../components/Input'
import SecretsManager from "../../managers/SecretsManager";
import { ROUTES } from "../../config";
import { trimAndLower } from "../../lib/utils";

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

const viewRoute = (secretPk: string) => {return {routes: [
    {name: ROUTES.SecretsListRoute},
    {name: ROUTES.SecretViewRoute, params: {secretPk: secretPk}}
]}}

type SecretFormProps = {
    navigation: any,
    secretsManager: SecretsManager,
    create: boolean, // lets be explicit if create (even if can infer)
    secret?: Secret, // if secret provided then we are updating
    toggleDelete?: () => void,
}

const SecretForm = (props: SecretFormProps) => {
    const [errors, setErrors] = useState<{[k: string]: string}>({})
    // cant edit secret type if update
    const [step, setStep] = useState<0|1>(props.create ? 0 : 1)

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [secretType, setSecretType] = useState<SecretType>(SecretType.note)

    // for key or note
    const [secretData, setSecretData] = useState<string>('');
    
    // for login
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    
    if(props.secret) {
        const { secretType, name, description, data } = props.secret
        useEffect(() => {
            setSecretType(secretType)
            setTitle(name)
            setDescription(description)
            if(props.secret.secretType === SecretType.login) {
                setUsername(data.username)
                setPassword(data.password)
            } else {
                setSecretData(data.secret)
            }
        }, [])
    }

    const setSecretTypeAndNextStep = (secretType: SecretType) => {
        setSecretType(secretType)
        setStep(1)
    }

    const checkValid = () => {
        const errors = {} as {[k: string]: string}
        if (title.length === 0 || trimAndLower(title) === '')
            errors.title = 'Title is required'
        if(secretType === SecretType.login) {
            if(username.length === 0 || trimAndLower(username) === '')
                errors.username = 'Username is required'
            if(password.length === 0 || trimAndLower(password) === '')
                errors.password = 'Password is required'
        } else {
            if(secretData.length === 0 || trimAndLower(secretData) === '')
                errors.secretData = 'Secret Data is required'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0    }

    const handleCreate = async () => {
        console.log('[CreateSecretScreen.handleSubmit]', {
            title,
            description,
            secretData,
            username,
            password,
        });
        if(!checkValid())
            return
        const data = secretType === SecretType.login ? {
            username,
            password,
        } : {secret: secretData}
        
        const secret = await props.secretsManager.createSecret(
            secretType, title, description, data);
        Toast.show({text1: 'Success!', text2: `'${title}' was created and saved.`})
        props.navigation.dispatch(CommonActions.reset(viewRoute(secret.pk)));
    }

    const handleUpdate = () => {
        if(!checkValid())
            return
        const data = secretType === SecretType.login ? {
            username,
            password,
        } : {secret: secretData}
        props.secret.update(title, description, data)
        props.secretsManager.saveSecret(props.secret)
        props.navigation.dispatch(CommonActions.reset(viewRoute(props.secret.pk)));
    }

    const header = step === 0 ? 'Create Secret' : labelMap[secretType]
    const buttonRow = <>
        <GoBackButton onPressOut={() => {
            step === 0 || props.create === false ? props.navigation.goBack() : setStep(0)
        }} />
        <View style={tw`flex-grow`} />
        {step === 1 && <Pressable onPress={() => props.create ? handleCreate() : handleUpdate()}>
            <View style={[ds.button, ds.blueButton]}>
                <Text style={ds.buttonText}>{props.create ? 'Create Secret' : 'Update'}</Text>
            </View>
        </Pressable>}
    </>
    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>       
        {step === 0 && <SecretTypePicker onClick={setSecretTypeAndNextStep} />}
        {step === 1 && <>
            <View style={tw`flex-row items-center my-2 mb-2`}>
                <SecretIcon secretType={secretType} big={true} />
                {props.create && 
                <Pressable onPressOut={() => setStep(0)}>
                    <View style={tw`flex-row ml-4`}>
                        {/* <Text style={tw`text-xl capitalize font-bold text-slate-100`}>{labelMap[secretType]}</Text> */}
                        <View style={tw`px-4 py-2 rounded-full border border-slate-100`}><Text style={ds.text}>Change</Text></View>
                    </View>
                </Pressable>}
            </View>
            <XTextInput
                label="Title"
                value={title}
                error={'title' in errors}
                onChangeText={setTitle}
            />
            <XTextInput
                label="Description"
                value={description}
                error={'description' in errors}
                onChangeText={setDescription}
                multiline={true}
            />
            {[SecretType.note, SecretType.key].includes(secretType) && 
                <XTextInput
                    label="Secret Data"
                    value={secretData}
                    error={'secretData' in errors}
                    onChangeText={setSecretData}
                    multiline={true}
            />}
            {secretType === SecretType.login &&
            <>
                <XTextInput
                    label="Username / Email"
                    value={username}
                    error={'username' in errors}
                    onChangeText={setUsername} />
                <XTextInput
                    label="Password"
                    value={password}
                    error={'password' in errors}
                    onChangeText={setPassword}
                    password={true} />
            </>}
            {props.create === false && props.toggleDelete && <View style={tw`flex flex-row justify-end`}>
                <Pressable onPressOut={props.toggleDelete}>
                    <View style={[ds.buttonXs, ds.redButton, tw`flex flex-row`]}>
                        <Text style={ds.buttonTextSm}>Delete?</Text>
                        <Icon name='trash' size={16} color='white' style={tw`text-center`} />
                    </View>
                </Pressable>
            </View>}
        </>}
    </MainContainer>
}

export default SecretForm;