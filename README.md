# Enzyme And Aave Fork

## Table of Contents
- [Enzyme And Aave Fork](#enzyme-and-aave-fork)
  - [Table of Contents](#table-of-contents)
    - [Introduction](#introduction)
    - [Features](#features)
    - [Installation](#installation)
    - [Usage Example](#usage-example)
      - [Test Subgraph](#test-subgraph)
      - [CONSTANTS](#constants)
    - [Platform Assets](#platform-assets)
  - [#### Get Denomination assests](#-get-denomination-assests)
  - [#### All Assets](#-all-assets)
      - [Create Fund/Vault](#create-fundvault)
  - [How to setup](#how-to-setup)
  - [Documentations](#documentations)
  - [### Configuration](#-configuration)
      - [Test Subgraph](#test-subgraph-1)
    - [Assets](#assets)
  - [#### Get Denomination assests](#-get-denomination-assests-1)
  - [#### All Assets](#-all-assets-1)
    - [Create a new Fund](#create-a-new-fund)
    - [List all funds](#list-all-funds)
    - [User Vaults/Funds](#user-vaultsfunds)
  - [List fund Investments](#list-fund-investments)


### Introduction

Enzyme fork-based library for integrating with your javascript runtime application, for instance Reactjs and your javascript/typescript app. The library suports type defination.

The library allows user to have fund features of enzyme finance within his Dapp. It only requires you to deploy a set of new enzyme.finance smart contracts.

It also allows users to deposit collateral to aave and borrow any asset using deposited collateral.

### Features
- Creation of a new vault/fund with Fees and Policy configurations
- Deposit Collateral to aave protocol.
- Borrow any asset from aave protocol using deposited asset.
- Invest to already created fund. (Optional using the borrowed asset)
- Withdrawal/Claim your assets from a fund/Vault.
- List user created funds 
- List each fund's investments and transactions
- List authorized user funds, investment, and transactions.


### Installation

Using npm
```
npm install @devngeni/protocol
```

using yarn 
```
yarn add @devngeni/protocol
```

### Usage Example
Here we will go through the above named feature, and see how it is implemented. We will define a number of constants to use within this example. 

> N.B: Please change(dynamically evalute) them.


#### Test Subgraph

Queries (HTTP):     https://api.thegraph.com/subgraphs/name/trust0212/radar-graph
Subscriptions (WS): wss://api.thegraph.com/subgraphs/name/trust0212/radar-graph.



#### CONSTANTS

```
import { ethers } from "ethers";

// provider & Signer
const HTTP_URL = "<infura-http-url>"
const PRIVATE_KEY = "Your-private-ke"

const PROVIDER = new ethers.providers.JsonRpcProvider(HTTP_URL);

const SIGNER = new ethers.Wallet(configs.PRIVATE_KEY, PROVIDER);

// Subgraph
const SUB_GRAPH_ENDPOINT_LINK = " https://api.thegraph.com/subgraphs/name/trust0212/radar-graph"

// AAVE Usage
const LP_ADDRESS_PROVIDER_ADDRESS =""; // kovan lendingPoolProviderAddress
const BORROW_ASSET = ""; //kovan DAI address
const DEPOSIT_ASSET = ""; // kovan WETH address

```



### Platform Assets

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


#### Create Fund/Vault

To create you need to prepare a few fields, this can be picked from your front-end or nodejs application.

```
import {createNewFund}  from "@devngeni/protocol"

 const DENOMINATION_ASSET = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"; // Kovan Wrapped Ether(WETH)

 // params

// Fee Configurations
  let feeConfigs = {
    entranceFee: "2",
    managementFee: "1",
    performanceFee: "5",
  };

  // Policy Configurations

  let policyConfig = {
    deposit: {
      minimum: "0",
      maximum: "5",
    },
    asset: {
      whiteList: [],
      blackList: [],
    },
    adpater: {
      whiteList: [],
      blackList: [],
    },
  };
 // Creating the actual fund

 try {
    const fund = await createNewFund(
      SIGNER,
      "POLICY CONFIGURATION 27/01/2022",
      DENOMINATION_ASSET,
      10000,
      "10000000",
      PROVIDER,
      feeConfigs,
      policyConfig
    );

      console.log(fund);
  }catch(err) {
    console.log(err)
  }

```


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

#### Test Subgraph

```
Queries (HTTP):     https://api.thegraph.com/subgraphs/name/trust0212/radar-graph
Subscriptions (WS): wss://api.thegraph.com/subgraphs/name/trust0212/radar-graph
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