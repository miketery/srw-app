import React, { useState } from 'react';

function PasskeyAuth() {
  const [registered, setRegistered] = useState(false);

  const handleRegister = async () => {
    // try {
      // const publicKey = await navigator.credentials.create({
      //   publicKey: {
      //     // You can customize these options based on your requirements
      //     challenge: new Uint8Array([Math.floor(Math.random() * 256)]),
      //     rp: { name: 'My Website' },
      //     user: { name: 'User' },
      //     pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      //     authenticatorSelection: { authenticatorAttachment: 'platform' },
      //     attestation: 'direct',
      //   },
      // });
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array([Math.floor(Math.random() * 256)]),
        rp: {
            name: "ARXsky",
            id: "localhost",
        },
        user: {
            id: Uint8Array.from(
                "ABC123457", c => c.charCodeAt(0)),
            name: "michael@arxsky.com",
            displayName: "Michael",
        },
        pubKeyCredParams: [{alg: 6, type: "public-key"}],
        // authenticatorSelection: {
        //     authenticatorAttachment: "cross-platform",
        // },
        timeout: 60000,
        attestation: "direct"
      };
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      console.log(credential)


      // const publicKeyObj = {
      //   id: publicKey.id,
      //   rawId: publicKey.rawId,
      //   response: {
      //     attestationObject: publicKey.response.attestationObject,
      //     clientDataJSON: publicKey.response.clientDataJSON,
      //   },
      //   type: publicKey.type,
      // };
      // console.log(publicKey)
      // console.log(publicKeyObj)
      // // Send the public key to the API for registration
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(publicKeyObj),
      // });

      // if (response.ok) {
      //   setRegistered(true);
      //   console.log('Registration successful!');
      // } else {
      //   console.log('Registration failed.');
      // }
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const handleLogin = async () => {
    // Use the Web Authentication API to login using the registered public key
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          // You can customize these options based on your requirements
          challenge: new Uint8Array([Math.floor(Math.random() * 256)]),
          rpId: window.location.hostname,
          userVerification: 'preferred',
          allowCredentials: [
            {
              type: 'public-key',
              id: Uint8Array.from(
                atob(localStorage.getItem('publicKey')),
                (c) => c.charCodeAt(0)
              ),
              transports: ['usb', 'nfc', 'ble', 'internal'],
            },
          ],
        },
      });

      // Send the assertion to the API for verification
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assertion.id,
          rawId: assertion.rawId,
          response: {
            authenticatorData: assertion.response.authenticatorData,
            clientDataJSON: assertion.response.clientDataJSON,
            signature: assertion.response.signature,
            userHandle: assertion.response.userHandle,
          },
          type: assertion.type,
        }),
      });

      if (response.ok) {
        console.log('Login successful!');
      } else {
        console.log('Login failed.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {registered ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleRegister}>Register</button>
      )}
    </div>
  );
}

export default PasskeyAuth;