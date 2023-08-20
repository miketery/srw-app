import base58 from 'bs58'
import { 
    instantiateSha256, instantiateSha512, instantiateRipemd160,
    flattenBinArray,
} from '@bitauth/libauth';

export async function sha512(a) {
    const h = await instantiateSha512()
    const s0 = h.init()
    const s1 = h.update(s0, a)
    const s2 = h.final(s1)
    return s2
}

export async function sha256(a) {
    const h = await instantiateSha256()
    const s0 = h.init()
    const s1 = h.update(s0, a)
    const s2 = h.final(s1)
    return s2
}
export async function ripemd160(a) {
    const h = await instantiateRipemd160()
    const s0 = h.init()
    const s1 = h.update(s0, a)
    const s2 = h.final(s1)
    return s2
}
export async function checksum(a) {
    let x = await sha256(await sha256(a))
    return x.slice(0, 4)
}
export async function p2pkh(pubKey) {
    return await ripemd160(await sha256(pubKey))
}
export async function base58CheckEncode(a, version=new Uint8Array([0])) {
    const payload = flattenBinArray([version, a])
    const cs = await checksum(payload)
    const z = flattenBinArray([payload, cs])
    return base58.encode(z)
}