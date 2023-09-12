// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./presets/OwnablePausableUpgradeable.sol";
import "./interfaces/IBlockScopePayment.sol";
import "./interfaces/IBlockScopeToken.sol";

contract BlockScopePayment is
    UUPSUpgradeable,
    EIP712Upgradeable,
    OwnablePausableUpgradeable,
    IBlockScopePayment
{
    using ECDSAUpgradeable for bytes32;

    address public daoTreasury;
    address public scopeToken;
    mapping(address => Subscribe) subscribes;
    Tier[] public tiers;

    // EIP-712
    bytes32 public DOMAIN_SEPARATOR;
    string public constant EIP712_DOMAIN_TYPEHASH =
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
    bytes32 public constant PAYMENT_TYPEHASH =
        keccak256(
            "Payment(address payer,address tierIndex,uint256 tierIndex,uint256 nonce)"
        );

    mapping(address => uint256) public nonces;

    function initialize(
        address _admin,
        address _daoTreasury,
        address _scopeToken,
        Tier[] calldata _tiers
    ) external initializer {
        require(_daoTreasury != address(0), "Invalid DAO treasury address");
        require(_tiers.length > 1, "Invalid Subscribe plans");

        __OwnablePausableUpgradeable_init(_admin);
        __EIP712_init("BlockscopePayment", "1");

        daoTreasury = _daoTreasury;
        scopeToken = _scopeToken;
        // Copy over the new tiers one at a time
        for (uint i = 0; i < _tiers.length; i++) {
            tiers.push(_tiers[i]);
        }
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

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
        Payment calldata payment,
        bytes memory signature
    ) external payable virtual whenNotPaused {
        // Verify the payer using signature
        address payer = _verify(payment, signature);
        require(payer == payment.payer, "BlockScopePayment: Invalid Proof");

        // Fetch the appropriate tier
        Tier memory tier = tiers[payment.tierIndex];

        // Handle Ether payments
        if (payment.token == address(0)) {
            _handleEtherPayment(tier.price);
        }
        // Handle Token payments
        else {
            _handleTokenPayment(payment.token, tier.price);
        }

        // Create a new subscription record
        createNewSubscription(msg.sender, payment.tierIndex);
    }

    // Internal function to handle Ether payments
    function _handleEtherPayment(uint256 price) internal {
        require(msg.value == price, "Incorrect Ether value sent");
        payable(daoTreasury).transfer(price);
        // Logic to burn Ether or send it somewhere else can go here
    }

    // Internal function to handle Token payments
    function _handleTokenPayment(address token, uint256 price) internal {
        if (token == scopeToken) {
            // Special logic for SCOPE token
            uint256 daoShare = (price * 85) / 100;
            uint256 toBurn = price - daoShare;

            IBlockScopeToken(scopeToken).burnFrom(toBurn);
            require(
                IERC20(token).transferFrom(msg.sender, daoTreasury, daoShare),
                "BlockScopePayment: Failed to make payment"
            );

            emit PaymentReceived(msg.sender, price, daoShare, toBurn);
        } else {
            // Generic ERC-20 Token
            require(
                IERC20(token).transferFrom(msg.sender, daoTreasury, price),
                "BlockScopePayment: Failed to make payment"
            );

            emit PaymentReceived(msg.sender, price, 0, 0);
        }
    }

    // Internal function to create a new subscription record
    function createNewSubscription(address user, uint256 tierIndex) internal {
        Subscribe memory newSubscribe = Subscribe(
            user,
            tierIndex,
            block.timestamp,
            block.timestamp + 30 days
        );
        subscribes[user] = newSubscribe;
    }

    /// @notice Returns a hash of the given EndorsementInfo, prepared using EIP712 typed data hashing rules.
    /// @param sign An EndorsementInfo to hash.
    function _hash(Payment calldata sign) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        PAYMENT_TYPEHASH,
                        sign.payer,
                        sign.token,
                        sign.tierIndex,
                        sign.nonce
                    )
                )
            );
    }

    /// @notice Verifies the signature for a given Payment, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to add Endorsement.
    /// @param payment An EndorsementInfo describing an unregistered sale.
    /// @param signature An EIP712 signature of the given Endorsement sign.
    function _verify(
        Payment calldata payment,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 digest = _hash(payment);
        return digest.toEthSignedMessageHash().recover(signature);
    }

    function getTiers() external view returns (Tier[] memory) {
        return tiers;
    }
}
