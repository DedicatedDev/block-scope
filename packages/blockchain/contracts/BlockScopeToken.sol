// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IBlockScopeToken.sol";

contract BlockScopeToken is ERC20, Ownable, IBlockScopeToken {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet admins;

    modifier onlyAdmin() {
        require(
            admins.contains(msg.sender),
            "BlockScopeToken: have no authorization!"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) ERC20(name, symbol) {
        _transferOwnership(owner);
        _mint(owner, 1000000000 * 10 ** 18); // 1 Billion tokens with 18 decimals
    }

    function addAdmin(address admin) external onlyOwner {
        admins.add(admin);
    }

    function burnFrom(address from, uint256 amount) public onlyAdmin {
        _burn(from, amount);
    }
}
