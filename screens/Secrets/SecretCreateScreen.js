import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.textbox}
        placeholder="Secret Value"
        value={secretValue}
        onChangeText={setSecretValue}
        multiline={true}
      />
      <Button title="Create Secret" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 16,
  },
  textbox: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 16,
  },
});

export default CreateSecretScreen;
