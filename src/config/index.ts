export interface RuntimeConfig {
  rpcUrl: string;
  privateKey: string;
  subgraphEndpoint?: string;
}

/**
 * Load credentials only at runtime. This repository never supplies defaults.
 * Live transaction methods remain quarantined even when configuration exists.
 */
export function loadRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const rpcUrl = environment.ETHEREUM_RPC_URL;
  const privateKey = environment.ETHEREUM_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('ETHEREUM_RPC_URL and ETHEREUM_PRIVATE_KEY are required; no credentials are bundled');
  }

  return {
    privateKey,
    rpcUrl,
    subgraphEndpoint: environment.SUBGRAPH_ENDPOINT,
  };
}
