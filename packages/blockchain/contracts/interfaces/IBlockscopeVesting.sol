// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IBlockScopeVesting {
    // events
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event TokensVested(
        address indexed beneficiary,
        uint256 amount,
        uint256 releaseTime
    );
}
