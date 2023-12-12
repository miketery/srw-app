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
import { secretTypeStyleMap } from "./SecretViewScreen";

const SecretTypePicker = ({ secretType, onClick }) => {
    const [showPicker, setShowPicker] = useState(false)
    const togglePicker = () => {
        setShowPicker(!showPicker)
    }
    const pickerItems = Object.keys(SecretType).map((key, index) => {
        const style = [
            tw`flex flex-col items-center justify-center h-40 w-40 mb-5 p-3 bg-slate-700 rounded-lg`,
            secretTypeStyleMap[SecretType[key]].background
        ]
        const icon = secretTypeStyleMap[SecretType[key]].icon
        return <Pressable key={index} onPressOut={() => {
            onClick(SecretType[key])
            togglePicker()
        }}>
            <View style={style}>
                <Icon name={icon} size={38} color='white' style={tw`text-center`} />
                <Text style={tw`text-xl capitalize font-bold text-slate-100`}>{SecretType[key]}</Text>
            </View>
        </Pressable>
    })
    return <View style={tw`flex flex-wrap flex-row justify-between`}>
        {pickerItems}
    </View>
}


type CreateSecretScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
}

const CreateSecretScreen = ({navigation, secretsManager}: CreateSecretScreenProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [secretData, setSecretData] = useState('');
    const [errors, setErrors] = useState({});

    const [secretType, setSecretType] = useState(SecretType.Note)
    const [stage, setStage] = useState(0)

    useEffect(() => {
        // This effect can be used to perform any side effects when the component is mounted.
        // For example, you can fetch data or initialize the form.

        return () => {
            // This is the cleanup function. It's executed when the component is unmounted.
            // Any cleanup operations should be performed here.
        };
    }, []);

    const setSecretTypeAndNextStage = (secretType) => {
        setSecretType(secretType)
        setStage(1)
    }

    const handleSubmit = async () => {
        console.log('[CreateSecretScreen.handleSubmit]', {
            title,
            description,
            secretData,
        });
        //TODO: implement types
        const secret = await secretsManager.createSecret(
            secretType, title, description, secretData);
        //TODO: alert
        navigation.goBack();
    };
    const header = 'Create Secret'
    const buttonRow = <>
        <GoBackButton onPressOut={() => {
            stage === 0 ? navigation.goBack() : setStage(0)
        }} />
        <View style={tw`flex-grow`} />
        {stage === 1 && <Pressable onPress={handleSubmit}>
            <View style={ds.button}>
                <Text style={ds.buttonText}>Create Secret</Text>
            </View>
        </Pressable>}
    </>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        {stage === 0 && <SecretTypePicker secretType={secretType} onClick={setSecretTypeAndNextStage} />}
        {stage === 1 && <>
            <XTextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
            />
            <XTextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
            />
            <XTextInput
                label="Secret Data"
                value={secretData}
                onChangeText={setSecretData}
                multiline={true}
            />
        </>}
    </MainContainer>
};

export default CreateSecretScreen;
