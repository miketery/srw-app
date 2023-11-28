import { Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import ds from '../../assets/styles'
import RecoverVaultUtil from '../../managers/RecoverVaultUtil'
import RecoverCombine, { RecoverCombineState } from '../../models/RecoverCombine'


const RecoverVaultStatus = ({recoverCombine}: {recoverCombine: RecoverCombine}) => {
    console.log('XXX', RecoverCombineState)
    return <View>
        <Text style={ds.text}>Get participant to share the manifest</Text>
        <Text style={ds.text}>{recoverCombine.state}</Text>
        <View>
            {recoverCombine.combinePartys.map((party, i) => {
                return <View key={i} style={ds.row}>
                    <Text style={ds.text}>{party.name}</Text>
                    <Text style={ds.text}>{party.state}</Text>
                </View>
            })}
        </View>
    </View>
}

export default function RecoverVaultHubScreen({navigation, vault, manager}) {
    // fetch RecoverCombine
    const [loading, setLoading] = useState(true)
    const [recoverCombine, setRecoverCombine] = useState(null)

    useEffect(() => {
        const fetchRecoverCombine = async () => {
            const data = manager.recoverCombine
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
        {recoverCombine !== null && <RecoverVaultStatus recoverCombine={recoverCombine} />}
        {recoverCombine.state === RecoverCombineState.MANIFEST_LOADED && <View>
            <Pressable style={[ds.buttonSm, ds.purpleButton]} onPress={() => recoverCombine.fsm.send('SEND_REQUESTS')}>
                <Text style={ds.buttonTextSm}>Send Requests for Shares</Text>
            </Pressable>
        </View>}
    </View>
}