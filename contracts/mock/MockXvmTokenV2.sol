// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../XvmToken.sol";

contract MockXvmTokenV2 is XvmToken {
    uint16 public upgradeCount;

    function addUpgradeCount() public onlyOwner {
        upgradeCount += 1;
    }

    function ver() public pure returns (string memory) {
        return "v0.2.0";
    }
}
