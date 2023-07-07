import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockErc20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address[] memory holders, uint256 amount) external {
        for (uint i = 0; i < holders.length; i++) {
            _mint(holders[i], amount);
        }
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
