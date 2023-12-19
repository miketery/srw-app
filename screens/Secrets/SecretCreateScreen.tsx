import { useEffect } from "react";

import SecretsManager from '../../managers/SecretsManager'

import SecretForm from "./SecretForm";

type CreateSecretScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
}

const CreateSecretScreen = ({navigation, secretsManager}: CreateSecretScreenProps) => {
    // useEffect(() => {
    //     // This effect can be used to perform any side effects when the component is mounted.
    //     // For example, you can fetch data or initialize the form.

    //     return () => {
    //         // This is the cleanup function. It's executed when the component is unmounted.
    //         // Any cleanup operations should be performed here.
    //     };
    // }, []);
    return <SecretForm create={true} navigation={navigation} secretsManager={secretsManager} />
};

export default CreateSecretScreen;
