import { ERC20, ERC20ABI, Settings } from "@xfuntoken/contracts-typechain";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { TokenSweeper, EtherSweeper } from "../src/sweeper";
import { expect } from "chai";
import { SweepMode } from "../src/sweeper/models/sweep_mode";
dotenv.config();
describe("Sweeper", () => {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
  const privateKeys = JSON.parse(process.env.PRIVATE_TEST_KEYS!) as string[];
  const tokens = Settings.erc20Tokens;
  const tokenSweeper = new TokenSweeper("http://127.0.0.1:8545/");
  const etherSweeper = new EtherSweeper("http://127.0.0.1:8545/");
  const destination = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

  describe("TokenSweeper", () => {
    it("only ERC20", async () => {
      const testKeys = privateKeys.slice(1, 4);
      const err = await tokenSweeper.sweep(testKeys, tokens, destination, SweepMode.ERC20);
      expect(err.length).to.equal(0);
      // check balancer of original wallet.
      for (let index = 0; index < testKeys.length; index++) {
        const prev = testKeys[index];
        const wallet = new ethers.Wallet(prev, provider);
        for (let index = 0; index < tokens.length; index++) {
          const token = tokens[index];
          const tokenContract = new ethers.Contract(token, ERC20ABI.abi, wallet) as ERC20;
          const tokenBalance = await tokenContract.balanceOf(wallet.address);
          expect(tokenBalance.toString()).to.equal("0");
        }
      }
    });
    it("All", async () => {
      const testKeys = privateKeys.slice(11, 19);
      const err = await tokenSweeper.sweep(testKeys, tokens, destination, SweepMode.ALL);
      expect(err.length).to.equal(0);
      // check balancer of original wallet.
      for (let index = 0; index < testKeys.length; index++) {
        const prev = testKeys[index];
        const wallet = new ethers.Wallet(prev, provider);
        const balance = await wallet.getBalance();
        expect(+ethers.utils.formatEther(balance)).to.below(0.1);
        for (let index = 0; index < tokens.length; index++) {
          const token = tokens[index];
          const tokenContract = new ethers.Contract(token, ERC20ABI.abi, wallet) as ERC20;
          const tokenBalance = await tokenContract.balanceOf(wallet.address);
          expect(tokenBalance.toString()).to.equal("0");
        }
      }
    });
  });

  describe("EtherSweeper", () => {
    it("only ETH", async () => {
      const testKeys = privateKeys.slice(5, 10);
      const err = await etherSweeper.sweep(testKeys, tokens, destination);
      expect(err.length).to.equal(0);
      // check balancer of original wallet.
      for (let index = 0; index < testKeys.length; index++) {
        const prev = testKeys[index];
        const wallet = new ethers.Wallet(prev, provider);
        const balance = await wallet.getBalance();
        expect(+ethers.utils.formatEther(balance)).to.below(0.01);
      }
    });
  });
});
