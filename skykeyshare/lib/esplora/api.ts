import axios from 'axios';

// https://github.com/MiguelMedeiros/esplora-js/blob/main/src/api.ts

const mainnet_url = 'https://blockstream.info/api/'
const testnet_url = 'https://blockstream.info/testnet/api/'

export default (network: string) => {
    return axios.create({
        baseURL: network == 'mainnet' ? mainnet_url : testnet_url,
    })
}

// headers: {
//     "access-control-allow-origin": "*"
// }