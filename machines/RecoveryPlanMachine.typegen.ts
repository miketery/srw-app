
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
          guards: "minParticipantsAccepted";
          services: never;
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "allParticipantsAccepted": "allAccepted";
"minParticipantsAccepted": "forceReady";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "ARCHIVED" | "DRAFT" | "FINAL" | "READY" | "WAITING_ON_PARTICIPANTS";
        tags: never;
      }
  