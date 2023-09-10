import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Utils } from "../utils/utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("ScopeToken", () => {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { scopeToken } = await loadFixture(Utils.prepareTest);
      expect(await scopeToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { scopeToken } = await loadFixture(Utils.prepareTest);
      const ownerBalance = await scopeToken.balanceOf(owner.address);
      expect((await scopeToken.totalSupply()).toString()).to.equal(
        ownerBalance.toString()
      );
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { scopeToken } = await loadFixture(Utils.prepareTest);
      await scopeToken.transfer(addr1.address, 50);
      const addr1Balance = await scopeToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("50");

      await scopeToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await scopeToken.balanceOf(addr2.address);
      expect(addr2Balance.toString()).to.equal("50");
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const { scopeToken } = await loadFixture(Utils.prepareTest);
      const initialOwnerBalance = await scopeToken.balanceOf(owner.address);

      await expect(
        scopeToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.rejectedWith("ERC20: transfer amount exceeds balance");

      expect((await scopeToken.balanceOf(owner.address)).toString()).to.equal(
        initialOwnerBalance.toString()
      );
    });

    it("Should update balances after transfers", async function () {
      const { scopeToken } = await loadFixture(Utils.prepareTest);
      const initialOwnerBalance = await scopeToken.balanceOf(owner.address);

      await scopeToken.transfer(addr1.address, 100);
      await scopeToken.transfer(addr2.address, 50);

      const finalOwnerBalance = await scopeToken.balanceOf(owner.address);

      expect(finalOwnerBalance.toString()).to.equal(
        initialOwnerBalance.sub(150).toString()
      );

      const addr1Balance = await scopeToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("100");

      const addr2Balance = await scopeToken.balanceOf(addr2.address);
      expect(addr2Balance.toString()).to.equal("50");
    });
  });
});
