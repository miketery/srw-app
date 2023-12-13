import { Pressable, Text, View } from 'react-native';

import ds from '../assets/styles';
import tw from '../lib/tailwind';

import MainContainer from '../components/MainContainer';
import { useSessionContext } from '../contexts/SessionContext';
import actionMap, { consoleLogAction } from '../models/NotificationActions';
import { DEV } from '../config';


function NotificationActions({ actions, notification, manager }) {
    return actions.map((action, index) => {
        return <Pressable key={index} style={[ds.buttonSm, ds.blueButton, tw`ml-1 p-1 rounded-full`]}
            onPress={() => action.action(notification, manager)}>
            <Text style={ds.buttonTextSm}>{action.title}</Text>
        </Pressable>
    })
}


function NotificationRow(props) {
    const { notification, manager } = props
    const { title, short_text, detailed_text } = notification.data
    let actions = []
    if(Object.keys(actionMap).includes(notification.type))
    actions = actionMap[notification.type]
    if(DEV)
        actions = [consoleLogAction, ...actions]
    return <View style={tw`flex flex-col items-start justify-center p-1 mb-1 bg-slate-600`}>
        <View style={tw`mr-1`}>
            <Text style={ds.textLg}>{title}</Text>
        </View>
        <View style={tw`flex flex-col`}>
            <Text style={ds.text}>{detailed_text}</Text>
        </View>
        <View style={tw`flex flex-row justify-end w-full`}>
            <NotificationActions actions={actions} notification={notification} manager={manager} />
        </View>
    </View>
}

function NotificationsScreen({notifications}) {
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

export default NotificationsScreen