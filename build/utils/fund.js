"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertScaledPerSecondRateToRate = exports.policyManagerConfigArgs = exports.minMaxInvestmentArgs = exports.maxConcentrationArgs = exports.investorWhitelistArgs = exports.guaranteedRedemptionArgs = exports.buySharesPriceFeedToleranceArgs = exports.buySharesCallerWhitelistArgs = exports.assetWhitelistArgs = exports.assetBlacklistArgs = exports.adapterWhitelistArgs = exports.adapterBlacklistArgs = exports.managementFeeSharesDue = exports.rpow = exports.entranceRateFeeSharesDue = exports.entranceRateFeeConfigArgs = exports.performanceFeeConfigArgs = exports.convertRateToScaledPerSecondRate = exports.managementFeeConfigArgs = exports.payoutSharesOutstandingForFeesArgs = exports.feeManagerConfigArgs = exports.encodeFunctionData = exports.encodeArgs = exports.secondsPerYear = exports.managementFeeScaleDecimal = exports.managementFeeScale = exports.managementFeeDigits = exports.sighash = void 0;
var ethers_1 = require("ethers");
var ethers_2 = require("@enzymefinance/ethers");
var decimal_js_1 = require("decimal.js");
function sighash(fragment) {
    return ethers_1.utils.hexDataSlice(ethers_1.utils.id(fragment.format()), 0, 4);
}
exports.sighash = sighash;
exports.managementFeeDigits = 27;
exports.managementFeeScale = ethers_1.BigNumber.from(10).pow(exports.managementFeeDigits);
exports.managementFeeScaleDecimal = new decimal_js_1.Decimal(exports.managementFeeScale.toString());
exports.secondsPerYear = 365 * 24 * 60 * 60;
decimal_js_1.Decimal.set({ precision: 2 * exports.managementFeeDigits });
// ethers.utils.parseEther("0.1") // 10%
function encodeArgs(types, args) {
    var params = types.map(function (type) { return ethers_1.utils.ParamType.from(type); });
    var resolved = (0, ethers_2.resolveArguments)(params, args); // byteLike value
    var hex = ethers_1.utils.defaultAbiCoder.encode(params, resolved);
    return ethers_1.utils.hexlify(ethers_1.utils.arrayify(hex));
}
exports.encodeArgs = encodeArgs;
function encodeFunctionData(fragment, args) {
    var encodedArgs = encodeArgs(fragment.inputs, args);
    return ethers_1.utils.hexlify(ethers_1.utils.concat([sighash(fragment), encodedArgs]));
}
exports.encodeFunctionData = encodeFunctionData;
function feeManagerConfigArgs(_a) {
    var fees = _a.fees, settings = _a.settings;
    return encodeArgs(["address[]", "bytes[]"], [fees, settings]);
}
exports.feeManagerConfigArgs = feeManagerConfigArgs;
function payoutSharesOutstandingForFeesArgs(fees) {
    return encodeArgs(["address[]"], [fees]);
}
exports.payoutSharesOutstandingForFeesArgs = payoutSharesOutstandingForFeesArgs;
// START OF MANANGEMENT FEES
function managementFeeConfigArgs(scaledPerSecondRate) {
    return encodeArgs(["uint256"], [scaledPerSecondRate]);
}
exports.managementFeeConfigArgs = managementFeeConfigArgs;
function convertRateToScaledPerSecondRate(rate) {
    var rateD = new decimal_js_1.Decimal(ethers_1.utils.formatEther(rate));
    var effectivRate = rateD.div(new decimal_js_1.Decimal(1).minus(rateD));
    var factor = new decimal_js_1.Decimal(1)
        .plus(effectivRate)
        .pow(1 / exports.secondsPerYear)
        .toSignificantDigits(exports.managementFeeDigits)
        .mul(exports.managementFeeScaleDecimal);
    return ethers_1.BigNumber.from(factor.toFixed(0));
}
exports.convertRateToScaledPerSecondRate = convertRateToScaledPerSecondRate;
// END OF MANAGEMENT FEES
// PERFORMANCE FEES
function performanceFeeConfigArgs(rate, period) {
    return encodeArgs(["uint256", "uint256"], [rate, period]);
}
exports.performanceFeeConfigArgs = performanceFeeConfigArgs;
// END OF PERFORMANCE FEES
// ENTRANCE FEES
function entranceRateFeeConfigArgs(rate) {
    return encodeArgs(["uint256"], [rate]);
}
exports.entranceRateFeeConfigArgs = entranceRateFeeConfigArgs;
function entranceRateFeeSharesDue(_a) {
    var rate = _a.rate, sharesBought = _a.sharesBought;
    return ethers_1.BigNumber.from(sharesBought)
        .mul(rate)
        .div(ethers_1.utils.parseEther("1").add(rate));
}
exports.entranceRateFeeSharesDue = entranceRateFeeSharesDue;
// END OF ENTRACE FEES
// START OF MANANGEMENT FEES
function rpow(x, n, b) {
    var xD = new decimal_js_1.Decimal(ethers_1.BigNumber.from(x).toString());
    var bD = new decimal_js_1.Decimal(ethers_1.BigNumber.from(b).toString());
    var nD = new decimal_js_1.Decimal(ethers_1.BigNumber.from(n).toString());
    var xDPow = xD.div(bD).pow(nD);
    return ethers_1.BigNumber.from(xDPow.mul(bD).toFixed(0));
}
exports.rpow = rpow;
function managementFeeSharesDue(_a) {
    var scaledPerSecondRate = _a.scaledPerSecondRate, sharesSupply = _a.sharesSupply, secondsSinceLastSettled = _a.secondsSinceLastSettled;
    var timeFactor = rpow(scaledPerSecondRate, secondsSinceLastSettled, exports.managementFeeScale);
    var sharesDue = ethers_1.BigNumber.from(sharesSupply)
        .mul(timeFactor.sub(exports.managementFeeScale))
        .div(exports.managementFeeScale);
    return sharesDue;
}
exports.managementFeeSharesDue = managementFeeSharesDue;
// END OF MANAGEMENT FEES
///
function adapterBlacklistArgs(adapters) {
    return encodeArgs(["address[]"], [adapters]);
}
exports.adapterBlacklistArgs = adapterBlacklistArgs;
function adapterWhitelistArgs(adapters) {
    return encodeArgs(["address[]"], [adapters]);
}
exports.adapterWhitelistArgs = adapterWhitelistArgs;
function assetBlacklistArgs(assets) {
    return encodeArgs(["address[]"], [assets]);
}
exports.assetBlacklistArgs = assetBlacklistArgs;
function assetWhitelistArgs(assets) {
    return encodeArgs(["address[]"], [assets]);
}
exports.assetWhitelistArgs = assetWhitelistArgs;
function buySharesCallerWhitelistArgs(_a) {
    var _b = _a.buySharesCallersToAdd, buySharesCallersToAdd = _b === void 0 ? [] : _b, _c = _a.buySharesCallersToRemove, buySharesCallersToRemove = _c === void 0 ? [] : _c;
    return encodeArgs(["address[]", "address[]"], [buySharesCallersToAdd, buySharesCallersToRemove]);
}
exports.buySharesCallerWhitelistArgs = buySharesCallerWhitelistArgs;
function buySharesPriceFeedToleranceArgs(tolerance) {
    return encodeArgs(["uint256"], [tolerance]);
}
exports.buySharesPriceFeedToleranceArgs = buySharesPriceFeedToleranceArgs;
function guaranteedRedemptionArgs(_a) {
    var startTimestamp = _a.startTimestamp, duration = _a.duration;
    return encodeArgs(["uint256", "uint256"], [startTimestamp, duration]);
}
exports.guaranteedRedemptionArgs = guaranteedRedemptionArgs;
function investorWhitelistArgs(_a) {
    var _b = _a.investorsToAdd, investorsToAdd = _b === void 0 ? [] : _b, _c = _a.investorsToRemove, investorsToRemove = _c === void 0 ? [] : _c;
    return encodeArgs(["address[]", "address[]"], [investorsToAdd, investorsToRemove]);
}
exports.investorWhitelistArgs = investorWhitelistArgs;
function maxConcentrationArgs(maxConcentration) {
    return encodeArgs(["uint256"], [maxConcentration]);
}
exports.maxConcentrationArgs = maxConcentrationArgs;
function minMaxInvestmentArgs(_a) {
    var minInvestmentAmount = _a.minInvestmentAmount, maxInvestmentAmount = _a.maxInvestmentAmount;
    return encodeArgs(["uint256", "uint256"], [minInvestmentAmount, maxInvestmentAmount]);
}
exports.minMaxInvestmentArgs = minMaxInvestmentArgs;
function policyManagerConfigArgs(_a) {
    var policies = _a.policies, settings = _a.settings;
    return encodeArgs(["address[]", "bytes[]"], [policies, settings]);
}
exports.policyManagerConfigArgs = policyManagerConfigArgs;
function convertScaledPerSecondRateToRate(scaledPerSecondRate) {
    var scaledPerSecondRateD = new decimal_js_1.Decimal(scaledPerSecondRate.toString()).div(exports.managementFeeScaleDecimal);
    var effectiveRate = scaledPerSecondRateD
        .pow(exports.secondsPerYear)
        .minus(new decimal_js_1.Decimal(1));
    var rate = effectiveRate.div(new decimal_js_1.Decimal(1).plus(effectiveRate));
    return ethers_1.utils.parseEther(rate.toFixed(17, decimal_js_1.Decimal.ROUND_UP));
}
exports.convertScaledPerSecondRateToRate = convertScaledPerSecondRateToRate;
