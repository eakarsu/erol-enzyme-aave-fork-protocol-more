import { BigNumber, ethers, utils } from "ethers";
import { fullNumber } from "../utils/fund";
import {
  approveForInvestment,
  investFundDenomination,
} from "./../funds/withdrawal-deposits";
import { assertMutationQuarantined } from "../safety/execution";


/**
 * Approve Amount for investment
 * @param fundAddress  Fund location address
 * @param provider  ethers's jsonrpcProvider
 * @param amount Amount to approve
 * @returns 
 */
export const approveBeforeInvesting = async (
  fundAddress: string,
  provider: any,
  amount: number
) => {
  assertMutationQuarantined("Enzyme investment approval");
  try {
    amount = fullNumber(utils.hexlify(amount.toString()));

    if (amount == 0) return;

    return await approveForInvestment(fundAddress, provider, amount);
  } catch (e: any) {return e}
};

export const invest = async (
  fundAddress: string,
  provider: any,
  signer: ethers.Wallet,
  amountToInvest: number
) => {
  assertMutationQuarantined("Enzyme fund investment");
  try {
    const amount = fullNumber(utils.hexlify(amountToInvest.toString()));
    if (amount == 0) return;

    return await investFundDenomination(fundAddress, signer.address, provider, amount);
  } catch (e: any) {
      return e;
  }
};

