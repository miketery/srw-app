
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.sendResponseId": { type: "done.invoke.sendResponseId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.sendResponseId": { type: "error.platform.sendResponseId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "sendResponse": "done.invoke.sendResponseId";
        };
        missingImplementations: {
          actions: "save" | "sendResponseError";
          delays: never;
          guards: never;
          services: "sendResponse";
        };
        eventsCausingActions: {
          "save": "ARCHIVE" | "done.invoke.sendResponseId";
"sendResponseError": "error.platform.sendResponseId";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "sendResponse": "ACCEPT" | "DECLINE";
        };
        matchesStates: "ACCEPTED" | "ARCHIVED" | "DECLINED" | "INIT" | "SENDING_ACCEPT" | "SENDING_DECLINE";
        tags: never;
      }
  