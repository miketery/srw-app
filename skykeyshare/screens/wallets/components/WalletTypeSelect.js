import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../../../lib/tailwind'
import ds from '../../../assets/styles';
import { WalletTypes } from '../../../classes/Wallet';

// const gradient = {
//     'background': 'rgb(124,0,255)',
//     'background': 'linear-gradient(45deg, rgba(84,0,173,1) 30%, rgba(255,7,7,1) 100%)',
// }
const buttonStyle = [ds.neoDarkPurpleButton, tw`w-2/3 p-3 py-5 my-3`, ]

export const WalletTypeSelect = (props) => {
    return <View style={tw`flex-col justify-center`}>
        <Text style={ds.header}>Wallet Type</Text>
        <View style={tw`flex-col items-center my-16`}>
            <Pressable style={buttonStyle} onPress={() => props.setWalletType(WalletTypes.BASIC)}>
                <View style={tw`items-center`}>
                    <Text style={ds.buttonText}>Basic / Personal</Text>
                    <View style={tw`flex-row my-4`}>
                        <Icon name='person-outline' color='white' size={30} />
                    </View>
                    <Text style={tw`text-sm text-slate-200 text-center`}>
                        A personal wallet to send and receive funds.
                    </Text>
                </View>
            </Pressable>
            <Pressable style={buttonStyle} onPress={() => props.setWalletType(WalletTypes.SMART)}>
                <View style={tw`items-center`}>
                    <Text style={ds.buttonText}>Smart / Multi-Party</Text>
                    <View style={tw`flex-row my-4 w-30 justify-between`}>
                        <Icon name='code-slash-outline' color='white' size={30} />
                        <Icon name='people-outline' color='white' size={30} />
                        <Icon name='timer-outline' color='white' size={30} />
                    </View>
                    <Text style={tw`text-sm text-slate-200 text-center`}>
                        Multi-Signature, timelocks, conditional logic, and more.
                    </Text>
                </View>
            </Pressable>
        </View>
    </View>
}

