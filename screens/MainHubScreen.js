import { View, Text, Pressable, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { DEV, ROUTES } from '../config'
import { TopGradient } from '../components'

function MainHubScreen(props) {
    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Main Hub</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>
                <Pressable style={[ds.button, ds.blueButton, tw`w-100`]}
                    onPress={() => props.clearMessagesFetchInterval()}>
                    <Text style={ds.buttonText}>Stop Fetch Message</Text>
                </Pressable>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
                    onPress={() => console.log('Test B')}>
                    <Text style={ds.buttonText}>Test B</Text>
                </Pressable>
            </View>
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}

                onPress={() => props.navigation.navigate(ROUTES.DevHasVaultRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
            {/* <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                <Text style={ds.buttonText}>Create Vault</Text>
            </Pressable> */}
        </View>
    </View>
}

export default MainHubScreen