import nacl from 'tweetnacl-sealed-box';

// data type for signing key which is a byte array
export type SigningKey = Uint8Array;
// data type for verify key which is a byte array
export type VerifyKey = Uint8Array;
// data type for private key which is a byte array
export type PrivateKey = Uint8Array;
// data type for public key which is a byte array
export type PublicKey = Uint8Array;
// data type for signed message which is a byte array
export type SignedMessage = Uint8Array;
