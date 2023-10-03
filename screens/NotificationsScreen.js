import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../assets/styles';
import tw from '../lib/tailwind';
import { TopGradient } from '../components';

function NotificationRow(props) {
    const { title, long_text } = props.notification.data
    return <View style={tw`flex flex-col items-start justify-center py-1 mb-1 bg-slate-600`}>
        <View style={tw`mr-1`}>
            <Text style={ds.textLg}>{title}</Text>
        </View>
        <View style={tw`flex flex-column`}>
            <Text style={ds.text}>{long_text}</Text>
        </View>
    </View>
}

function NotificationsScreen({notifications}) {

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Notifications / TODO##</Text>
            </View>
            <View>
                <Text style={ds.text}>These are auto generated every few seconds at random</Text>
            </View>
            <View>
                {notifications.map((notification) => {
                    return <NotificationRow key={notification.pk} notification={notification} />
                })}
            </View>
        </ScrollView>
        <TopGradient />
    </View>
}

export default NotificationsScreen