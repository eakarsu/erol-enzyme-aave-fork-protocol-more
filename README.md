# Enzyme And Aave Fork

## How to setup

- This will allow you to use this within you application be it , nodejs or react application. You will only be requred to install this package and then read the documentation.

- Given this protocol is written with typescript you will be provide with some in-code documentation accompanying this documentation.

## Documentations



### Configuration
---

Here the configurations
```
const config = {
  ADDRESS: "",
  PRIVATE_KEY:
    "",
  gasLimit: "1000000",
  JSONRPC_URL: "", // use infura
};

export { config };
```



### Assets

#### Get Denomination assests
---

This will give a list all the assets found in the enzyme fork. This includes blocked and whitelisted assets. Further you can be able to filter from your user interface.

```
const denominationAssets  =  await getDenominationAssets("SUB_GRAPH_ENDPOINT_LINK");
```

#### All Assets 
---

This list can help you handle different policies. Please you this list incase you want to blacklist or whitelist asset.

```
const assets  = await getAllAssetsIntegrations("SUB_GRAPH_ENDPOINT_LINK");
```

### Create a new Fund

The enzyme protocol entry point is creation of a fund, what they call a vault.


```
import { ethers, utils } from "ethers";
import { config } from "./../..from_config<please-change-this-to where configs are>";
import {
 EntranceRateDirectFee,
 createNewFund,
 getManagementFees,
 PerformanceFee,
 getEntranceRateFeeConfigArgs,
 getFeesManagerConfigArgsData,
 getPerformanceFees,
 ManagementFee,
} from "@devngeni/protocol";


 //PREP
  const provider = new ethers.providers.JsonRpcProvider(config.JSONRPC_URL);

  const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);
  const denominationAsset = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"; //WETH
  const policyManagerConfigData = utils.hexlify("0x");

  const managementFee = "1"; // %
  const performanceFee = "10"; // %
  const entranceFee = "2"; //%

  // prepare fee configs

  let feeManagerSettingsData = [
    getManagementFees(managementFee),
    getEntranceRateFeeConfigArgs(entranceFee),
    getPerformanceFees(performanceFee, 12),
  ]; // value configurations
  let fees = [
    ManagementFee.address,
    EntranceRateDirectFee.address,
    PerformanceFee.address,
  ]; // list of address

  // FINAL PREP of FEES
  const feeArgsData = await getFeesManagerConfigArgsData(
    fees,
    feeManagerSettingsData,
    config.ADDRESS,
    true
  );

  // Create new fund with a name

  try {
    const fund = await createNewFund(
      signer,
      "AAVE FUNDS",
      denominationAsset,
      10000,
      feeArgsData!,
      policyManagerConfigData,
      config.gasLimit,
      provider,
      config.ADDRESS // WALLET OF CURRENT CONNECTED USER
    );

    console.log(fund);
  } catch (error) {
    console.log(error);
  }
```


### List all funds 

This will help you to get all funds within the system. You will have to do some pagination on the front-end

```
const funds  =  await listAllFunds("SUB_GRAPH_ENDPOINT_LINK");
```

### User Vaults/Funds

```
const userFunds  = await walletAddressUserVaults("SUB_GRAPH_ENDPOINT_LINK");
```

## List fund Investments


```
const investments  = await getUserAddressInvestments("SUB_GRAPH_ENDPOINT_LINK");
```