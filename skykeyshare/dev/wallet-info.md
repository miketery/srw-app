https://developer.bitcoin.org/devguide/wallets.html

https://walletsrecovery.org/ - derivation paths to recover

https://electrum.readthedocs.io/en/latest/xpub_version_bytes.html?highlight=bip32

// Multi account HD https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// m / purpose' / coin_type' / account' / change / address_index
// https://learnmeabitcoin.com/technical/extended-keys
// https://learnmeabitcoin.com/technical/derivation-paths#bip-44-m440000

// P2WPKH Deriviation https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki


Specification
-------------

In the table below,

-  P2SH stands for a
   [BIP11](https://github.com/bitcoin/bips/blob/master/bip-0011.mediawiki)
   multi-signature script embedded in a
   [BIP16](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki)
   pay-to-script-hash output
-  P2WPKH stands for pay-to-witness-public-key-hash (witness version 0),
   as in
   [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wpkh)
-  P2WPKH-P2SH stands for a P2WPKH script (witness version 0) nested in
   a
   [BIP16](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki)
   P2SH output, as in
   [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wpkh-nested-in-bip16-p2sh)
-  P2WSH stands for a
   [BIP11](https://github.com/bitcoin/bips/blob/master/bip-0011.mediawiki)
   multi-signature pay-to-witness-script-hash (witness version 0)
   script, as in
   [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh)
-  P2WSH-P2SH stands for a
   [BIP11](https://github.com/bitcoin/bips/blob/master/bip-0011.mediawiki)
   multi-signature pay-to-witness-script-hash (witness version 0) script
   nested in a
   [BIP16](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki)
   P2SH output, as in
   [BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#p2wsh-nested-in-bip16-p2sh)

Note that an M-of-N multi-signature script is usually constructed from N
extended keys (and M is provided in a side-channel). Hence in most cases
more than one extended key is needed to create such scripts; this is out
of scope of this document.

+---------+---------------+----------+---------------+------------------+
| network | script type   | pub/priv | version bytes | | human-readable |
+=========+===============+==========+===============+==================+
| mainnet | p2pkh or p2sh | public   | 0x0488b21e    | xpub             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2pkh or p2sh | private  | 0x0488ade4    | xprv             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wpkh-p2sh   | public   | 0x049d7cb2    | ypub             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wpkh-p2sh   | private  | 0x049d7878    | yprv             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wsh-p2sh    | public   | 0x0295b43f    | Ypub             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wsh-p2sh    | private  | 0x0295b005    | Yprv             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wpkh        | public   | 0x04b24746    | zpub             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wpkh        | private  | 0x04b2430c    | zprv             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wsh         | public   | 0x02aa7ed3    | Zpub             |
+---------+---------------+----------+---------------+------------------+
| mainnet | p2wsh         | private  | 0x02aa7a99    | Zprv             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2pkh or p2sh | public   | 0x043587cf    | tpub             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2pkh or p2sh | private  | 0x04358394    | tprv             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wpkh-p2sh   | public   | 0x044a5262    | upub             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wpkh-p2sh   | private  | 0x044a4e28    | uprv             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wsh-p2sh    | public   | 0x024289ef    | Upub             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wsh-p2sh    | private  | 0x024285b5    | Uprv             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wpkh        | public   | 0x045f1cf6    | vpub             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wpkh        | private  | 0x045f18bc    | vprv             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wsh         | public   | 0x02575483    | Vpub             |
+---------+---------------+----------+---------------+------------------+
| testnet | p2wsh         | private  | 0x02575048    | Vprv             |
+---------+---------------+----------+---------------+------------------+


Electrum has 3 options for seed recovery
- legacy (p2pkh) m/44'/0'/0'
- p2sh-segwit (p2wpkh-p2sh) m/49'/0'/0'
- native segiwt (p2wpkh) m/84'/0'/0'

https://en.bitcoin.it/wiki/Invoice_address
https://en.bitcoin.it/w/images/en/4/48/Address_map.jpg