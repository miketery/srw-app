
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.combineSharesAndDecryptId": { type: "done.invoke.combineSharesAndDecryptId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.combineSharesAndDecryptId": { type: "error.platform.combineSharesAndDecryptId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "combineSharesAndDecrypt": "done.invoke.combineSharesAndDecryptId";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "save": "" | "FINALIZE" | "LOAD_MANIFEST" | "RECOVER" | "SEND_REQUESTS" | "SENT" | "done.invoke.combineSharesAndDecryptId" | "error.platform.combineSharesAndDecryptId" | "xstate.init";
"sendRequests": "SEND_REQUESTS";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "allRequestsSent": "";
        };
        eventsCausingServices: {
          "combineSharesAndDecrypt": "RECOVER";
        };
        matchesStates: "ERROR_RECOVERING" | "FINAL" | "MANIFEST_LOADED" | "RECOVERING" | "SENDING_REQUESTS" | "START" | "WAITING_ON_PARTICIPANTS";
        tags: never;
      }
  