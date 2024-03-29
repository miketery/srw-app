
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.sendInviteId": { type: "done.invoke.sendInviteId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.sendInviteId": { type: "error.platform.sendInviteId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "sendInvite": "done.invoke.sendInviteId";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "save": "ACCEPT" | "DECLINE" | "done.invoke.sendInviteId";
"sendInviteError": "error.platform.sendInviteId";
"triggerParent": "ACCEPT" | "DECLINE" | "done.invoke.sendInviteId";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "sendInvite": "REDO" | "RESEND_INVITE" | "SEND_INVITE";
        };
        matchesStates: "ACCEPTED" | "DECLINED" | "FINAL" | "PENDING" | "SENDING_INVITE" | "START";
        tags: never;
      }
  