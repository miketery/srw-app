// file for example data structures for testing

const KeyShareExample = {
    name: 'Primary',
    created: '',
    updated: '',
    recoveryHash: 'HASH',
    encryptedKey: 'KEY',
    manifest: {
        shares: [
            {
                name: 'mike',
                description: 'me :)',
                email: 'mike@skycastle.dev', phone: '123-345-6789',
                hash: 'hash',
                shares: 1
            },
            {
                name: 'yael',
                description: '',
                email: '',
                phone: '',
                hash: 'hash',
                shares: 1
            },
            {name: 'papa', description: '', email: '', phone: '', hash: 'hash', shares: 1},
            {name: 'mama', description: '', email: '', phone: '', hash: 'hash', shares: 1},
        ],
        threshold: 3,
    }
}