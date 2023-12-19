import React from 'react'
import { StyleSheet } from 'react-native'
import tw from '../lib/tailwind'

const ds = StyleSheet.create({
    startContainer: tw`bg-xdarkblue h-full p-3 pt-14`,

    mainContainerPt: tw`bg-xdarkblue h-full p-3 pb-20 pt-14`,
    mainContainerPtGradient: tw`bg-xdarkblue h-full pb-15`, // scroll view inside has pt-14

    scrollViewGradient: tw`pb-26 pt-11 h-100`,
    mainBody: tw`bg-xdarkblue p-3 h-100`,

    headerRow: tw`flex-row justify-between items-center mb-2`,
    header: tw`text-slate-200 text-3xl pb-3`,
    
    text: tw`text-slate-200`,
    textSm: tw`text-slate-200 text-sm`,
    textXs: tw`text-slate-200 text-xs`,
    textLg: tw`text-slate-200 text-lg`,
    textXl: tw`text-slate-200 text-xl`,
    text2xl: tw`text-slate-200 text-2xl`,
    text3xl: tw`text-slate-200 text-3xl`,
    label: tw`text-slate-300 text-lg mb-1`,
    labelB: tw`text-slate-300 text-xl mb-1`,

    input: tw`grow-1 bg-slate-800 p-3 mb-2 text-xl text-slate-200 border border-slate-500 select:border`,
    inputContainer: tw`mb-2`,
    
    xlabel: tw`text-neutral-400 text-base`,
    animatedLabel: tw`text-neutral-400 text-base ml-4`,
    
    xinput: tw`w-full p-4 bg-neutral-800 bg-opacity-80 rounded-lg border border-neutral-200 text-neutral-200 text-base`,
    animatedInput: tw`w-full px-4 pt-5 pb-3 bg-neutral-800 bg-opacity-80 rounded-lg border border-neutral-200 text-neutral-200 text-base`,

    xcta: tw`p-3 rounded-full w-full content-center justify-center items-center`,
    xctaText: tw`text-neutral-200 text-center text-base font-bold`,

    ctaButton: tw`py-2 rounded-full bg-sky-600 w-full content-center justify-center items-center`,
    createButton: tw`py-2 rounded-full bg-midpurple w-full content-center justify-center items-center`,

    largeCircle: tw`h-20 w-20 rounded-full items-center justify-center`,
    mediumCircle: tw`h-16 w-16 rounded-full items-center justify-center`,
    smallCircle: tw`h-11 w-11 rounded-full items-center justify-center`,

    buttonArrow: tw`items-center w-10 rounded-md p-2 bg-slate-600`,

    button: tw`py-2 rounded-md bg-slate-600 w-40 content-center justify-center items-center`,
    buttonSm: tw`py-2 rounded-md bg-slate-600 w-30 content-center justify-center items-center`,
    buttonXs: tw`py-1 rounded-sm bg-slate-600 w-24 content-center justify-center items-center`,
    buttonTiny: tw`px-1 ml-1 rounded-sm bg-slate-600 content-center justify-center items-center`,
    
    buttonText: tw`text-slate-100 text-center text-xl font-normal`,
    buttonTextSm: tw`text-slate-200 text-center text-base font-normal`,
    
    blueButton: tw`bg-blue-800`,
    lightblueButton: tw`bg-sky-600`,
    greenButton: tw`bg-green-700`,
    redButton: tw`bg-red-800`,
    purpleButton: tw`bg-violet-900`,
    orangeButton: tw`bg-amber-500`,

    disabled: tw`bg-slate-600 opacity-30`,

    rows: tw`flex-col w-full`,
    card: tw`bg-slate-700 rounded-lg p-3 mb-2`,
    row: tw`flex flex-row rounded-lg p-3 mb-2 bg-slate-700`,
    buttonRow: tw`w-full flex-row justify-between items-center my-2`,
    buttonRowB: tw`-mt-16 items-end pb-4 flex-row px-3 h-11`,
    
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

    formVC: tw`bg-gray-200 rounded p-2 mb-2`,
    labelVC: tw`mt-2`,
    labelVCSm: tw`text-xs text-gray-500 italic`,
    valueVC: tw`text-lg`,
    monoKeyVC: tw`font-mono text-blue-500 font-bold`,
    staticBoxVC: tw`bg-gray-300 border p-2`,
    dynamicBoxVC: tw`bg-gray-100 border p-2`,
})

export default ds;
