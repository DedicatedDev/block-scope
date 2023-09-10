// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlockscopeToken.sol";

contract BlockscopeToken is ERC20, Ownable, IBlockScopeToken {
    constructor() ERC20("Blockscope", "SCOPE") {
        _mint(msg.sender, 1000000000 * 10 ** 18); // 1 Billion tokens with 18 decimals
    }
}
