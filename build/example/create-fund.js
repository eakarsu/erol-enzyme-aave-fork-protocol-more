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
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
var ethers_1 = require("ethers");
var create_fund_1 = require("../funds/create-fund");
var index_1 = require("./../index");
var create_fund_2 = require("../funds/create-fund");
var create_fund_3 = require("../funds/create-fund");
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var provider, USER_ADDRESS, USER_PRIVATE_KEY, signer, denominationAsset, policyManagerConfigData, managementFee, performanceFee, entranceFee, feeManagerSettingsData, fees, feeArgsData, fund, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = new ethers_1.ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/f7f0290fa86240888223b0ad599c71a1");
                USER_ADDRESS = "0xf83F4c3A25b8FEE1722d76e5F72AaFcA00845011";
                USER_PRIVATE_KEY = "0x2c283ea64fe7352dd1b1125723a260524e9ad0a6c0a8008b240f904265c0cfd2";
                signer = new ethers_1.ethers.Wallet(USER_PRIVATE_KEY, provider);
                denominationAsset = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
                policyManagerConfigData = ethers_1.utils.hexlify("0x");
                managementFee = "1";
                performanceFee = "10";
                entranceFee = "2";
                feeManagerSettingsData = [
                    (0, index_1.getManagementFees)(managementFee),
                    (0, create_fund_1.getEntranceRateFeeConfigArgs)(entranceFee),
                    (0, create_fund_1.getPerformanceFees)(performanceFee, 12),
                ];
                fees = [
                    create_fund_1.ManagementFee.address,
                    create_fund_2.EntranceRateDirectFee.address,
                    create_fund_3.PerformanceFee.address,
                ];
                console.log("DATA", fees, feeManagerSettingsData);
                return [4 /*yield*/, (0, create_fund_1.getFeesManagerConfigArgsData)(fees, feeManagerSettingsData, USER_ADDRESS, true)];
            case 1:
                feeArgsData = _a.sent();
                console.log("ARGS", feeArgsData);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, index_1.createNewFund)(signer, "WE FUND 1", denominationAsset, 10000, feeArgsData, policyManagerConfigData, "10000000", provider, USER_ADDRESS)];
            case 3:
                fund = _a.sent();
                console.log(fund);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.start = start;
