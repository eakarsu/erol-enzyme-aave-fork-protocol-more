import { utils, ethers, BigNumberish } from "ethers";
import { AddressLike } from "@enzymefinance/ethers";
import FundDeployer from "./../abis/FundDeployer.json";
import { VaultLib } from "./../prep-abis";

import {
  managementFeeConfigArgs,
  performanceFeeConfigArgs,
  feeManagerConfigArgs,
  convertRateToScaledPerSecondRate,
  encodeArgs,
} from "./../utils/fund";
import {
  AssetWhitelist,
  AssetBlacklist,
  AdapterBlacklist,
  AdapterWhitelist,
  PerformanceFee,
  MinMaxInvestment,
  FeeManager,
  ManagementFee,
  EntranceRateDirectFee,
} from "./../prep-abis";

export {
  PerformanceFee,
  ManagementFee,
  EntranceRateDirectFee,
  MinMaxInvestment,
  AssetBlacklist,
  AssetWhitelist,
  AdapterBlacklist,
  AdapterWhitelist,
};

export const createNewFund = async (
  signer: ethers.Wallet,
  fundName: string,
  denominationAsset: string,
  timeLockInSeconds: number,
  feeManagerConfig: string,
  policyManagerConfigData: string,
  gaslimit: string,
  provider: any,
  address: string
) => {
  const nonce = await provider.getTransactionCount(address, "pending");

  // remove code

  // GET FundDeployer Interface Data
  const FundDeployerInterface = new ethers.utils.Interface(
    JSON.parse(JSON.stringify(FundDeployer.abi))
  );
  // FundDeployer Contract
  const fundDeployer = new ethers.Contract(
    FundDeployer.address,
    FundDeployerInterface,
    signer
  );
  //0xd0a1e359811322d97991e03f863a0c30c2cf029c
  const fund = await fundDeployer.createNewFund(
    address,
    fundName,
    denominationAsset,
    timeLockInSeconds,
    feeManagerConfig,
    policyManagerConfigData,
    { nonce: nonce, gasLimit: gaslimit }
  );

  return fund;
};

/**
 * Rate is  number representing a 1%
 */
export const getManagementFees = (rate: any) => {
  // Must convert from rate to scaledPerSecondRate
  var scaledPerSecondRate = convertRateToScaledPerSecondRate(rate);
  return managementFeeConfigArgs(scaledPerSecondRate);
};

/**
 *
 * @param {*} rate Rate in percentage
 * @param {*} period Period at which it will be applied
 */
export const getPerformanceFees = (rate: any, period: any) => {
  // The period will default to 30 days
  const defaultPeriod = 2592000;
  // remove code

  // The rate must be (rate/100 * 10**18) or directly rate * 10**16;
  rate = utils.parseEther((rate / 100).toString());
  return performanceFeeConfigArgs(rate, defaultPeriod);
};

/**
 * Rate is  number representing a 1%
 */
export function getEntranceRateFeeConfigArgs(rate: BigNumberish) {
  // The rate must be (rate/100 * 10**18) or directly rate * 10**16;
  rate = utils.parseEther(rate.toString());
  return encodeArgs(["uint256"], [rate]);
}

export const getPolicyArgsData = (
  policies: AddressLike[],
  policySettings: AddressLike[]
) => {
  return encodeArgs(["address[]", "bytes[]"], [policies, policySettings]);
};

/**
 *
 * @param {*} fees
 * @param {*} feeManagerSettingsData
 * @param {*} _signer
 * @param {*} allow
 * @returns
 */

export const getFeesManagerConfigArgsData = async (
  fees: any,
  feeManagerSettingsData: any,
  _signer: any,
  allow: any
) => {
  // remove code
  // console.log(fees, feeManagerSettingsData, _signer, allow);
  const FeeManagerInterface = new ethers.utils.Interface(
    JSON.parse(JSON.stringify(FeeManager.abi))
  );

  // remove in mainnet
  const feeManager = new ethers.Contract(
    FeeManager.address,
    FeeManagerInterface
  );
  let fees_unregister = [];
  // end

  try {
    if (allow) {
      const registeredFees = await feeManager.getRegisteredFees();

      if (registeredFees.length === 0) {
        fees_unregister = [ManagementFee.address, PerformanceFee.address];
        await feeManager.registerFees(fees_unregister, { gasLimit: 300000 });
      } else {
        if (!registeredFees.includes(ManagementFee.address)) {
          fees_unregister.push(ManagementFee.address);
        }

        if (!registeredFees.includes(PerformanceFee.address)) {
          fees_unregister.push(PerformanceFee.address);
        }

        if (!registeredFees.includes(EntranceRateDirectFee.address)) {
          fees_unregister.push(EntranceRateDirectFee.address);
        }
      }
      // Register this fees for app use
      if (fees_unregister.length > 0) {
        await feeManager.registerFees(fees_unregister, { gasLimit: 300000 });
      }
    }

    // Convert Fees
  } catch (error) {}

  return feeManagerConfigArgs({
    fees: fees,
    settings: feeManagerSettingsData,
  });
};

/**
 *
 * @param assetAddress Asset address
 * @param signer
 * @returns
 */

export async function getAssetDecimals(assetAddress: string, signer: any) {
  try {
    // we use VaultLib as an interface because it has the `decimals()` getter
    const assetInterface = new ethers.utils.Interface(
      JSON.parse(JSON.stringify(VaultLib.abi))
    );
    const asset = new ethers.Contract(assetAddress, assetInterface, signer);
    const decimals = await asset.decimals();
    return decimals;
  } catch (error) {
    return { error: false };
  }
}
