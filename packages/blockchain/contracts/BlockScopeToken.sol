// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlockScopeToken.sol";

contract BlockScopeToken is ERC20, Ownable, IBlockScopeToken {
    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) ERC20(name, symbol) {
        _transferOwnership(owner);
        _mint(owner, 1000000000 * 10 ** 18); // 1 Billion tokens with 18 decimals
    }
}
