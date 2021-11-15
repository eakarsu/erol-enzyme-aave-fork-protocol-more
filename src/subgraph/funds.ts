import axios from "axios";

/**
 * It gives a list of all denomination assets
 * @param SUB_GRAPH_ENDPOINT Endpoint to where the subgraph is deployed to.
 * @returns
 */
export const getDenominationAssets = async (SUB_GRAPH_ENDPOINT: string) => {
  try {
    const { data } = await axios.post(SUB_GRAPH_ENDPOINT, {
      query: `
            {
              assets(orderBy: symbol, orderDirection: asc, where: {type_in: [ETH, USD]}) {
               decimals
               curvePoolAssetDetails {
                 pool
                 gauge
                 gaugeToken {
                   id
                   decimals
                   symbol
                 }
                 invariantProxyAsset {
                   decimals
                   id
                   symbol
                 }
                 lpToken {
                   decimals
                   id
                   symbol
                 }
                 numberOfTokens
                 pool
                
                 token1 {
                   decimals
                   id
                   symbol
                 }
                 token2 {
                   decimals
                   id
                   symbol
                 }
                 
               }
               decimals
               derivativeType
               id
               name
               price {
                 price
                 timestamp
               }
               symbol
               type
               underlyingAsset {
                 id
                 decimals
                 name
                 symbol
               }
               uniswapV2PoolAssetDetails {
                 id
               }
             }
             }
            `,
    });

    return data.data.assets;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get all assets integrations
 * @param SUB_GRAPH_ENDPOINT Subgraph endpoint
 * @returns
 */

export const getAllAssetsIntegrations = async (SUB_GRAPH_ENDPOINT: string) => {
  try {
    const { data } = await axios.post(SUB_GRAPH_ENDPOINT, {
      query: `
        {
          assets (orderBy: symbol, orderDirection: asc){
            id
            name
            decimals
            symbol
            price{
              price
            }
          }
        }`,
    });
    return data.data.assets;
  } catch (error) {}
};
