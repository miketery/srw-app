import React from 'react'
import { StyleSheet } from 'react-native'
import tw from '../lib/tailwind'

const ds = StyleSheet.create({
    fullConatiner: tw`bg-midnight h-full p-3`,
    mainContainerPt: tw`bg-midnight h-full p-3 pb-24 pt-14`,
    mainContainerPtNoNav: tw`bg-midnight h-full p-3 pb-7 pt-14`,
    mainContainerPtGradient: tw`bg-midnight h-full p-3 pb-24`,
    mainContainer: tw`bg-midnight h-full p-3 pb-24`,
    scrollViewGradient: tw`pb-16 pt-11`,
    container: tw`flex-col w-full mb-2`,
    header: tw`text-slate-200 text-3xl pb-3`,
    text: tw`text-slate-200`,
    textSm: tw`text-slate-200 text-sm`,
    textXs: tw`text-slate-200 text-xs`,
    textLg: tw`text-slate-200 text-lg`,
    textXl: tw`text-slate-200 text-xl`,
    text2xl: tw`text-slate-200 text-2xl`,
    text3xl: tw`text-slate-200 text-3xl`,
    smallLabel: {
        color: '#ddd',
        fontSize: 14,
    },
    titleContainer: {
        backgroundColor: '#333',
        width: '100%',
        marginBottom: 25
    },
    title: {
        fontSize: 32,
        color: '#eee',
        textAlign: 'left',
    },
    button: tw`py-2 rounded-lg bg-slate-600 w-40 content-center	justify-center items-center`,
    buttonSm: tw`py-2 rounded-lg bg-slate-600 w-30 content-center justify-center items-center`,
    buttonXs: tw`py-1 rounded-lg bg-slate-600 w-24 content-center justify-center items-center`,
    buttonText: tw`text-slate-200 text-center text-xl font-normal`,
    buttonTextSm: tw`text-slate-200 text-center text-base font-normal`,
    blueButton: tw`bg-blue-800`,
    greenButton: tw`bg-green-700`,
    redButton: tw`bg-red-800`,
    purpleButton: tw`bg-violet-900`,
    orangeButton: tw`bg-amber-500`,
    label: tw`text-slate-300 text-lg mb-1`,
    labelB: tw`text-slate-300 text-xl mb-1`,
    input: tw`grow-1 bg-slate-800 p-3 mb-2 text-xl text-slate-200 border border-slate-500 select:border`,
    formButtonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    rows: tw`flex-col w-full`,
    row: tw`flex flex-row rounded-lg p-3 mb-2 bg-slate-700`,
    buttonRow: tw`w-full flex-row justify-between items-center mt-2`,
    rowEnd: tw`flex-row justify-end`,
    rowStart: tw`flex-row justify-start`,
    rowSpaceBetween: tw`flex flex-row justify-between`,
    rowCenter: tw`flex-row justify-center`,
    rowEvenly: tw`flex-row justify-evenly`,
    rowAround: tw`flex-row justify-around`,

    neoDarkPurpleButton: tw`bg-darkpurple border border-lightpurple p-2 w-40 items-center justify-center content-center`,
    neoDarkGreenButton: tw`bg-darkgreen border border-[#0C0] p-2 w-40 items-center justify-center content-center`,
    neoDarkRedButton: tw`bg-darkred border border-lightred p-2 w-40 items-center justify-center content-center`,
    neoDarkBlueButton: tw`bg-darkblue border border-lightblue p-2 w-40 items-center justify-center content-center`,

    blueCopyBox: tw`flex-row p-2 bg-darkblue border border-lightblue items-center rounded-lg flex-shrink`,
    keyStyle: tw`text-blue-300 font-mono text-lg`,
    cardRowStyle: tw`flex flex-row items-start mb-4 pb-4 border-b-2 border-slate-500`,
})

export default ds