import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';

import ds from '../../assets/styles';

const CreateSecretScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [secretValue, setSecretValue] = useState('');

    useEffect(() => {
        // This effect can be used to perform any side effects when the component is mounted.
        // For example, you can fetch data or initialize the form.

        return () => {
            // This is the cleanup function. It's executed when the component is unmounted.
            // Any cleanup operations should be performed here.
        };
    }, []);

    const handleSubmit = () => {
        // Handle the submission of the secret. You can save the secret to a local database or
        // call an API to store the secret on a server.
        console.log({
            title,
            description,
            secretValue,
        });
    };

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <TextInput
                style={ds.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={ds.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                style={ds.input}
                placeholder="Secret Value"
                value={secretValue}
                onChangeText={setSecretValue}
                multiline={true}
            />
            <Pressable title="Create Secret" onPress={handleSubmit}>
                <View style={ds.button}>
                    <Text style={ds.buttonText}>Create Secret</Text>
                </View>
            </Pressable>
        </ScrollView>
    </View>
};

export default CreateSecretScreen;