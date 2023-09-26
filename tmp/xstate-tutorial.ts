import { createMachine, interpret, assign, spawn, sendTo, AnyActorRef, AnyEventObject } from 'xstate';

const child = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgGMALASwBsJ8QAHLWEgFxKwyoA9EBGAJnQE8u3ZMORA */
    id: 'child',
    initial: 'offline',
    strict: true,
    tsTypes: {} as import("./xstate-tutorial.typegen").Typegen0,
    context: {
        count: 0,
    },
    schema: {
        services: {} as {
            incrementChild: {
                data: void;
            },
        }
    },
    states: {
        offline: {
            on: {
                WAKE: 'online'
            },
        },
        online: {
            on: {
                SLEEP: 'offline',
                INCREMENT: {
                    actions: assign({
                        count: (context) => context.count + 1
                    }),
                },
            },
        },
    },
})

const parent = createMachine({
    id: 'parent',
    initial: 'waiting',
    context: {
        kinder: [] as AnyActorRef[],
        errorCount: 0,
        successCount: 0,
    },
    tsTypes: {} as import("./xstate-tutorial.typegen").Typegen1,
    states: {
        waiting: {
            on: {
                ADD: {
                    actions: assign({
                        kinder: (context, event) => {
                            return [...context.kinder, spawn(child)]
                        }
                    })
                },
                WAKE_CHILD: {
                    actions: sendTo((context, event: AnyEventObject) => {
                        try{
                            return context.kinder[event.id]
                        } catch (e) {
                            console.log(e)
                        }
                        return null
                    }, { type: 'WAKE' })
                },
                INCREMENT_CHILD: {
                    target: 'incrementing',
                },
                SLEEP_CHILD: {
                    actions: sendTo((context, event: AnyEventObject) => 
                        context.kinder[event.id], { type: 'SLEEP' })
                },
                SLEEP: 'sleep',
            },
        },
        incrementing: {
            invoke: {
                id: 'incrementChild',
                src: 'incrementChild',
                onDone: {
                    target: 'waiting',
                    actions: [
                        (context, event) => {
                            // console.log('\tonDone', event)
                        },
                        assign({
                            successCount: (context, event) => context.successCount + 1
                        })
                    ]
                },
                onError: {
                    target: 'waiting',
                    actions: [
                        (context, event) => {
                            // console.log('\tonError', event)
                        },
                        assign({
                            errorCount: (context, event) => context.errorCount + 1
                        })
                    ]
                },
            }    
        },
        sleep: {
            on: {
                WAKE: 'waiting'
            },
        }
    },
}, {
    services: {
        incrementChild: async (context, event: {id: number}): Promise<void> => {
            // console.log(context, event)
            return new Promise((resolve, reject) => {
                try{
                    // console.log('trying', event.id)
                    // sendTo(context.kinder[event.id], { type: 'INCREMENT' })
                    const y: any= context.kinder[event.id].send('INCREMENT')
                    console.log(y.changed)
                    if(!y.changed)
                        throw new Error('not changed')
                } catch (e) {
                    // reject(e)
                    // reject(e)
                    console.log('error')
                    throw e
                    // resolve(context.kinder)
                }
                console.log('resolve')
                resolve()
            })
        }
    }
})
const x = async () => {
    const TO_ms = 100;
    const parentService = interpret(parent);
    parentService.onTransition((state, event) => {
        if(event.type != 'done.invoke.incrementChild')
            console.log(state.context.kinder.length,
            state.context.errorCount, state.context.successCount, 
            state.value, state.changed, event)
    })
    parentService.start();

    parentService.send("ADD");
    parentService.send("ADD");
    parentService.send("WAKE_CHILD", {id: 0});
    
    parentService.send("INCREMENT_CHILD", {id: 0});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 1});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms)) //1

    // console.log(x)
    parentService.send("WAKE_CHILD", {id: 1});
    parentService.send("WAKE_CHILD", {id: 2}); // wouldnt detect

    parentService.send("INCREMENT_CHILD", {id: 1});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms)) // 2

    parentService.send("INCREMENT_CHILD", {id: 0});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    // parentService.send("SLEEP");
    parentService.send("ADD");
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms)) // ???
    console.log('errorCount', parentService.getSnapshot().context.errorCount)
    

    parentService.send("WAKE_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 1});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 0});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))


    parentService.send("SLEEP_CHILD", {id: 2});

    parentService.send("INCREMENT_CHILD", {id: 1});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    parentService.send("INCREMENT_CHILD", {id: 2});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))

    const b = parentService.send("INCREMENT_CHILD", {id: 0});
    await new Promise((resolve) => setTimeout(resolve, TO_ms))


    const getContext = (a: AnyActorRef) => a.getSnapshot().context
    const getChild = (a: AnyActorRef, i: number) => getContext(a).kinder[i]
    const getChildContextAndState = (a: AnyActorRef, i: number) => [getContext(getChild(a, i)), getChild(a, i).getSnapshot().value]
    
    setTimeout(() => {
        console.log(getChildContextAndState(parentService, 0))
        console.log(getChildContextAndState(parentService, 1))
        console.log(getChildContextAndState(parentService, 2))
        const [successCount, errorCount] = [parentService.state.context.successCount, parentService.state.context.errorCount]
        console.log(successCount, errorCount)
        console.log(b)
    }, 1000)



}
x()