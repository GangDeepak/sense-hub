const BASE_URL = "/proxy/azure/sense-suw-dev/api/v2";

const HEADERS = {
  "tenant-id": "3f49c8a9-79d4-4d51-9e72-88f7f654c3a6",
  "app-id": "suw-dev",
  "x-api-key": "c2Vuc2UtcmEtYmFja2VuZA==",
  "Content-Type": "application/json"
};

export const API_ENDPOINTS = [
  "exposure-data",
  "loss-data",
  "exposure-profile",
  "loss-profile",
  "submission-summary",
  "groundup-pricing",
  "insured-insights",
  "fetch-potential-max-line",
  "broker-target"
] as const;

export type ApiEndpoint = typeof API_ENDPOINTS[number];

export interface ApiResponse {
  endpoint: ApiEndpoint;
  data: any;
  error?: string;
  status: number;
}

export interface TxnResult {
  txnId: string;
  results: ApiResponse[];
}

export async function fetchTxnData(txnId: string): Promise<TxnResult> {
  const promises = API_ENDPOINTS.map(async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}/${endpoint}?txn_id=${txnId}`, {
        headers: HEADERS
      });
      
      const data = await response.json().catch(() => ({}));
      
      return {
        endpoint,
        data,
        status: response.status,
        error: response.ok ? undefined : `Error ${response.status}: ${JSON.stringify(data)}`
      };
    } catch (err: any) {
      return {
        endpoint,
        data: {},
        status: 0,
        error: err.message
      };
    }
  });

  const results = await Promise.all(promises);
  return { txnId, results };
}
