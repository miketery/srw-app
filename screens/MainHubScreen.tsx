import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard';

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { ROUTES } from '../config'

import { useSessionContext } from '../contexts/SessionContext'

import MainContainer from '../components/MainContainer'
import RecoverVaultHub from './RecoverVault/RecoverVaultHub'
import { DevButton } from '../components/Button'
import VaultManager from '../managers/VaultManager'
import { Info } from '../components'

type MainHubScreenProps = {
    navigation: any
}

type Tile = {
    title: string,
    onPress: (props: MainHubScreenProps) => void,
    managerName: string,
    countFunctionName: string,
    zeroLength: string[],
    background: any,
    infoBackground?: any,
}

type WizardTileProps = {
    navigation: any,
    tile: Tile,
    manager: VaultManager
}


const tiles: Tile[] = [
    {
        title: 'Contacts',
        onPress: ({navigation}) => navigation.navigate(ROUTES.ContactsRoute),
        managerName: 'contactsManager',
        countFunctionName: 'length',
        zeroLength: ['No Contacts', 'Add a contact or share your short code so they can add you.'],
        background: tw`bg-blue-700 border-2 border-blue-400`,
        infoBackground: tw`bg-blue-900`,
    },
    {
        title: 'Secrets',
        onPress: ({navigation}) => navigation.navigate(ROUTES.SecretsRoute),
        managerName: 'secretsManager',
        countFunctionName: 'length',
        zeroLength: ['No Secrets', 'Add a secret to get started.'],
        background: tw`bg-purple-700 border-2 border-purple-400`,
        infoBackground: tw`bg-purple-900`,
    },
    {
        title: 'Recoveries',
        onPress: ({navigation}) => navigation.navigate(ROUTES.RecoverSplitRoute),
        managerName: 'recoverSplitsManager',
        countFunctionName: 'length',
        zeroLength: ['No Recoveries', 'Create a recovery with your contacts so you can recover your vault!'],
        background: tw`bg-green-700 border-2 border-green-400`,
        infoBackground: tw`bg-green-900`,
    },
    {
        title: 'Guardians',
        onPress: ({navigation}) => navigation.navigate(ROUTES.RecoverSplitRoute),
        managerName: 'guardiansManager',
        countFunctionName: 'length',
        zeroLength: ['No Guardians', 'Have your contacts use your in their recoveries so you can be their guardian.'],
        background: tw`bg-yellow-500 border-2 border-yellow-300`,
        infoBackground: tw`bg-yellow-700`,
    }
]

const tileStyle = tw`flex w-full rounded-md px-4 py-4 mb-4`
const tileTextStyle = tw`text-white text-5xl font-bold italic `

const WizardTile: React.FC<WizardTileProps> = ({navigation, manager, tile}) => {
    const count = manager[tile.managerName][tile.countFunctionName]
    return <Pressable onPressOut={() => tile.onPress({navigation})}>
        <View style={[tileStyle, tile.background]}>
            <View style={tw`flex flex-row w-full`}>
                <View style={tw`mr-4`}>
                    <Text style={tileTextStyle}>{count}</Text>
                </View>
                <View style={tw`flex-grow-1`} />
                <Text style={tileTextStyle}>{tile.title}</Text>
            </View>
            { count === 0 && <View style={tw`-mb-4`}>
                <Info header={tile.zeroLength[0]} msg={tile.zeroLength[1]} containerStyle={tile.infoBackground} />
                {/* <Text style={ds.textSm}>{tile.zeroLength[0]}</Text>
                <Text style={ds.textSm}>{tile.zeroLength[1]}</Text> */}
            </View>}
        </View>
    </Pressable>
}


const ProfileHeaderRow = ({vault, navigation}) => {
    const [copied, setCopied] = React.useState(false)
    const copy = () => {
        Clipboard.setString(vault.short_Code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
    }

    const shortCode = vault.short_code
    const headerRow = <>
        <Pressable onPressOut={() => navigation.navigate(ROUTES.ProfileRoute)}>
            <View style={tw`flex flex-row mb-4`}>
                <View style={[ds.mediumCircle, tw`bg-purple-700 mr-4`]}>
                    <Icon name='person' size={34} color='white' />
                </View>
                <View style={tw`flex flex-column items-start justify-center`}>
                    <Text style={tw`text-white text-2xl font-bold`}>{vault.name}</Text>
                    {shortCode && <Pressable onPress={() => copy()} style={tw`flex-row items-center mt-1`}>
                        <View style={tw`flex flex-row items-center bg-slate-600 p-1 rounded-lg `}>
                            <Text style={tw`text-cyan-400 mr-2`}>{shortCode}</Text>
                            <Icon name='copy-outline' size={15} color='rgb(34, 211, 238)' />
                        </View>
                        {copied && <Text style={tw`text-white text-xs ml-2`}>Copied!</Text>}
                    </Pressable>}
                </View>
            </View>
        </Pressable>
    </>
    return headerRow
}


const MainHubScreen: React.FC<MainHubScreenProps> = ({navigation}) => {
    const {vault, manager} = useSessionContext()

    const recoveryMode = vault.recovery

    const recoveryHeader = '⚠️ Recovering Vault ⚠️'

    const buttonRow = <>
        <DevButton onPressOut={() => navigation.navigate(ROUTES.DevHasVaultRoute)} />
        <View style={tw`flex-grow-1`} />
    </>

    if(recoveryMode) return <MainContainer color='blue' header={recoveryHeader} buttonRow={buttonRow}>
        <RecoverVaultHub 
            vault={vault}
            manager={manager}
            navigation={navigation}/>
    </MainContainer>

    return <MainContainer color='blue' header={null} buttonRow={buttonRow}>
        <ProfileHeaderRow vault={vault} navigation={navigation} />
        {tiles.map((tile, i) => 
            <WizardTile key={i} 
                navigation={navigation}
                manager={manager} 
                tile={tile} 
            />)}
        <View style={tw`flex-grow-1`} />
    </MainContainer>
}

export default MainHubScreen