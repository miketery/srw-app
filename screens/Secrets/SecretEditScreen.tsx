import React, { useEffect, useState } from 'react'
import Secret from "../../models/Secret";
import SecretsManager from "../../managers/SecretsManager";
import SecretForm from './SecretForm';
import { LoadingScreen } from '../../components';

type SecretEditScreenProps = {
    navigation: any,
    secretsManager: SecretsManager,
    route: {
        params: {
            secretPk: string,
        }
    }
}

const SecretEditScreen: React.FC<SecretEditScreenProps> = (props) => {
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

    if(loading)
        return <LoadingScreen />
    return <SecretForm create={false} navigation={props.navigation} 
        secretsManager={props.secretsManager} secret={secret} />
}

export default SecretEditScreen;