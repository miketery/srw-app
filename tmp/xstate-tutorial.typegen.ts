
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "offline" | "online";
        tags: never;
      }

export interface Typegen1 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.incrementChild": { type: "done.invoke.incrementChild"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.incrementChild": { type: "error.platform.incrementChild"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "incrementChild": "done.invoke.incrementChild";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "incrementChild": "INCREMENT_CHILD";
        };
        matchesStates: "incrementing" | "sleep" | "waiting";
        tags: never;
      }
  