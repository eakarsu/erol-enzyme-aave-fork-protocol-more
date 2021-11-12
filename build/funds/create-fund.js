"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeesManagerConfigArgsData = exports.getPolicyArgsData = exports.getEntranceRateFeeConfigArgs = exports.getPerformanceFees = exports.getManagementFees = exports.createNewFund = exports.AdapterWhitelist = exports.AdapterBlacklist = exports.AssetWhitelist = exports.AssetBlacklist = exports.MinMaxInvestment = exports.EntranceRateDirectFee = exports.ManagementFee = exports.PerformanceFee = void 0;
var ethers_1 = require("ethers");
var FundDeployer_json_1 = __importDefault(require("./../abis/FundDeployer.json"));
var fund_1 = require("./../utils/fund");
var ManagementFee_json_1 = __importDefault(require("./../abis/ManagementFee.json"));
exports.ManagementFee = ManagementFee_json_1.default;
var PerformanceFee_json_1 = __importDefault(require("./../abis/PerformanceFee.json"));
exports.PerformanceFee = PerformanceFee_json_1.default;
var FeeManager_json_1 = __importDefault(require("./../abis/FeeManager.json"));
var EntranceRateDirectFee_json_1 = __importDefault(require("./../abis/EntranceRateDirectFee.json"));
exports.EntranceRateDirectFee = EntranceRateDirectFee_json_1.default;
var MinMaxInvestment_json_1 = __importDefault(require("./../abis/MinMaxInvestment.json"));
exports.MinMaxInvestment = MinMaxInvestment_json_1.default;
var AssetBlacklist_json_1 = __importDefault(require("./../abis/AssetBlacklist.json"));
exports.AssetBlacklist = AssetBlacklist_json_1.default;
var AssetWhitelist_json_1 = __importDefault(require("./../abis/AssetWhitelist.json"));
exports.AssetWhitelist = AssetWhitelist_json_1.default;
var AdapterBlacklist_json_1 = __importDefault(require("./../abis/AdapterBlacklist.json"));
exports.AdapterBlacklist = AdapterBlacklist_json_1.default;
var AdapterWhitelist_json_1 = __importDefault(require("./../abis/AdapterWhitelist.json"));
exports.AdapterWhitelist = AdapterWhitelist_json_1.default;
var createNewFund = function (signer, fundName, denominationAsset, timeLockInSeconds, feeManagerConfig, policyManagerConfigData, gaslimit, provider, address) { return __awaiter(void 0, void 0, void 0, function () {
    var nonce, FundDeployerInterface, fundDeployer, fund;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, provider.getTransactionCount(address, "pending")];
            case 1:
                nonce = _a.sent();
                FundDeployerInterface = new ethers_1.ethers.utils.Interface(JSON.parse(JSON.stringify(FundDeployer_json_1.default.abi)));
                fundDeployer = new ethers_1.ethers.Contract(FundDeployer_json_1.default.address, FundDeployerInterface, signer);
                return [4 /*yield*/, fundDeployer.createNewFund(address, fundName, denominationAsset, timeLockInSeconds, feeManagerConfig, policyManagerConfigData, { nonce: nonce, gasLimit: gaslimit })];
            case 2:
                fund = _a.sent();
                return [2 /*return*/, fund];
        }
    });
}); };
exports.createNewFund = createNewFund;
/**
 * Rate is  number representing a 1%
 */
var getManagementFees = function (rate) {
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
var getPerformanceFees = function (rate, period) {
    // The period will default to 30 days
    var defaultPeriod = 2592000;
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
var getPolicyArgsData = function (policies, policySettings) {
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
var getFeesManagerConfigArgsData = function (fees, feeManagerSettingsData, _signer, allow) { return __awaiter(void 0, void 0, void 0, function () {
    var FeeManagerInterface, feeManager, fees_unregister, registeredFees, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // remove code
                console.log(fees, feeManagerSettingsData, _signer, allow);
                FeeManagerInterface = new ethers_1.ethers.utils.Interface(JSON.parse(JSON.stringify(FeeManager_json_1.default.abi)));
                feeManager = new ethers_1.ethers.Contract(FeeManager_json_1.default.address, FeeManagerInterface);
                fees_unregister = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                if (!allow) return [3 /*break*/, 7];
                return [4 /*yield*/, feeManager.getRegisteredFees()];
            case 2:
                registeredFees = _a.sent();
                if (!(registeredFees.length === 0)) return [3 /*break*/, 4];
                fees_unregister = [ManagementFee_json_1.default.address, PerformanceFee_json_1.default.address];
                return [4 /*yield*/, feeManager.registerFees(fees_unregister, { gasLimit: 300000 })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                if (!registeredFees.includes(ManagementFee_json_1.default.address)) {
                    fees_unregister.push(ManagementFee_json_1.default.address);
                }
                if (!registeredFees.includes(PerformanceFee_json_1.default.address)) {
                    fees_unregister.push(PerformanceFee_json_1.default.address);
                }
                if (!registeredFees.includes(EntranceRateDirectFee_json_1.default.address)) {
                    fees_unregister.push(EntranceRateDirectFee_json_1.default.address);
                }
                _a.label = 5;
            case 5:
                if (!(fees_unregister.length > 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, feeManager.registerFees(fees_unregister, { gasLimit: 300000 })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _a.sent();
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, (0, fund_1.feeManagerConfigArgs)({
                    fees: fees,
                    settings: feeManagerSettingsData,
                })];
        }
    });
}); };
exports.getFeesManagerConfigArgsData = getFeesManagerConfigArgsData;
