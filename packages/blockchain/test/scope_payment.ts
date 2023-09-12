import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { Utils } from "../utils/utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BlockScopePayment", function () {
  before(async () => {});

  describe("Initialization", () => {
    it("should correctly initialize DAO Treasury and tiers", async function () {
      const { scopePayment, daoTreasury, admin } = await loadFixture(
        Utils.prepareTest
      );
      expect(await scopePayment.daoTreasury()).to.equal(
        await daoTreasury.getAddress()
      );
      expect((await scopePayment.getTiers()).length).to.equal(3);
    });
  });

  describe("setTierPrice", () => {
    it("should allow admin to set a tier price", async function () {
      const { scopePayment, daoTreasury, admin } = await loadFixture(
        Utils.prepareTest
      );

      const newTier = { name: "free", price: 50 };
      await scopePayment.connect(admin).setTierPrice(0, newTier);
      const updatedTier = await scopePayment.tiers(0);
      expect(updatedTier.price.toString()).to.equal("50");
    });

    it("should revert for non-admin", async function () {
      const { scopePayment, user } = await loadFixture(Utils.prepareTest);
      const newTier = { name: "free", price: 50 };
      await expect(
        scopePayment.connect(user).setTierPrice(0, newTier)
      ).to.be.revertedWith("OwnablePausable: access denied");
    });
  });

  describe("setDAOTreasury", () => {
    it("should allow admin to set DAO Treasury", async function () {
      const { scopePayment, admin, user } = await loadFixture(
        Utils.prepareTest
      );
      await scopePayment.connect(admin).setDAOTreasury(user.address);

      expect(await scopePayment.daoTreasury()).to.equal(user.address);
    });

    it("should revert for non-admin", async function () {
      const { scopePayment, user } = await loadFixture(Utils.prepareTest);
      await expect(
        scopePayment.connect(user).setDAOTreasury(user.address)
      ).to.be.revertedWith("OwnablePausable: access denied");
    });

    it("should revert for invalid DAO Treasury address", async function () {
      const { scopePayment, admin, user } = await loadFixture(
        Utils.prepareTest
      );
      await expect(
        scopePayment
          .connect(admin)
          .setDAOTreasury("0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("Invalid DAO treasury address");
    });
  });

  describe.only("payWithSignature", () => {
    it("should process payment with valid signature", async function () {
      const { scopePayment, user } = await loadFixture(Utils.prepareTest);

      const amount = 30;

      const nonce = await scopePayment.nonces(await user.getAddress());
      const hashedData = keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "uint256"],
          [await user.getAddress(), amount, nonce]
        )
      );

      const signature = await user.signMessage(
        ethers.utils.arrayify(hashedData)
      );
      await scopePayment.connect(user).payWithSignature(amount, 2, signature);

      // Check emitted event and other state changes if needed
    });

    it("should revert for insufficient payment", async function () {
      const { scopePayment, admin, user } = await loadFixture(
        Utils.prepareTest
      );
      // Similar to above but with insufficient amount
      await expect(
        scopePayment.connect(user).payWithSignature(10, 2, "0x")
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should revert for invalid signature", async function () {
      const { scopePayment, admin, user } = await loadFixture(
        Utils.prepareTest
      );
      // Similar to first test but with invalid signature
      await expect(
        scopePayment.connect(user).payWithSignature(30, 2, "0x")
      ).to.be.revertedWith("ECDSA: invalid signature length");
    });
  });
});
