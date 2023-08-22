import { useEffect, useState } from 'react';
import SecretsManager from '../../classes/SecretsManager'

function SecretViewScreen(props) {
    // props get secret_pk from nav
    const [secret, setSecret] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const secret_pk = props.route.params.secret_pk

        // get secret from secret_pk
        // setSecret(secret)
        // setError(error)
        // setLoading(loading)
    }, [])

    return null;

}

export default SecretViewScreen;