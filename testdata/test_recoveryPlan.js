export const aliceRecoveryPlan = {
  "pk": "rs_aedb72cb-39d4-4727-b3d2-3db9643f71ea",
  "vaultPk": "v__9gFY2aQrB5VK1YnxUHSn64Ppmuno8XZXgABfgTB5zgbS",
  "name": "Base Recovery Plan",
  "description": "Description",
  "payload": "eyJ3b3JkcyI6ImFsbGV5IG1hemUgZXZva2UgYXV0byBwdWxsIHNrdWxsIHJ1biBjcmVkaXQgbWFyZ2luIGlnbm9yZSBkdW5lIGJyaXNrIiwibmFtZSI6ImFsaWNlIiwiZW1haWwiOiJhbGljZUBhcnhza3kuY29tIiwiZGlzcGxheV9uYW1lIjoiVFbigJRBbGljZSJ9",
  "encryptedPayload": "u3/CtxOBNh1Sd+1UFXP+hE1wscYJy2q3+AYrbJwOOpsnkVaGmYlYeqPHfxZjZYWISEBg5BTSUCNFt4Z48KEY0wERKtVQvcPsRvQ+BgUU0TfpohjTQkyHFMJKoOzsLQhiX5t/uJZajYVh09Ca7z9oEVJAZA4F5ZpNWpE/eStKpDM8bHLbcQbUMkhrBUa7lRpfeN9MdrlmGHLB7UNB8atTq1elBCKO4vrsh+JvzaYKweGUnbUNi7RbdX5r8AaZyQ==",
  "key": "8677d57a05cbb6344316c52461a26faf0ea6fb3de82b40e6596cf83a41c865e6",
  "recoverSplitPartys": [
    {
      "pk": "ad489bdd-5085-4ae9-b24e-517000477f5f",
      "contactPk": "c__bob",
      "name": "bob",
      "numShares": 1,
      "shares": [
        "80121b41e2e56245333249bee2ade880fc18b8c7d845137d74ca821e46452533f2581006171ebd879e5a5b632ba5fd6c079"
      ],
      "receiveManifest": true,
      "state": "ACCEPTED"
    },
    {
      "pk": "98c36558-58c5-459d-b17f-0b5eb4e4c015",
      "contactPk": "c__dan",
      "name": "dan",
      "numShares": 1,
      "shares": [
        "80242753c5cac48a666482bc154a10d1e9c9c9c989bad2e74c4887887a4075dcfa60df7d2a5eed032e0bcc571277df432c5"
      ],
      "receiveManifest": true,
      "state": "ACCEPTED"
    },
    {
      "pk": "03707bb4-2d3a-473d-99b2-8a108ec97573",
      "contactPk": "c__charlie",
      "name": "charlie",
      "numShares": 1,
      "shares": [
        "80363c12272fa6cf5556cb02f7e7f85115c91673065f9d215bc634fa6e434ac9f2c825148e9ed230be3401fbba763ea975a"
      ],
      "receiveManifest": true,
      "state": "ACCEPTED"
    }
  ],
  "threshold": 2,
  "state": "READY",
  "created": 1704475654
}
export const guardiansForAlice = {
  'bob':{
    "pk": "g__85860aa7-acbe-44e5-9b47-4710453257fc",
    "vaultPk": "v__EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
    "manifest": {
      "recoverSplitPk": "rs_aedb72cb-39d4-4727-b3d2-3db9643f71ea",
      "name": "Base Recovery Plan",
      "encryptedPayload": "u3/CtxOBNh1Sd+1UFXP+hE1wscYJy2q3+AYrbJwOOpsnkVaGmYlYeqPHfxZjZYWISEBg5BTSUCNFt4Z48KEY0wERKtVQvcPsRvQ+BgUU0TfpohjTQkyHFMJKoOzsLQhiX5t/uJZajYVh09Ca7z9oEVJAZA4F5ZpNWpE/eStKpDM8bHLbcQbUMkhrBUa7lRpfeN9MdrlmGHLB7UNB8atTq1elBCKO4vrsh+JvzaYKweGUnbUNi7RbdX5r8AaZyQ==",
      "payloadHash": "6d9147dc880c47cd471bfa71a9ad5c72e01ca6eda587deecf907127b1bab2a18947e79d95a85589f9e13a000018bf3f87c78434f78b516f22cede4eab927e393",
      "threshold": 2,
      "recoverSplitPartys": [
        {
          "did": "did:arx:EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "verify_key": "EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "public_key": "D2AgAghipD9jgZcg7DZgZNAy2EfE9a8MjeXkZAaezW6S",
          "name": "bob"
        },
        {
          "did": "did:arx:9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "verify_key": "9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "public_key": "2pVqFxzcckQXp8CxwzLc6KZySxAJURUApLeTRQufcXDf",
          "name": "dan"
        },
        {
          "did": "did:arx:D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "verify_key": "D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "public_key": "DXkGB7X2UbeS4Kk7uvXAEkdQ6bNAa3jBpo9GgwuYkXEm",
          "name": "charlie"
        }
      ]
    },
    "contactPk": "c__alice",
    "name": "Base Recovery Plan",
    "description": "Description",
    "shares": [
      "80121b41e2e56245333249bee2ade880fc18b8c7d845137d74ca821e46452533f2581006171ebd879e5a5b632ba5fd6c079"
    ],
    "archived": false,
    "state": "ACCEPTED"
  },
  'charlie': {
    "pk": "g__9f83812a-4c99-4790-8a2c-f4117dd09d36",
    "vaultPk": "v__D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
    "manifest": {
      "recoverSplitPk": "rs_aedb72cb-39d4-4727-b3d2-3db9643f71ea",
      "name": "Base Recovery Plan",
      "encryptedPayload": "u3/CtxOBNh1Sd+1UFXP+hE1wscYJy2q3+AYrbJwOOpsnkVaGmYlYeqPHfxZjZYWISEBg5BTSUCNFt4Z48KEY0wERKtVQvcPsRvQ+BgUU0TfpohjTQkyHFMJKoOzsLQhiX5t/uJZajYVh09Ca7z9oEVJAZA4F5ZpNWpE/eStKpDM8bHLbcQbUMkhrBUa7lRpfeN9MdrlmGHLB7UNB8atTq1elBCKO4vrsh+JvzaYKweGUnbUNi7RbdX5r8AaZyQ==",
      "payloadHash": "6d9147dc880c47cd471bfa71a9ad5c72e01ca6eda587deecf907127b1bab2a18947e79d95a85589f9e13a000018bf3f87c78434f78b516f22cede4eab927e393",
      "threshold": 2,
      "recoverSplitPartys": [
        {
          "did": "did:arx:EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "verify_key": "EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "public_key": "D2AgAghipD9jgZcg7DZgZNAy2EfE9a8MjeXkZAaezW6S",
          "name": "bob"
        },
        {
          "did": "did:arx:9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "verify_key": "9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "public_key": "2pVqFxzcckQXp8CxwzLc6KZySxAJURUApLeTRQufcXDf",
          "name": "dan"
        },
        {
          "did": "did:arx:D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "verify_key": "D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "public_key": "DXkGB7X2UbeS4Kk7uvXAEkdQ6bNAa3jBpo9GgwuYkXEm",
          "name": "charlie"
        }
      ]
    },
    "contactPk": "c__alice",
    "name": "Base Recovery Plan",
    "description": "Description",
    "shares": [
      "80363c12272fa6cf5556cb02f7e7f85115c91673065f9d215bc634fa6e434ac9f2c825148e9ed230be3401fbba763ea975a"
    ],
    "archived": false,
    "state": "ACCEPTED"
  },
  'dan': {
    "pk": "g__36a1d2d9-f1c5-4363-9845-24c45755ab9b",
    "vaultPk": "v__9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
    "manifest": {
      "recoverSplitPk": "rs_aedb72cb-39d4-4727-b3d2-3db9643f71ea",
      "name": "Base Recovery Plan",
      "encryptedPayload": "u3/CtxOBNh1Sd+1UFXP+hE1wscYJy2q3+AYrbJwOOpsnkVaGmYlYeqPHfxZjZYWISEBg5BTSUCNFt4Z48KEY0wERKtVQvcPsRvQ+BgUU0TfpohjTQkyHFMJKoOzsLQhiX5t/uJZajYVh09Ca7z9oEVJAZA4F5ZpNWpE/eStKpDM8bHLbcQbUMkhrBUa7lRpfeN9MdrlmGHLB7UNB8atTq1elBCKO4vrsh+JvzaYKweGUnbUNi7RbdX5r8AaZyQ==",
      "payloadHash": "6d9147dc880c47cd471bfa71a9ad5c72e01ca6eda587deecf907127b1bab2a18947e79d95a85589f9e13a000018bf3f87c78434f78b516f22cede4eab927e393",
      "threshold": 2,
      "recoverSplitPartys": [
        {
          "did": "did:arx:EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "verify_key": "EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E",
          "public_key": "D2AgAghipD9jgZcg7DZgZNAy2EfE9a8MjeXkZAaezW6S",
          "name": "bob"
        },
        {
          "did": "did:arx:9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "verify_key": "9hBRoYiHKeGj1y49BSutEuFANaafBG3s1aVnrX5bwYFq",
          "public_key": "2pVqFxzcckQXp8CxwzLc6KZySxAJURUApLeTRQufcXDf",
          "name": "dan"
        },
        {
          "did": "did:arx:D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "verify_key": "D5EBA8cZDo7kQGCqepKGGkkWGy9b1c5oXnQE5N9T1xnK",
          "public_key": "DXkGB7X2UbeS4Kk7uvXAEkdQ6bNAa3jBpo9GgwuYkXEm",
          "name": "charlie"
        }
      ]
    },
    "contactPk": "c__alice",
    "name": "Base Recovery Plan",
    "description": "Description",
    "shares": [
      "80242753c5cac48a666482bc154a10d1e9c9c9c989bad2e74c4887887a4075dcfa60df7d2a5eed032e0bcc571277df432c5"
    ],
    "archived": false,
    "state": "ACCEPTED"
  }
}
