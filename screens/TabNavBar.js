import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { ROUTES, TAB_BAR_ROUTES } from '../config';

import tw from '../lib/tailwind'

const screenOptions = (route, isFocused, options) => {
    let iconName;
    let color = isFocused ? '#673ab7' : '#222'
  
    switch (route.name) {
        case ROUTES.MainHubRoute:
            iconName = isFocused ? 'flash' : 'flash-outline';
            break;
        case ROUTES.ContactsRoute:
            iconName = isFocused ? 'people' : 'people-outline';
            break;
        case ROUTES.SecretsRoute:
            iconName = isFocused ? 'key' : 'key-outline';
            break;
        case ROUTES.NotificationsRoute:
            iconName = isFocused ? 'notifications' : 'notifications-outline';
            break;
        default:
            iconName = 'logo-react'
            break;
    }
    return <Icon name={iconName} color={color} size={22}>
        {options.tabBarBadge ? 
        <View style={tw`absolute right-2 top-1 rounded-full bg-violet-800 p-2 h-3`}>
            <Text style={tw`text-xs text-slate-200 -mt-2 font-bold`}>{options.tabBarBadge}</Text>
        </View> : null}
    </Icon>;
};
  

export default function TabNavBar({ state, descriptors, navigation, possible_offline }) {
    const current_route_name = state.history[state.history.length - 1].key.split('-')[0]
    if(TAB_BAR_ROUTES[current_route_name].tabBarHide === true)
        return null
    return (<View style={tw`absolute bottom-0 w-full`}>
        <View style={tw`items-center w-full bg-slate-300 flex-row`}>
            {state.routes.map((route, index) => {
                if(TAB_BAR_ROUTES[route.name].tabBarIconHide === true)
                    return null
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({ name: route.name, merge: true });
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <Pressable
                        // accessibilityRole="button"
                        // accessibilityState={isFocused ? { selected: true } : {}}
                        // accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={tw`w-15 py-4 text-center justify-center flex-row grow-1 border-slate-800`}
                        key={route.key}
                    >
                        {screenOptions(route, isFocused, options)}
                        <Text style={[{ color: isFocused ? '#673ab7' : '#222' }, tw`text-xs`]}>
                            {/* {label} */}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
        {(possible_offline || false) && <View style={tw`-mt-4 bg-red-700 bottom-0 relative px-2`}>
            <Text style={tw`text-xs text-slate-200`}>Error connecting to server.</Text>
        </View>}
    </View>);
}
