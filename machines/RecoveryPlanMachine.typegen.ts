
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.splitKeyId": { type: "done.invoke.splitKeyId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.splitKeyId": { type: "error.platform.splitKeyId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "splitKey": "done.invoke.splitKeyId";
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
          "allPartysAccepted": "allAccepted";
        };
        eventsCausingServices: {
          "splitKey": "SPLIT_KEY";
        };
        matchesStates: "ARCHIVED" | "DRAFT" | "FINAL" | "READY" | "READY_TO_SEND_INVITES" | "SENDING_INVITES" | "SPLITTING_KEY" | "WAITING_ON_PARTICIPANTS";
        tags: never;
      }
  