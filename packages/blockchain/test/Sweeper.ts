import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC20_MINT_AMOUNT, Utils } from "../utils/utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("Sweeper", () => {
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();
  });

  it("happy path", async () => {
    const { tokens, sweeper } = await loadFixture(Utils.prepareTest);
    const target = accounts.pop();

    expect(target).not.equal(undefined);
    const targetBalance = await target!.getBalance();

    let totalBalance = targetBalance;
    for (let index = 0; index < accounts.length; index++) {
      const acc = accounts[index];
      const etherBalance = await acc.getBalance();

      // Estimate gas for the transaction
      const gasLimit = await sweeper
        .connect(acc)
        .estimateGas.batchTransfer(tokens, target!.address, {
          value: etherBalance,
        });

      const { gasPrice } = await ethers.provider.getFeeData();
      // Calculate total gas cost
      const gasCost = gasLimit.mul(gasPrice!).mul(90);
      // Calculate the remaining balance after gas cost

      const sendAmount = etherBalance.sub(gasCost);
      await sweeper.connect(acc).batchTransfer(tokens, target!.address, {
        value: sendAmount,
      });
      totalBalance = totalBalance.add(sendAmount);
    }

    for (let index = 0; index < tokens.length; index++) {
      const token = await ethers.getContractAt("IERC20", tokens[index]);
      const tokenBalance = await token.balanceOf(accounts[index].address);
      expect(tokenBalance.toString()).to.equal("0");

      const targetBalance = await token.balanceOf(target!.address);
      expect(targetBalance.toString()).to.equal(
        `${ERC20_MINT_AMOUNT * (accounts.length + 1)}`
      );

      const balance = await accounts[index].getBalance();
      const balanceAsEther = ethers.utils.formatEther(balance.toString());
      expect(+balanceAsEther).to.below(0.03);
    }

    // check send ethers arrived to target address.
    const currentTargetBalance = await target!.getBalance();
    expect(totalBalance.eq(currentTargetBalance)).to.equal(true);
  });
});
