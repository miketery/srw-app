
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.sendAcceptId": { type: "done.invoke.sendAcceptId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.sendInviteId": { type: "done.invoke.sendInviteId"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.sendAcceptId": { type: "error.platform.sendAcceptId"; data: unknown };
"error.platform.sendInviteId": { type: "error.platform.sendInviteId"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "sendAccept": "done.invoke.sendAcceptId";
"sendInvite": "done.invoke.sendInviteId";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "save": "ACCEPTED" | "done.invoke.sendAcceptId" | "done.invoke.sendInviteId";
"sendAcceptError": "error.platform.sendAcceptId";
"sendInviteError": "error.platform.sendInviteId";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isInviteExpired": "always";
        };
        eventsCausingServices: {
          "sendAccept": "ACCEPT";
"sendInvite": "REQUEST" | "RESEND_INVITE";
        };
        matchesStates: "ARCHIVED" | "BLOCKED" | "CAN_RESEND_INVITE" | "ESTABLISHED" | "INBOUND" | "INIT" | "PENDING" | "REJECTED" | "SENDING_ACCEPT" | "SENDING_INVITE";
        tags: never;
      }
  