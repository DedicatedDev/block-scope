// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "./presets/OwnablePausableUpgradeable.sol";
import "./interfaces/IBlockscopePayment.sol";

contract BlockscopePayment is
    Initializable,
    EIP712Upgradeable,
    OwnablePausableUpgradeable,
    IBlockscopePayment
{
    using ECDSAUpgradeable for bytes32;

    address public daoTreasury;
    Tier[] public tiers;

    // EIP-712
    bytes32 public DOMAIN_SEPARATOR;
    string public constant EIP712_DOMAIN_TYPEHASH =
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
    bytes32 public constant PAYMENT_TYPEHASH =
        keccak256("Payment(address payer,uint256 amount,uint256 nonce)");

    mapping(address => uint256) public nonces;

    event PaymentReceived(
        address indexed payer,
        uint256 amount,
        uint256 daoShare,
        uint256 burned
    );

    function initialize(
        address _admin,
        address _daoTreasury,
        Tier[] calldata _tiers
    ) external initializer {
        require(_daoTreasury != address(0), "Invalid DAO treasury address");
        require(_tiers.length > 1, "Invalid Subscribe plans");

        __OwnablePausableUpgradeable_init(_admin);
        __EIP712_init("BlockscopePayment", "1");

        daoTreasury = _daoTreasury;
        // Copy over the new tiers one at a time
        for (uint i = 0; i < _tiers.length; i++) {
            tiers.push(_tiers[i]);
        }
    }

    function _authorizeUpgrade(address) internal onlyAdmin {}

    function setTierPrice(
        uint256 _tierIndex,
        Tier calldata newTier
    ) external onlyAdmin {
        tiers[_tierIndex] = newTier;
    }

    function setDAOTreasury(address _newDAOTreasury) external onlyAdmin {
        require(_newDAOTreasury != address(0), "Invalid DAO treasury address");
        daoTreasury = _newDAOTreasury;
    }

    // EIP-712 payment with signature
    function payWithSignature(
        uint256 amount,
        uint256 tierIndex,
        bytes calldata signature
    ) external {
        require(amount >= tiers[tierIndex].price, "Insufficient payment");

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        PAYMENT_TYPEHASH,
                        msg.sender,
                        amount,
                        nonces[msg.sender]++
                    )
                )
            )
        );

        address signer = digest.recover(signature);
        require(
            signer != address(0) && signer == msg.sender,
            "Invalid signature"
        );

        uint256 daoShare = (amount * 85) / 100;
        uint256 toBurn = amount - daoShare;

        // Logic to transfer funds and burn tokens...

        emit PaymentReceived(msg.sender, amount, daoShare, toBurn);
    }
}
