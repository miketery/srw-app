import api from './api';

const getTx = async (txid: string, network: string) => {
  const axios = api(network);
  return await axios
    .get(`/tx/${txid}`)
    .then(
      (res: {
        data: {
          txid: string;
          version: number;
          locktime: number;
          vin: {
            txid: string;
            vout: number;
            prevout: Record<string, unknown>;
            scriptsig: string;
            scriptsig_asm: string;
            is_coinbase: boolean;
            sequence: string;
          }[];
          vout: {
            scriptpubkey: string;
            scriptpubkey_asm: string;
            scriptpubkey_type: string;
            scriptpubkey_address: string;
            value: number;
          }[];
          size: number;
          weight: number;
          fee: number;
          status: {
            confirmed: boolean;
            block_height: number;
            block_hash: string;
            block_time: number;
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
};

const getTxStatus = async (txid: string, network: string) => {
  const axios = api(network);
  return await axios
    .get(`/tx/${txid}/status`)
    .then(
      (res: {
        data: {
          confirmed: boolean;
          block_height: number;
          block_hash: string;
          block_time: number;
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
};

const getTxHex = async (txid: string, network: string) => {
  const axios = api(network);
  return await axios
    .get(`/tx/${txid}/hex`)
    .then((res: { data: string }) => {
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

const getTxRaw = async (txid: string, network: string) => {
  const axios = api(network);
  return await axios
    .get(`/tx/${txid}/raw`)
    .then((res: { data: string }) => {
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

const getTxMerkleBlockProof = async (txid: string, network: string) => {
    const axios = api(network);
    return await axios
    .get(`/tx/${txid}/merkleblock-proof`)
    .then((res: { data: string }) => {
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

const getTxMerkleProof = async (txid: string, network: string) => {
    const axios = api(network);
    return await axios
    .get(`/tx/${txid}/merkle-proof`)
    .then(
      (res: {
        data: {
          block_height: number;
          merkle: string[];
          pos: number;
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

const getTxOutspend = async (txid: string, vout: number, network: string) => {
    const axios = api(network);
    return await axios
    .get(`/tx/${txid}/outspend/${vout}`)
    .then(
      (res: {
        data: {
          spent: boolean;
          txid: string;
          vin: number;
          status: {
            confirmed: boolean;
            block_height: number;
            block_hash: string;
            block_time: number;
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
};

const getTxOutspends = async (txid: string, network: string) => {
    const axios = api(network);
    return await axios
    .get(`/tx/${txid}/outspends`)
    .then(
      (res: {
        data: {
          spent: boolean;
          txid: string;
          vin: number;
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

const postTx = async (tx: string, network: string) => {
  const axios = api(network);
  return await axios
    .post(`/tx`, tx)
    .then((res: {
        data: {
          txid: string
        }
      }) => {
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

export default {
    getTx,
    getTxStatus,
    getTxHex,
    getTxRaw,
    getTxMerkleBlockProof,
    getTxMerkleProof,
    getTxOutspend,
    getTxOutspends,
    postTx,
};