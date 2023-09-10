// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IBlockScopePayment {
    struct Tier {
        string name;
        uint256 price;
    }

    // events
    event PaymentReceived(
        address indexed payer,
        uint256 amount,
        uint256 daoShare,
        uint256 burned
    );
}
