"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const ethers_1 = require("ethers");
const create_fund_1 = require("../funds/create-fund");
const index_1 = require("./../index");
const create_fund_2 = require("../funds/create-fund");
const create_fund_3 = require("../funds/create-fund");
const start = async () => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/f7f0290fa86240888223b0ad599c71a1");
    const USER_ADDRESS = "0xf83F4c3A25b8FEE1722d76e5F72AaFcA00845011";
    const USER_PRIVATE_KEY = "0x2c283ea64fe7352dd1b1125723a260524e9ad0a6c0a8008b240f904265c0cfd2";
    const signer = new ethers_1.ethers.Wallet(USER_PRIVATE_KEY, provider);
    const denominationAsset = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
    const policyManagerConfigData = ethers_1.utils.hexlify("0x");
    const managementFee = "1";
    const performanceFee = "10";
    const entranceFee = "2";
    let feeManagerSettingsData = [
        (0, index_1.getManagementFees)(managementFee),
        (0, create_fund_1.getEntranceRateFeeConfigArgs)(entranceFee),
        (0, create_fund_1.getPerformanceFees)(performanceFee, 12),
    ]; // value configurations
    let fees = [
        create_fund_1.ManagementFee.address,
        create_fund_2.EntranceRateDirectFee.address,
        create_fund_3.PerformanceFee.address,
    ]; // list of address
    console.log("DATA", fees, feeManagerSettingsData);
    const feeArgsData = await (0, create_fund_1.getFeesManagerConfigArgsData)(fees, feeManagerSettingsData, USER_ADDRESS, true);
    console.log("ARGS", feeArgsData);
    try {
        const fund = await (0, index_1.createNewFund)(signer, "WE FUND 1", denominationAsset, 10000, feeArgsData, policyManagerConfigData, "10000000", provider, USER_ADDRESS);
        console.log(fund);
    }
    catch (error) {
        console.log(error);
    }
};
exports.start = start;
