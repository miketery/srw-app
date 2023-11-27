import { Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import ds from '../../assets/styles'
import RecoverVaultUtil from '../../managers/RecoverVaultUtil'


export default function RecoverVaultHubScreen({navigation, vault}) {
    // fetch RecoverCombine
    const [loading, setLoading] = useState(true)
    const [recoverCombine, setRecoverCombine] = useState(null)

    useEffect(() => {
        const fetchRecoverCombine = async () => {
            const data = await RecoverVaultUtil.loadRecoverCombine(vault)
            if(data)
                setRecoverCombine(data)
            setLoading(false)
        }
        fetchRecoverCombine()
    }, [])

    if(loading)
        return <View>
            <Text style={ds.textLg}>Loading...</Text>
        </View>

    return <View>
        <Text style={ds.textXl}>Recover Progress</Text>
        {recoverCombine === null ?
            <Text style={ds.text}>Get participant to share the manifest</Text> :
            <Text style={ds.text}>Manifest received</Text>
        }
    </View> 
}