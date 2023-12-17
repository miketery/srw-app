import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../assets/styles';
import tw from '../lib/tailwind';

import MainContainer from '../components/MainContainer';
import { useSessionContext } from '../contexts/SessionContext';
import actionMap, { NotificationAction, consoleLogAction } from '../models/NotificationActions';
import { DEV } from '../config';
import VaultManager from '../managers/VaultManager';
import Notification from '../models/Notification';

const notificationTypeStyleMap: { [k in string]: {
    background: any,
    icon: string,
}} = {
    'contact.request': {
        background: tw`bg-xmidblue`,
        icon: 'person-add-outline',
    },
    'contact.accept': {
        background: tw`bg-xgreen`,
        icon: 'person-add-outline',
    },
    'app.test': {
        background: tw`bg-xmidpurple`,
        icon: 'logo-react',
    },
    'app.info': {
        background: tw`bg-slate-700`,
        icon: 'logo-react',
    },
    'app.alert': {
        background: tw`bg-xyellow`,
        icon: 'logo-react',
    },
    'app.warning': {
        background: tw`bg-xyellow`,
        icon: 'warning',
    },
    'recoverSplit.invite': {
        background: tw`bg-xmidblue`,
        icon: 'shield-outline',
    },
    'recoverSplit.accept': {
        background: tw`bg-xgreen`,
        icon: 'shield-outline',
    },
    'recoverSplit.decline': {
        background: tw`bg-xred`,
        icon: 'shield-outline',
    },
    'recoverCombine.manifest': {
        background: tw`bg-xmidblue`,
        icon: 'shield-outline',
    },
    'recoverCombine.request': {
        background: tw`bg-xmidblue`,
        icon: 'shield-outline',
    },
    'recoverCombine.accept': {
        background: tw`bg-xgreen`,
        icon: 'shield-outline',
    },
    'recoverCombine.decline': {
        background: tw`bg-xred`,
        icon: 'shield-outline',
    },
}

function NotificationActions({ actions, notification, manager }: {
    actions: NotificationAction[],
    notification: Notification,
    manager: VaultManager,
}) {
    return actions.map((action, index) => {
        const style = [
            tw`ml-2 px-4 rounded-full`,
            action.style && action.style.background ? action.style.background : tw`bg-blue-800`,
        ]
        const textStyle = [
            ds.buttonTextSm,
            action.style && action.style.text ? action.style.text : {},
        ]
        return <Pressable key={index} style={style}
            onPress={() => action.action(notification, manager)}>
            <Text style={textStyle}>{action.title}</Text>
        </Pressable>
    })
}


function NotificationRow(props: { notification: Notification, manager: VaultManager }) {
    const { notification, manager } = props
    const { title, short_text, detailed_text } = notification.data
    const iconStyle = [
        notificationTypeStyleMap[notification.type].background,
        ds.mediumCircle
    ]
    const icon = notificationTypeStyleMap[notification.type].icon
    let actions = []
    if(Object.keys(actionMap).includes(notification.type))
        actions = actionMap[notification.type]
    if(DEV)
        actions = [consoleLogAction, ...actions]
    return <View style={tw`flex flex-row items-center mb-1 pt-2 pb-4 border-b border-slate-400 w-full`}>
        <View style={iconStyle}>
            <Icon name={icon} size={22} color='white' style={tw`text-center`} />
        </View>
        <View style={tw`flex flex-col ml-2 grow-1`}>
            <View style={tw`mr-1`}>
                <Text style={ds.textLg}>{title}</Text>
            </View>
            <View style={tw``}>
                <Text style={ds.text}>{detailed_text}</Text>
            </View>
            <View style={tw`flex flex-row justify-end w-full mt-2`}>
                <NotificationActions actions={actions} notification={notification} manager={manager} />
            </View>
        </View>
    </View>
}

const NotificationsListScreen = ({notifications}: {notifications: Notification[]}) => {
    const {manager} = useSessionContext()

    const header = 'Notifications'
    const buttonRow = <></>

    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        <View>
            <Text style={ds.text}>These are auto generated every few seconds at random</Text>
        </View>
        <View>
            {notifications.map((notification) => {
                return <NotificationRow 
                    key={notification.pk}
                    notification={notification}
                    manager={manager} 
                />
            })}
        </View>
    </MainContainer>
}

export default NotificationsListScreen