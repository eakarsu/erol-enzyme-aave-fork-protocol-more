import { ethers } from "ethers";
import { aaveProvider, createNewFund } from "../index";
import { configs } from "../config";
import { borrow, deposit } from "../aave";

//CONSTANTS

const PROVIDER = new ethers.providers.JsonRpcProvider(configs.HTTP_URL);
const SIGNER = new ethers.Wallet(configs.PRIVATE_KEY, PROVIDER);

// aave

const LP_ADDRESS_PROVIDER_ADDRESS =
  "0x88757f2f99175387aB4C6a4b3067c77A695b0349";
const BORROW_ASSET = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd"; // DAIs
const DEPOSIT_ASSET = "0xd0A1E359811322d97991E03f863a0C30C2cF029C"; // WETH

// 1. CREATION OF A FUND
export const createFundTest = async () => {
  /**
   * PROCESS FLOW OF THE APP
   */

  //1.CREATION OF A FUND
  const DENOMINATION_ASSET = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"; // Wrapped Ether(WETH)

  try {
    /**
     * PARAMETERS BE PASSED BY USERs
     */
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
  } catch (error) {
    console.log(error);
  }
};

// 2. OPTION STEP
// Interact with aave

// (i). Deposit collateral

export const aaveDepositCollateral = async () => {
  return await borrow(
    LP_ADDRESS_PROVIDER_ADDRESS,
    PROVIDER,
    SIGNER,
    1,
    DEPOSIT_ASSET
  );
};

// (i). Borrow Assets to Use
export const aaveBorrowAsset = async () => {
  return await deposit(
    LP_ADDRESS_PROVIDER_ADDRESS,
    PROVIDER,
    SIGNER,
    100,
    BORROW_ASSET
  );
};


// 3. DEPOSIT ASSET(options. If you borrowed)

// 4. REDEEM FROM A FUND