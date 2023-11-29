
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.sendRequestId": { type: "done.invoke.sendRequestId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.sendRequestId": { type: "error.platform.sendRequestId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "sendRequest": "done.invoke.sendRequestId";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "save": "ACCEPT" | "DECLINE" | "done.invoke.sendRequestId" | "error.platform.sendRequestId" | "xstate.init";
"sendRequestError": "error.platform.sendRequestId";
"triggerParent": "ACCEPT" | "DECLINE" | "done.invoke.sendRequestId";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "sendRequest": "REDO" | "REQUEST" | "RESEND_INVITE" | "RESEND_REQUEST";
        };
        matchesStates: "ACCEPTED" | "DECLINED" | "FINAL" | "PENDING" | "SENDING_REQUEST" | "START";
        tags: never;
      }
  