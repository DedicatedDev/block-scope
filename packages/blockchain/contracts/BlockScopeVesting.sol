// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlockScopeVesting.sol";
import "hardhat/console.sol";

contract BlockScopeVesting is Ownable, IBlockScopeVesting {
    struct Vesting {
        uint256 amount;
        uint256 releaseTime;
        bool claimed;
    }

    mapping(address => Vesting) public vestings;
    IERC20 public token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function setVesting(
        address beneficiary,
        uint256 amount,
        uint256 releaseTime
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid address");
        require(amount > 0, "Amount should be greater than 0");
        require(
            releaseTime > block.timestamp,
            "Release time should be in the future"
        );

        vestings[beneficiary] = Vesting(amount, releaseTime, false);

        // Move token from owner wallet to this contract.
        token.transferFrom(msg.sender, address(this), amount);

        emit TokensVested(beneficiary, amount, releaseTime);
    }

    function claimTokens() external {
        Vesting storage vesting = vestings[msg.sender];

        require(vesting.amount > 0, "No tokens to claim");
        require(!vesting.claimed, "Tokens already claimed");

        require(
            block.timestamp >= vesting.releaseTime,
            "Tokens are not yet claimable"
        );

        vesting.claimed = true;

        require(
            token.transfer(msg.sender, vesting.amount),
            "Token transfer failed"
        );

        emit TokensClaimed(msg.sender, vesting.amount);
    }

    // Transfer ownership to a new address. New owner has to call `acceptOwnership` to confirm.
    address public newOwner;

    // New owner can accept the ownership.
    function acceptOwnership() public {
        require(
            msg.sender == newOwner,
            "Only the potential new owner can accept ownership"
        );
        emit OwnershipTransferred(owner(), newOwner);
        transferOwnership(newOwner);
        newOwner = address(0);
    }

    // Owner can renounce the ownership.
}
