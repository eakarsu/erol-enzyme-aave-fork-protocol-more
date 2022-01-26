import {
  web3,
  LendingPoolABI,
  ERC20ABI,
  getLendingPoolAddress,
  getLendingPoolCoreAddress,
  myAccount,
} from "./utils";

const referralCode = "0";

export const aaveDepositCollateral = async (
  amount: string,
  assetAddress: string
) => {
  // Account Address
  const account = (await myAccount()).address;

  // Amount to deposit in wei
  const amountInWei = web3.utils.toWei(amount, "ether").toString();

  // const lpCoreAddress = await getLendingPoolAddress();
  // // Approve the LendingPoolCore address with the DAI contract
  // const daiContract = new web3.eth.Contract(ERC20ABI, assetAddress);

  // let approve = daiContract.methods.approve(lpCoreAddress, amountInWei);
  const gasPrice = await web3.eth.getGasPrice();

  // await approve
  //   .send({
  //     from: account,
  //     gasLimit: web3.utils.toHex(1000000),
  //     gasPrice,
  //     nonce: web3.utils.toHex(await web3.eth.getTransactionCount(account)),
  //   })
  //   .catch((e: any) => {
  //     throw Error(`Error approving allowance: ${e.message}`);
  //   });

  // make the deposit transactions via lendingPool

  const lpAddress = await getLendingPoolAddress();
  const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress);
  const deposit = lpContract.methods.deposit(assetAddress, amountInWei, 0);
  const tx = await deposit
    .send({
      from: account,
      gasLimit: web3.utils.toHex(1000000),
      gasPrice,
      nonce: web3.utils.toHex(await web3.eth.getTransactionCount(account)),
    })
    .catch((e: any) => {
      throw Error(`Error depositing to the LendingPool contract: ${e.message}`);
    });
  console.log(tx);
  console.log("success!");
};
