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

export const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://kovan.infura.io/v3/f7f0290fa86240888223b0ad599c71a1"
  );

  const USER_ADDRESS = "0xf83F4c3A25b8FEE1722d76e5F72AaFcA00845011";
  const USER_PRIVATE_KEY =
    "0x2c283ea64fe7352dd1b1125723a260524e9ad0a6c0a8008b240f904265c0cfd2";

  const signer = new ethers.Wallet(USER_PRIVATE_KEY, provider);
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
    USER_ADDRESS,
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
      USER_ADDRESS
    );

    console.log(fund);
  } catch (error) {
    console.log(error);
  }
};
