import { ethers, utils } from "ethers";
import {
  getEntranceRateFeeConfigArgs,
  getFeesManagerConfigArgsData,
  getPerformanceFees,
  ManagementFee,
} from "../funds/create-fund";
import { createNewFund, getManagementFees } from "./../index";
import { EntranceRateDirectFee } from "../funds/create-fund";
import { PerformanceFee } from "../funds/create-fund";
import {configs } from './../config'

export const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    configs.HTTP_URL
  );

  const signer = new ethers.Wallet(configs.PRIVATE_KEY, provider);
  const denominationAsset = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
  const policyManagerConfigData = utils.hexlify("0x");

  const managementFee = "1";
  const performanceFee = "10";
  const entranceFee = "2";

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

  console.log("DATA", fees, feeManagerSettingsData);
  const feeArgsData = await getFeesManagerConfigArgsData(
    fees,
    feeManagerSettingsData,
    configs.ADDRESS,
    true
  );

  console.log("ARGS", feeArgsData);
  try {
    const fund = await createNewFund(
      signer,
      "WE FUND 1",
      denominationAsset,
      10000,
      feeArgsData!,
      policyManagerConfigData,
      "10000000",
      provider,
      configs.ADDRESS
    );

    console.log(fund);
  } catch (error) {
    console.log(error);
  }
};
