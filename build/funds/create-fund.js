"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDecimals = exports.getFeesManagerConfigArgsData = exports.getPolicyArgsData = exports.getEntranceRateFeeConfigArgs = exports.getPerformanceFees = exports.getManagementFees = exports.createNewFund = exports.AdapterWhitelist = exports.AdapterBlacklist = exports.AssetWhitelist = exports.AssetBlacklist = exports.MinMaxInvestment = exports.EntranceRateDirectFee = exports.ManagementFee = exports.PerformanceFee = void 0;
const ethers_1 = require("ethers");
const FundDeployer_json_1 = __importDefault(require("./../abis/FundDeployer.json"));
const prep_abis_1 = require("./../prep-abis");
const fund_1 = require("./../utils/fund");
const prep_abis_2 = require("./../prep-abis");
Object.defineProperty(exports, "AssetWhitelist", { enumerable: true, get: function () { return prep_abis_2.AssetWhitelist; } });
Object.defineProperty(exports, "AssetBlacklist", { enumerable: true, get: function () { return prep_abis_2.AssetBlacklist; } });
Object.defineProperty(exports, "AdapterBlacklist", { enumerable: true, get: function () { return prep_abis_2.AdapterBlacklist; } });
Object.defineProperty(exports, "AdapterWhitelist", { enumerable: true, get: function () { return prep_abis_2.AdapterWhitelist; } });
Object.defineProperty(exports, "PerformanceFee", { enumerable: true, get: function () { return prep_abis_2.PerformanceFee; } });
Object.defineProperty(exports, "MinMaxInvestment", { enumerable: true, get: function () { return prep_abis_2.MinMaxInvestment; } });
Object.defineProperty(exports, "ManagementFee", { enumerable: true, get: function () { return prep_abis_2.ManagementFee; } });
Object.defineProperty(exports, "EntranceRateDirectFee", { enumerable: true, get: function () { return prep_abis_2.EntranceRateDirectFee; } });
const createNewFund = async (signer, fundName, denominationAsset, timeLockInSeconds, feeManagerConfig, policyManagerConfigData, gaslimit, provider, address) => {
    const nonce = await provider.getTransactionCount(address, "pending");
    // remove code
    // GET FundDeployer Interface Data
    const FundDeployerInterface = new ethers_1.ethers.utils.Interface(JSON.parse(JSON.stringify(FundDeployer_json_1.default.abi)));
    // FundDeployer Contract
    const fundDeployer = new ethers_1.ethers.Contract(FundDeployer_json_1.default.address, FundDeployerInterface, signer);
    //0xd0a1e359811322d97991e03f863a0c30c2cf029c
    const fund = await fundDeployer.createNewFund(address, fundName, denominationAsset, timeLockInSeconds, feeManagerConfig, policyManagerConfigData, { nonce: nonce, gasLimit: gaslimit });
    return fund;
};
exports.createNewFund = createNewFund;
/**
 * Rate is  number representing a 1%
 */
const getManagementFees = (rate) => {
    // Must convert from rate to scaledPerSecondRate
    var scaledPerSecondRate = (0, fund_1.convertRateToScaledPerSecondRate)(rate);
    return (0, fund_1.managementFeeConfigArgs)(scaledPerSecondRate);
};
exports.getManagementFees = getManagementFees;
/**
 *
 * @param {*} rate Rate in percentage
 * @param {*} period Period at which it will be applied
 */
const getPerformanceFees = (rate, period) => {
    // The period will default to 30 days
    const defaultPeriod = 2592000;
    // remove code
    // The rate must be (rate/100 * 10**18) or directly rate * 10**16;
    rate = ethers_1.utils.parseEther((rate / 100).toString());
    return (0, fund_1.performanceFeeConfigArgs)(rate, defaultPeriod);
};
exports.getPerformanceFees = getPerformanceFees;
/**
 * Rate is  number representing a 1%
 */
function getEntranceRateFeeConfigArgs(rate) {
    // The rate must be (rate/100 * 10**18) or directly rate * 10**16;
    rate = ethers_1.utils.parseEther(rate.toString());
    return (0, fund_1.encodeArgs)(["uint256"], [rate]);
}
exports.getEntranceRateFeeConfigArgs = getEntranceRateFeeConfigArgs;
const getPolicyArgsData = (policies, policySettings) => {
    return (0, fund_1.encodeArgs)(["address[]", "bytes[]"], [policies, policySettings]);
};
exports.getPolicyArgsData = getPolicyArgsData;
/**
 *
 * @param {*} fees
 * @param {*} feeManagerSettingsData
 * @param {*} _signer
 * @param {*} allow
 * @returns
 */
const getFeesManagerConfigArgsData = async (fees, feeManagerSettingsData, _signer, allow) => {
    // remove code
    // console.log(fees, feeManagerSettingsData, _signer, allow);
    const FeeManagerInterface = new ethers_1.ethers.utils.Interface(JSON.parse(JSON.stringify(prep_abis_2.FeeManager.abi)));
    // remove in mainnet
    const feeManager = new ethers_1.ethers.Contract(prep_abis_2.FeeManager.address, FeeManagerInterface);
    let fees_unregister = [];
    // end
    try {
        if (allow) {
            const registeredFees = await feeManager.getRegisteredFees();
            if (registeredFees.length === 0) {
                fees_unregister = [prep_abis_2.ManagementFee.address, prep_abis_2.PerformanceFee.address];
                await feeManager.registerFees(fees_unregister, { gasLimit: 300000 });
            }
            else {
                if (!registeredFees.includes(prep_abis_2.ManagementFee.address)) {
                    fees_unregister.push(prep_abis_2.ManagementFee.address);
                }
                if (!registeredFees.includes(prep_abis_2.PerformanceFee.address)) {
                    fees_unregister.push(prep_abis_2.PerformanceFee.address);
                }
                if (!registeredFees.includes(prep_abis_2.EntranceRateDirectFee.address)) {
                    fees_unregister.push(prep_abis_2.EntranceRateDirectFee.address);
                }
            }
            // Register this fees for app use
            if (fees_unregister.length > 0) {
                await feeManager.registerFees(fees_unregister, { gasLimit: 300000 });
            }
        }
        // Convert Fees
    }
    catch (error) { }
    return (0, fund_1.feeManagerConfigArgs)({
        fees: fees,
        settings: feeManagerSettingsData,
    });
};
exports.getFeesManagerConfigArgsData = getFeesManagerConfigArgsData;
/**
 *
 * @param assetAddress Asset address
 * @param signer
 * @returns
 */
async function getAssetDecimals(assetAddress, signer) {
    try {
        // we use VaultLib as an interface because it has the `decimals()` getter
        const assetInterface = new ethers_1.ethers.utils.Interface(JSON.parse(JSON.stringify(prep_abis_1.VaultLib.abi)));
        const asset = new ethers_1.ethers.Contract(assetAddress, assetInterface, signer);
        const decimals = await asset.decimals();
        return decimals;
    }
    catch (error) {
        return { error: false };
    }
}
exports.getAssetDecimals = getAssetDecimals;
