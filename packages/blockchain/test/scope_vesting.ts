import { ethers, network } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { Utils } from "../utils/utils";
import { BlockTime } from "../utils/time";
describe("BlockScopeVesting", function () {
  let accounts: SignerWithAddress[];
  let blockScopeVesting: Contract;
  let token: any;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  before(async () => {
    accounts = await ethers.getSigners();
    [owner, addr1, addr2] = accounts;
    const { scopeToken, scopeVesting } = await loadFixture(Utils.prepareTest);
    blockScopeVesting = scopeVesting;
    token = scopeToken;
  });

  describe("Deployment", () => {
    it("Should set the correct token", async () => {
      expect(await blockScopeVesting.token()).to.equal(token.address);
    });
  });

  describe("Vesting setup", () => {
    it("Should allow the owner to set vesting", async () => {
      const releaseTime = await BlockTime.AfterSeconds(10);
      await blockScopeVesting
        .connect(owner)
        .setVesting(addr1.getAddress(), 100, releaseTime);
      const vesting = await blockScopeVesting.vestings(
        await addr1.getAddress()
      );
      expect(vesting.amount).to.equal(100);
    });

    it("Should not allow non-owners to set vesting", async () => {
      const releaseTime = await BlockTime.AfterSeconds(10);
      await expect(
        blockScopeVesting
          .connect(addr1)
          .setVesting(addr2.getAddress(), 100, releaseTime)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if beneficiary address is zero", async () => {
      const releaseTime = await BlockTime.Now();
      await expect(
        blockScopeVesting
          .connect(owner)
          .setVesting(
            "0x0000000000000000000000000000000000000000",
            100,
            releaseTime
          )
      ).to.be.revertedWith("Invalid address");
    });

    it("Should fail if amount is zero", async () => {
      await expect(
        blockScopeVesting
          .connect(owner)
          .setVesting(addr1.getAddress(), 0, BlockTime.Now())
      ).to.be.revertedWith("Amount should be greater than 0");
    });

    it("Should fail if release time is in the past", async () => {
      const vestingTime = await BlockTime.BeforeSeconds(3);
      await expect(
        blockScopeVesting
          .connect(owner)
          .setVesting(addr1.getAddress(), 100, vestingTime)
      ).to.be.revertedWith("Release time should be in the future");
    });
  });

  describe("Token claiming", () => {
    it("Should allow token claim after release time", async () => {
      const releaseTime = await BlockTime.AfterSeconds(2); // 2 seconds from now
      await blockScopeVesting
        .connect(owner)
        .setVesting(addr1.getAddress(), 100, releaseTime);

      await time.increase(3);

      await blockScopeVesting.connect(addr1).claimTokens();
      expect(await token.balanceOf(await addr1.getAddress())).to.equal(100);
    });

    it("Should not allow token claim before release time", async () => {
      const releaseTime = BlockTime.AfterSeconds(300);
      await blockScopeVesting
        .connect(owner)
        .setVesting(addr1.getAddress(), 100, releaseTime);

      await expect(
        blockScopeVesting.connect(addr1).claimTokens()
      ).to.be.revertedWith("Tokens are not yet claimable");
    });

    it("Should not allow multiple claims", async () => {
      const releaseTime = BlockTime.AfterSeconds(2); // 2 seconds from now
      await blockScopeVesting
        .connect(owner)
        .setVesting(addr1.getAddress(), 100, releaseTime);

      await new Promise((r) => setTimeout(r, 3000)); // wait 3 seconds

      await blockScopeVesting.connect(addr1).claimTokens();
      await expect(
        blockScopeVesting.connect(addr1).claimTokens()
      ).to.be.revertedWith("Tokens already claimed");
    });
  });
});
