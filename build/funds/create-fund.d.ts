import { ethers, BigNumberish } from "ethers";
import { AddressLike } from "@enzymefinance/ethers";
import ManagementFee from "./../abis/ManagementFee.json";
import PerformanceFee from "./../abis/PerformanceFee.json";
import EntranceRateDirectFee from "./../abis/EntranceRateDirectFee.json";
import MinMaxInvestment from "./../abis/MinMaxInvestment.json";
import AssetBlacklist from "./../abis/AssetBlacklist.json";
import AssetWhitelist from "./../abis/AssetWhitelist.json";
import AdapterBlacklist from "./../abis/AdapterBlacklist.json";
import AdapterWhitelist from "./../abis/AdapterWhitelist.json";
export { PerformanceFee, ManagementFee, EntranceRateDirectFee, MinMaxInvestment, AssetBlacklist, AssetWhitelist, AdapterBlacklist, AdapterWhitelist, };
export declare const createNewFund: (signer: ethers.Wallet, fundName: string, denominationAsset: string, timeLockInSeconds: number, feeManagerConfig: string, policyManagerConfigData: string, gaslimit: string, provider: any, address: string) => Promise<any>;
/**
 * Rate is  number representing a 1%
 */
export declare const getManagementFees: (rate: any) => string;
/**
 *
 * @param {*} rate Rate in percentage
 * @param {*} period Period at which it will be applied
 */
export declare const getPerformanceFees: (rate: any, period: any) => string;
/**
 * Rate is  number representing a 1%
 */
export declare function getEntranceRateFeeConfigArgs(rate: BigNumberish): string;
export declare const getPolicyArgsData: (policies: AddressLike[], policySettings: AddressLike[]) => string;
/**
 *
 * @param {*} fees
 * @param {*} feeManagerSettingsData
 * @param {*} _signer
 * @param {*} allow
 * @returns
 */
export declare const getFeesManagerConfigArgsData: (fees: any, feeManagerSettingsData: any, _signer: any, allow: any) => Promise<string>;
