import Web3 from "web3";

const web3 = new Web3(
  "https://kovan.infura.io/v3/99675269b87d4d1a95e121eaa24eac24"
);

const LendingPoolAddressProviderABI = require("./ABIs/AddressProvider.json");
const LendingPoolABI = require("./ABIs/LendingPool.json");
const ERC20ABI = require("./ABIs/ERC20.json");

const lpAddressProviderAddress = "0x88757f2f99175387aB4C6a4b3067c77A695b0349";
const lpAddressProviderContract = new web3.eth.Contract(
  LendingPoolAddressProviderABI,
  lpAddressProviderAddress
);

export {
  lpAddressProviderAddress,
  LendingPoolAddressProviderABI,
  lpAddressProviderContract,
  LendingPoolABI,
  ERC20ABI,
};

export const getLendingPoolAddress = async () => {
  const lpAddress = await lpAddressProviderContract.methods
    .getLendingPool()
    .call()
    .catch((e: any) => {
      throw Error(`Error getting lendingPool address: ${e.message}`);
    });
  console.log("LendingPool address: " + lpAddress);
  return lpAddress;
};

export const getLendingPoolCoreAddress = async () => {
  const lpCoreAddress = await lpAddressProviderContract.methods
    .getLendingPoolCore()
    .call()
    .catch((e: any) => {
      throw Error(`Error getting lendingPool address: ${e.message}`);
    });

  console.log("LendingPoolCore address: " + lpCoreAddress);
  return lpCoreAddress;
};

export const myAccount = async () => {
  const account = web3.eth.accounts.privateKeyToAccount(
    "0x2c283ea64fe7352dd1b1125723a260524e9ad0a6c0a8008b240f904265c0cfd2"
  );
  // allow account to transact
  web3.eth.accounts.wallet.add(account);

  console.log(
    "Wallet balance",
    web3.utils.fromWei(
      await web3.eth.getBalance("0xf83F4c3A25b8FEE1722d76e5F72AaFcA00845011"),
      "ether"
    )
  );
  return account;
};

export { web3 };
