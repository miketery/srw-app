import { useEffect, useState } from "react";
import { Pressable, Text, ScrollView, View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'


import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import SecretsManager from '../../managers/SecretsManager'

import MainContainer from "../../components/MainContainer";
import Secret, { SecretType } from '../../models/Secret';
import { GoBackButton } from '../../components';
import { AnimatedLabelInput, XTextInput } from '../../components/Input'


type CreateSecretScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
}


const CreateSecretScreen = ({navigation, secretsManager}: CreateSecretScreenProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [secretData, setSecretData] = useState('');
    const [errors, setErrors] = useState({});


    useEffect(() => {
        // This effect can be used to perform any side effects when the component is mounted.
        // For example, you can fetch data or initialize the form.

        return () => {
            // This is the cleanup function. It's executed when the component is unmounted.
            // Any cleanup operations should be performed here.
        };
    }, []);

    const handleSubmit = async () => {
        console.log('[CreateSecretScreen.handleSubmit]', {
            title,
            description,
            secretData,
        });
        //TODO: implement types
        const secret = await secretsManager.createSecret(
            SecretType.note, title, description, secretData);
        //TODO: alert
        navigation.goBack();
    };
    const header = 'Create Secret'
    const buttonRow = <>
    <GoBackButton onPressOut={() => navigation.goBack()} />

    </>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        {/* <AnimatedLabelInput
            label="Title"
            // placeholder="Title"
            value={title}
            onChangeText={setTitle}
            error={'name' in errors}
        />
        <AnimatedLabelInput
            label="Description"
            // placeholder="Description"
            value={description}
            onChangeText={setDescription}
            error={'description' in errors}
        />
        <MyTextInput
            label="Secret Data"
            // placeholder="Secret Value"
            value={secretData}
            onChangeText={setSecretData}
            multiline={true}
            error={'secretData' in errors}
        /> */}
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
        <Pressable onPress={handleSubmit}>
            <View style={ds.button}>
                <Text style={ds.buttonText}>Create Secret</Text>
            </View>
        </Pressable>
    </MainContainer>
};

export default CreateSecretScreen;
