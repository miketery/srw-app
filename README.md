# Social Recovery Wallet

## Overview

This is a Wallet / Vault application to support [self-sovereign identity (SSI)](https://en.wikipedia.org/wiki/Self-sovereign_identity) or User Owner Identity.

The goal is to create a digital identity using public key cryptography. The private key is then self custodied - i.e. no reliance on a third recoveryParty. The public key maps to a DID (Decentralized Identifier) (ref: [W3C DID](https://www.w3.org/TR/did-core/)).

Since this solution is self custody there needs to be a recovery mechanism. this is where the social recovery comes in. This leverages threshold cryptography. We use [Shamir Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing).

The wallet works in tandum with the digital agent, which is the online component of the wallet. It facilitates the transmition of messages between contacts (i.e. other users with wallets). Another term for the digital agent is [Decentrzlied Web Node (DWN)](https://identity.foundation/decentralized-web-node/spec/).

## Development

```
npm i
expo start --web
```

## Systems Overview

### Models

- [Vault](./models/Vault.ts), the user's identity and root keys, most other instances are associated with a vault
- [Contact](./models/Contact.ts), a connection between one user and another (ties DIDs and establishes a secure channel using contact specific keys)
- [Secret](./models/Secret.ts), a key / password / secret that is stored in the vault (e.g. 1password recovery phrase, btc seed phrase, etc)
- [Message](./models/Message.ts), represents a message sent between two users (encrypted using the vault public key, or contact specific key)
- [Notification](./models/Notification.ts), generated based on a message received from the digital agent (e.g. contact request, contact accept, invite for recovery manifest setup, etc.)

//TODO

- Recovery Manifest, is a recovery scheme with recoveryPartys and devices

### Managers

Each of the models has a manger for handling create, load, delete, save, and more.

- [VaultManager](./managers/VaultManager.ts) - "THE" manager, inits all other managers (accessible via context)
- [ContactsManager](./managers/ContactsManager.ts)
- [SecretsManager](./managers/SecretsManager.ts)
- [MessagesManager](./managers/MessagesManager.ts)
- [NotificationsManager](./managers/NotificationsManager.ts)

### Services

- [DigitalAgentService](./services/DigitalAgentService.ts), service for interacting with the digital agent (e.g. register, send message, get messages)
- [StorageService](./services/StorageService.ts), service for interacting with the local storage (e.g. save, load, delete) (since not using ORM and only have key value store, this is a simple wrapper around AsyncStorage)
- [SessionContext](./contexts/SessionContext.js), context for getting the current vault and manager
  (which has access to contacts, secrets, messages, and notifications managers)

//TODO

- Locking / Unlocking services

### State Machines

Using [XState](https://xstate.js.org/docs/guides/introduction-to-state-machines-and-statecharts/#states).

- [ContactMachine](./machines/ContactMachine.ts), state machine for managing the contact lifecycle (e.g. INIT, SENDING_INVITE, PENDING, ESTABLISHED, etc.)

//TODO

- RecoveryPlanMachine - setting up a social recovery scheme, need to track recovery manifest state, and state of recoveryPartys as they accept or reject participation. Potentially later need to track updates to a recovery.
- AppMachine (i.e. track state of the app) - e.g. first install, or vault is setup, locked, unlocked, in recovery mode

//Possible TODO

- MessageMachine or NotificationMachine - state machine for managing the retrieval of inbound messages and getting them to the right places to be actioned on

### Screens / UI Overview

- [App](./App.js), the main app component, handles top level routing
- [SplashScreen](./screens/SplashScreen.js), initilization of the app (TODO: show logo)
- [LandingScreen](./screens/LandingScreen.js), if no vault setup allow user to create vault or start recovery
  - [VaultCreateScreen](./screens/VaultCreateScreen.js), create a new vault
  - TODO: RecoverVault, recover an existing vault
- [HomeNav](./screens/HomeNav.js), container for app if user is accessing a vault
  - [TabBarNav](./screens/TabBarNav.js), container for the main tabs
  - [MainHubScreen](./screens/MainHubScreen.js),
  - [Contacts](./screens/Contacts/index.js), manage contacts
  - [Secrets](./screens/Secrets/index.js), manage secrets
  - [Notifications](./screens/NotificationsScreen.js), show notifications, and take action on them
  - TODO: Recoveries, show recoveries, my recovery manifests and where I am a guardian for others

//TODO

- Profile screen
- Unlock screen (probably from splash depending on state)
- Settings screen
