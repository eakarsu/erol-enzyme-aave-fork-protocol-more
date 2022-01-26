import { ethers } from "ethers";

const LendingPoolAddressProviderABI = require("./ABIs/AddressProvider.json");
const LendingPoolABI = require("./ABIs/LendingPool.json");
const ERC20ABI = require("./ABIs/ERC20.json");

export { LendingPoolAddressProviderABI, LendingPoolABI, ERC20ABI };

class AaveProvider {
  private _provider!: ethers.providers.JsonRpcProvider;
  private _lendingProviderAddress!: string;
  private _signer!: ethers.Wallet;
  private _lpAddressProviderContract!: ethers.Contract;

  /**
   * Get Authenticated JsonRpcProvider to use for
   * all other transactions
   */
  get provider(): ethers.providers.JsonRpcProvider {
    if (!this._provider) {
      throw new Error("Please provider your JsonRpcProvider to continue");
    }
    return this._provider;
  }

  /**
   * Get the Lending Pool Address Provider contract
   * Instance.
   */
  get lendingPoolAddressProviderContract(): ethers.Contract {
    if (!this._lpAddressProviderContract) {
      throw new Error("Please pvovide the lending pool address");
    }
    return this._lpAddressProviderContract;
  }

  /**
   * Entry point to aave provider for depositing collateral and borrowing assets
   * @param lpAddressProviderAddress  LendingPoolAddressProviderAddress
   * @param provider Web3Provider instance
   * @returns
   */

  async connect(
    lpAddressProviderAddress: string,
    provider: any,
    signer: ethers.Wallet
  ): Promise<{ done: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      try {
        this._lendingProviderAddress = lpAddressProviderAddress;
        this._lpAddressProviderContract = new ethers.Contract(
          lpAddressProviderAddress,
          LendingPoolAddressProviderABI,
          signer
        );
        this._signer = signer;
        // connect the provider
        this._provider = provider;
        resolve({ done: true, message: "successfully connected" });
      } catch (error) {
        console.log("Error", error);
        reject(error);
      }
    });
  }

  /**
   *
   * @returns String of LendingPoolAddress
   */
  async getLendingPoolAddress(): Promise<string> {
    try {
      return await this._lpAddressProviderContract.getLendingPool();
    } catch (error: any) {
      throw Error(`Error getting lendingPool address: ${error.message}`);
    }
  }

  /**
   *
   * @returns String of lendingPool Core address
   */
  async getLendingPoolCoreAddress(): Promise<string> {
    console.log(
      "Core Address",
      await this._lpAddressProviderContract.getLendingPoolCore()
    );
    try {
      return await this._lpAddressProviderContract.getLendingPoolCore();
    } catch (error: any) {
      throw Error(`Error getting lendingPool Core address: ${error.message}`);
    }
  }

  /**
   *
   * @returns Get Connected user address
   */

  async userAddress(): Promise<string> {
    return await this.provider.getSigner().getAddress();
  }

  /**
   * Get connected Signer authenticated account
   */
  async signer(): Promise<ethers.providers.JsonRpcSigner> {
    return this.provider.getSigner();
  }

  /**
   * Allow connect wallet to deposit colleteral to aave protocol
   * @param amount
   * @param assetAddress
   * @returns
   */
  async depositCollateral(
    amount: string,
    assetAddress: string,
    signer: ethers.Wallet
  ) {
    try {
      const referralCode = 0;
      let nonce = await this.provider.getTransactionCount(
        await signer.getAddress(),
        "pending"
      );

      const lendingPoolAddress = await this.getLendingPoolAddress();

      const assetContact = new ethers.Contract(assetAddress, ERC20ABI, signer);
      // approve asset
      const txApprove = await assetContact.approve(lendingPoolAddress, amount, {
        gasLimit: "600000",
        nonce,
      });

      console.log(`APPROVE: ${txApprove?.hash}`);

      // Get lending Pool Contract instance
      const lendingPoolContract = new ethers.Contract(
        lendingPoolAddress,
        LendingPoolABI,
        signer
      );

      // deposit amount
      const tx = await lendingPoolContract.deposit(
        assetAddress,
        amount,
        signer.address,
        referralCode,
        {
          gasLimit: "600000",
          nonce: nonce + 1,
          from: await signer.getAddress(),
        }
      );
      console.log(`DEPOSIT: ${tx?.hash}`);

      return {
        message: "Successfully deposited amount for collateral",
        error: "",
        tx: tx,
      };
    } catch (error) {
      return { message: "Error occurred", error, tx: "" };
    }
  }

  async borrowAsset(
    amount: string,
    assetAddress: string,
    interestRateMode: number,
    signer: ethers.Wallet
  ) {
    try {
      const referralCode = "0";

      const assetContact = new ethers.Contract(assetAddress, ERC20ABI, signer);
      console.log(`Initial Balance: ${assetContact.balanceOf(signer.address)}`);


      const lendingPoolAddress = await this.getLendingPoolAddress();

      console.log("lendingPoolAddress", lendingPoolAddress)

      
      let nonce = await this.provider.getTransactionCount(
        await signer.getAddress(),
        "pending"
      );


      // approve asset
      // const txApprove = await assetContact.approve(lendingPoolAddress, amount, {
      //   gasLimit: "600000",
      //   nonce,
      // });

      // console.log(`BORROWS APPROVE: ${txApprove?.hash}`);

      // Get lending Pool Contract instance
      const lendingPoolContract = new ethers.Contract(
        lendingPoolAddress,
        LendingPoolABI,
        signer
      );


     const borrow =  await lendingPoolContract.borrow(
        assetAddress,
        amount,
        interestRateMode,
        referralCode,
        signer.address,
        {
          gasLimit: "600000",
          nonce : nonce,
        }
      );
      console.log(borrow)
      console.log(`After Balance: ${assetContact.balanceOf(signer.address)}`);
      return { message: "Successfully borrowed asset", error: null };
    } catch (error: any) {
      return { message: "Error occurred", error };
    }
  }
}

export const aaveProvider = new AaveProvider();
