pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interface/ISweeper.sol";
import "hardhat/console.sol";

contract Sweeper {
    constructor() {}

    function batchTransfer(
        IERC20[] memory tokens,
        address destination
    ) external payable {
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 amount = tokens[i].balanceOf(msg.sender);
            uint256 allowance = tokens[i].allowance(msg.sender, address(this));
            console.log(amount, allowance, address(this));
            if (allowance < amount) {
                revert("Transfer amount exceeds allowance");
            }
            try tokens[i].transferFrom(msg.sender, destination, amount) {
                // nothing to do here since transferFrom should not return any value
            } catch {
                revert("Transfer failed");
            }
        }
        if (msg.value != 0) {
            payable(destination).transfer(msg.value);
        }
    }
}
