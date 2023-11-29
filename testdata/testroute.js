import { ROUTES } from "../config";

// When NO Vault && DEV pick route:
// Default -- ROUTES.LandingRoute
// Test    -- ROUTES.DevNoVaultRoute
const no_vault_test_route = {
  routes: [
    {name: ROUTES.LandingRoute},
    // {name: ROUTES.RecoverInitRoute},

    // {name: ROUTES.LandingRoute},
    // {
    //   name: ROUTES.DevNoVaultRoute,
    //   state: {
    //     routes: [
    //       {name: ROUTES.DevNoVaultRoute},
    //       {name: ROUTES.DevRecoverCombineRoute},
    //     ]
    //   }
    // },

    // {
    //   name: ROUTES.DevNoVaultRoute,
    //   state: {
    //     routes: [
    //       {name: ROUTES.DevNoVaultRoute},
    //       {name: ROUTES.DevMessagesRoute}
    //     ]
    //   }
    // }
  ]
}
// When HAS Vault && DEV pick route:
// choose from Object.keys(switch_routes)
const top_level = ROUTES.RecoverSplitRoute; 

const switch_routes = {
  [ROUTES.RecoverSplitRoute]: [
    {name: ROUTES.RecoverSplitsListRoute},
    // {name: ROUTES.RecoverSplitCreateRoute},
    // {name: ROUTES.DevReocveryPlanRoute},
  ],
  [ROUTES.DevHasVaultRoute]: [
    {name: ROUTES.DefaultRoute},
    {name: ROUTES.DevDigitalAgentRoute},
  ],
  [ROUTES.HomeNavRoute]: [
    {name: ROUTES.HomeNavRoute}
  ],
  [ROUTES.ContactsRoute]: [
    {name: ROUTES.ContactsListRoute},
    {name: ROUTES.ContactAddRoute},
    // {name: ROUTES.DevContactsRoute}
    // {name: ROUTES.ContactViewRoute, params: {
    //   contact_uuid: 'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d'
    // }},
  ],
  [ROUTES.OrganizationRoute]: [
    {name: ROUTES.OrganizationListRoute},
    {name: ROUTES.OrganizationViewRoute, params: {
      organization_uuid: '6370c1f1-e047-40ff-b7dd-6fa244943f1f' //ARXsky
    }},
    {name: ROUTES.VerifierViewRoute, params: {
      verifier_uuid: '2b02dc2c-4d75-43c7-b953-ec303fa4d369',
    }},
    // {name: ROUTES.CredentialRequestRoute, params: {
    //   organization_uuid: 'e585bc5c-0d6d-45f4-938a-8131a42671b4',
    //   template_uuid: 'c41c9099-d70f-4834-bd10-53f184f3e5ec', // ARXsky - Employee
    // }},
  ],
  [ROUTES.SecretsRoute]: [
    {name: ROUTES.SecretsListRoute},
    {name: ROUTES.SecretCreateRoute},
    // {name: ROUTES.DevSecretsRoute},
    // {name: ROUTES.SecretViewRoute, params: {
    //   secret_pk: '2b02dc2c-4d75-43c7-b953-ec303fa4d369',
    // }},
    // {name: ROUTES.SecretEditRoute, params: {
    //   credential_uuid: '39a93352-e7e8-4eb3-ad19-351addd0fa62',
    // }},
  ],
  [ROUTES.NotificationsRoute]: []
}

const vault_test_route = [
  {
    name: top_level,
    state: {
      routes: switch_routes[top_level]
    }
  }
]

export {
  vault_test_route,
  no_vault_test_route,
} 


// EXAMPLE OF TWO VALID FORMATS
//
// props.navigation.navigate(ROUTES.CredentialRoute, {
//   screen: ROUTES.CredentialPresentRoute,
//   params: {verifier_uuid: verifierUUID}
// })
//
//                  OR BELOW ==
//
// props.navigation.navigate(ROUTES.CredentialRoute, {
//     state: {
//       routes: [
//         {name: ROUTES.CredentialPresentRoute, params: {
//           verifier_uuid: verifierUUID}
//         }
//       ]
//     }
//   })