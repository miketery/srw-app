import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, View, Animated, Pressable } from 'react-native';

import ds from '../assets/styles';
import tw from '../lib/tailwind';

export const MyTextInput = (props) => {
    const {label, value, onChangeText, placeholder} = props
    return <View style={ds.inputContainer}>
        <Text style={ds.text}>{label}</Text>
        <TextInput
            style={ds.input}
            placeholder={placeholder}
            placeholderTextColor={tw.color('gray-400')}
            placeholderStyle={tw`italic`}
            value={value}
            onChangeText={onChangeText}
        />
    </View>
}

type XTextInputProps = {
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: boolean,
    placeholder?: string,
    multiline?: boolean,
}

export const XTextInput = (props: XTextInputProps) => {
    const {label, value, onChangeText, error, placeholder, multiline} = props

    const [isFocused, setIsFocused] = useState(false);

    const style = [
        ds.xinput,
        isFocused ? tw`border-2 border-cyan-400`: null,
        error ? tw`border-2 border-red-600`: null,
        // when not border-2, we need to add margin to compensate
        isFocused || error ? null : {marginVertical: '1px', marginHorizontal: '1px'},
        multiline ? tw`h-36` : null,
    ]
    
    return <View style={ds.inputContainer}>
        <Text style={ds.xlabel}>{label}</Text>
        <TextInput
            style={style}
            placeholder={placeholder}
            placeholderTextColor={tw.color('neutral-400')}
            // placeholderStyle={tw`italic`}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
        />
    </View>
}

type AnimatedLabelInputProps = {
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error: boolean,
    multiline?: boolean,
}


export const AnimatedLabelInput = (props: AnimatedLabelInputProps) => {
    const { label, value, onChangeText, error, multiline } = props

    const [isFocused, setIsFocused] = useState(false);
    const labelPosition = useRef(new Animated.Value(0)).current;
    const inputRef = useRef(null);

    useEffect(() => {
      Animated.timing(labelPosition, {
        toValue: isFocused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, value, labelPosition]);
  
    const labelStyle = {
      position: 'absolute',
      left: 2,
      top: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 1],
      }),
      fontSize: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
    //   color: labelPosition.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['#999', '#000'],
    //   }),
    };
    const style = [
        ds.animatedInput,
        isFocused ? tw`border-2 border-cyan-400`: null,
        error ? tw`border-2 border-red-600`: null,
        // when not border-2, we need to add margin to compensate
        isFocused || error ? null : {marginVertical: '1px', marginHorizontal: '1px'},
    ]
  
    return (
        <View style={tw`relative`}>
            <TextInput
                ref={inputRef}
                style={style}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={onChangeText}
                value={value}
                multiline={multiline}
            />
            <Animated.Text style={[ds.animatedLabel, labelStyle, error ? tw`text-red-600` : null]}>
                <Pressable onPress={() => inputRef.current.focus()}>
                    <Text>{label}</Text>
                </Pressable>
            </Animated.Text>
        </View>
    );
};
  