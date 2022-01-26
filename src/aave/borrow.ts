import {
  web3,
  LendingPoolABI,
  ERC20ABI,
  getLendingPoolAddress,
  getLendingPoolCoreAddress,
  myAccount,
} from "./utils";

const interestRateMode = 2; // variable rate
const referralCode = "0";

export const aaveBorrowToken = async (amount: string, assetAddress: string) => {
  const amountToWei = web3.utils.toWei(amount, "ether").toString();

  const account = (await myAccount()).address;
  const lpCoreAddress = await getLendingPoolCoreAddress();
  const gasPrice = await web3.eth.getGasPrice();

  // work out our current balance
  const daiContract = new web3.eth.Contract(ERC20ABI, assetAddress);
  let balance = await daiContract.methods.balanceOf(myAccount).call();
  console.log("initial balance: " + web3.utils.fromWei(balance, "ether"));
  // Approve the LendingPoolCore address with the DAI contract
  let approve = daiContract.methods.approve(lpCoreAddress, amountToWei);
  await approve
    .send({
      from: account,
      gasLimit: web3.utils.toHex(60000),
      gasPrice,
    })
    .catch((e: any) => {
      throw Error(`Error approving allowance: ${e.message}`);
    });

  // The borrow transaction via LendingPool contract
  const lpAddress = await getLendingPoolAddress();
  const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress);
  const borrow = lpContract.methods.borrow(
    assetAddress,
    amountToWei,
    interestRateMode,
    referralCode
  );

  await borrow
    .send({
      from: account,
      gasLimit: web3.utils.toHex(800000),
      gasPrice,
    })
    .catch((e: any) => {
      throw Error(
        `Error borrowing from the LendingPool contract: ${e.message}`
      );
    });

  // display the final balance
  balance = await daiContract.methods
    .balanceOf(myAccount)
    .call()
    .catch((e: any) => {
      throw Error("Error getting balance: " + e.message);
    });
  console.log("final balance: " + web3.utils.fromWei(balance, "ether"));
  console.log("success!");
};
