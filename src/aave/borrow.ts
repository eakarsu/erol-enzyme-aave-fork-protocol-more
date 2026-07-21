import { ethers } from "ethers";
import { aaveProvider } from "./AaveProvider";
import { assertMutationQuarantined } from "../safety/execution";


export const borrow  = async (
    lendingPoolAddressproviderAddress: string,
    provider: any,
    signer: ethers.Wallet,
    amount: number,
    asset: string
  ) => {
    assertMutationQuarantined("Aave asset borrow");
    const aaveProviderWrapper = await aaveProvider.connect(lendingPoolAddressproviderAddress,
      provider,
      signer
    );

    if (aaveProviderWrapper.done) {
      try {
        const borrow = await aaveProvider.borrowAsset(
          parseInt(ethers.utils.parseEther(amount.toString()).toString()).toString(),
          asset,
          1,
          signer
        );
  
        console.log(borrow);
  
        return borrow;
      } catch (error:any) {
          console.log(error);
          return error;
      }
    }
  };
