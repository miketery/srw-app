import React from 'react'
import { View } from 'react-native'

import tw from '../../../lib/tailwind'

// Shows progress in flow using dots along a line
// Light up dots where $i <= current_step

export const StepsLine = (props) => {
    const total_steps = props.total_steps
    const current_step = props.current_step

    const genPoint = (step, current) => {
        const filled = step <= current
        const withLine = step > 0
        const point = <View key={'p'+step} style={[tw`rounded-full w-3 h-3`, 
            filled ? tw`bg-blue-400` : tw`bg-slate-700`]} />
        if(!withLine)
            return [point]
        const line = <View key={'l'+step} style={[tw`grow-2 h-1`,
            filled ? tw`bg-blue-400` : tw`bg-slate-700`]} />
        return [line, point]
    }
    let out = [] 
    for(let i=0; i < total_steps; i++) 
        out.push(genPoint(i, current_step - 1)) // normalize currentstep to i
    out.flat()
    return <View style={tw`w-full flex-row items-center justify-center mb-3 mt-3`}>
        <View style={tw`grow-1 -mr-1`} />
        {out}
        <View style={tw`grow-1`} />
    </View>
}