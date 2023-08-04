import axios from "axios"
import { ENDPOINTS } from "../config"

interface ConditionData {
  // needs to match verif.models.Condition
  type: "nested"|"string"|"integer"|
        "boolean"|"date"|"datetime"|"time";
  operator: 
    // nested
      "and"|"or"| 
    // not nested
      "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|
      "contains"|"not_contains"|
      "starts_with"|"ends_with"|
      "is_empty"|"is_not_empty";
  // if nested
  conditions?: ConditionData[];

  // if not nested
  label?: string; 
  key?: string;
  value?: string;
}

interface VerifierData {
  // needs to match verif.models.Verifier
  uuid: string;
  name: string;
  description: string;
  issuer: string;
  templates: string[];
  owner: string;
  conditions: ConditionData[];
}

export default class Verifier {
  private static cache: Map<string, VerifierData> = new Map();

  constructor() {}

  static async get(uuid: string, forceFetch: boolean = false): Promise<VerifierData> {
    console.log('[Verifier.get] ' + uuid)
    if (!forceFetch && Verifier.cache.has(uuid))
      return Verifier.cache.get(uuid)!
    return axios.get(ENDPOINTS.verifier(uuid))
      .then((response) => {
        Verifier.cache.set(uuid, response.data);
        return response.data
      }).catch((error) => {
        console.log(error)
        throw(error)
      })  
  }
  static async getAll(): Promise<VerifierData[]> {
    console.log('[Verifier.getAll]')
    return axios.get(ENDPOINTS.verifiers).then((response) => {
      const verifiers = response.data
      for (const verifier of verifiers)
        Verifier.cache.set(verifier.uuid, verifier)
      return verifiers
    }).catch((error) => {
      console.log(error)
      throw(error)
    })
  }
  static async getByOrg(uuid: string): Promise<VerifierData[]> {
    console.log('[Verifier.getByOrg]')
    return axios.get(ENDPOINTS.verifiers_by_org(uuid)).then((response) => {
      return response.data
    }).catch((error) => {
      console.log(error)
      throw(error)
    })
  }
  static async verify(verifier: string, credential: string) {
    console.log('[Verifier.verify]', credential, verifier)
    return axios.post(ENDPOINTS.verify_credential, {
      credential: credential,
      verifier: verifier
    }).then((response) => {
      return response.data
    }).catch((error) => {
      console.log(error)
      throw(error)
    })
  }
}