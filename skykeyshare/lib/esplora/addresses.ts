import api from './api'

// https://github.com/MiguelMedeiros/esplora-js/blob/main/src/addresses.ts
const getAddress = async (address: string, network: string) => {
    const axios = api(network)
    return axios.get(`/address/${address}`)
        .then(
            (res: {
                data: {
                    address: string;
                        chain_stats: {
                        funded_txo_count: number;
                        funded_txo_sum: number;
                        spent_txo_count: number;
                        spent_txo_sum: number;
                        tx_count: number;
                    };
                    mempool_stats: {
                        funded_txo_count: number;
                        funded_txo_sum: number;
                        spent_txo_count: number;
                        spent_txo_sum: number;
                        tx_count: number;
                    };
                };
            }) => {
                return res.data;
            }
        )
        .catch(
            (err: {
                response: {
                    data: string;
                };
            }) => {
                throw err.response.data;
            }
        );

}
  
const getAddressTxsChain = async (address: string, network: string) => {
    const axios = api(network);
    return axios
      .get(`/address/${address}/txs/chain`)
      .then(
        (res: {
          data: {
            txid: string;
            version: number;
            locktime: number;
            vin: Record<string, unknown>[];
            vout: Record<string, unknown>[];
            size: number;
            weight: number;
            fee: number;
            status: {
              confirmed: boolean;
              block_height: number;
              block_hash: string;
              block_time: number;
            };
          }[];
        }) => {
          return res.data;
        }
      )
      .catch(
        (err: {
          response: {
            data: string;
          };
        }) => {
          throw err.response.data;
        }
      );
};
const getAddressTxsChainAfter = async (address: string, last_seen_txid: string, network: string) => {
  const axios = api(network);
  return axios
    .get(`/address/${address}/txs/chain/${last_seen_txid}`)
    .then(
      (res: {
        data: {
          txid: string;
          version: number;
          locktime: number;
          vin: Record<string, unknown>[];
          vout: Record<string, unknown>[];
          size: number;
          weight: number;
          fee: number;
          status: {
            confirmed: boolean;
            block_height: number;
            block_hash: string;
            block_time: number;
          };
        }[];
      }) => {
        return res.data;
      }
    )
    .catch(
      (err: {
        response: {
          data: string;
        };
      }) => {
        throw err.response.data;
      }
    );
};
const getAddressTxsMempool = async (address: string, network: string) => {
    const axios = api(network);
    return axios
      .get(`/address/${address}/txs/mempool`)
      .then((res: { data: any }) => {
        return res.data;
      })
      .catch(
        (err: {
          response: {
            data: string;
          };
        }) => {
          throw err.response.data;
        }
      );
  };

const getAddressTxsUtxo = async (address: string, network: string) => {
    const axios = api(network);
    return axios
      .get(`/address/${address}/utxo`)
      .then(
        (res: {
          data: {
            txid: string;
            vout: number;
            status: {
              confirmed: boolean;
              block_height: number;
              block_hash: string;
              block_time: number;
            };
            value: number;
          }[];
        }) => {
          return res.data;
        }
      )
      .catch(
        (err: {
          response: {
            data: string;
          };
        }) => {
          throw err.response.data;
        }
      );
};

export default {
    getAddress,
    // getAddressTxs,
    getAddressTxsChain,
    getAddressTxsMempool,
    getAddressTxsChainAfter,
    getAddressTxsUtxo,
    // getScriphash,
}