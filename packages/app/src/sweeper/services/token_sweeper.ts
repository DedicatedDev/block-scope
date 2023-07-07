// Concrete TokenSweeper class
import PromisePool from "@supercharge/promise-pool";
import { SweepMode } from "../models/sweep_mode";
import { Sweeper } from "../base";
import { ethers } from "ethers";
import { ERC20, ERC20ABI, Settings, SweeperABI, Sweeper as SweepContract } from "@xfuntoken/contracts-typechain";
class TokenSweeper extends Sweeper {
  async sweep(privateKeys: string[], tokenAddresses: string[], destination: string, mode: SweepMode): Promise<any> {
    try {
      const sweepResult = await PromisePool.withConcurrency(1)
        .for(privateKeys)
        .process(async (privateKey) => {
          const wallet = new ethers.Wallet(privateKey, this.provider);
          const balance = await this.provider.getBalance(wallet.address);
          const approvals = await PromisePool.withConcurrency(1)
            .for(tokenAddresses)
            .process(async (token) => await this.approveTokenTransfer(wallet, token));
          if (approvals.errors.length !== 0) {
            throw approvals.errors; // throw the errors to be caught at the caller
          }
          const contract = new ethers.Contract(Settings.sweeperAddress, SweeperABI.abi, wallet) as SweepContract;
          return await this.processChunk(contract, tokenAddresses, destination, mode, balance);
        });
      return sweepResult.errors.flat();
    } catch (err) {
      console.error("Error in sweepTokens:", err);
      throw err; // propagate the error up
    }
  }

  private async approveTokenTransfer(wallet: ethers.Wallet, token: string) {
    try {
      const tokenContract = new ethers.Contract(token, ERC20ABI.abi, wallet) as ERC20;
      const tokenBalance = await tokenContract.balanceOf(wallet.address);
      await tokenContract.approve(Settings.sweeperAddress, tokenBalance);
    } catch (error) {
      console.error("Error in approveTokenTransfer:", error);
      throw error; // propagate the error up
    }
  }

  private async processChunk(
    contract: SweepContract,
    tokens: string[],
    destination: string,
    mode: SweepMode,
    balance: ethers.BigNumber
  ): Promise<any[]> {
    try {
      const { gasLimit, gasPrice, gasCost } = await this.estimateGasCost(contract, tokens, destination, mode, balance);

      const latestBlock = await this.provider.getBlock("latest");
      const maxGasLimit = latestBlock.gasLimit;

      // If the gasLimit exceeds the maxGasLimit, divide the tokens into two chunks and process them separately
      if (gasLimit.gt(maxGasLimit)) {
        const mid = Math.floor(tokens.length / 2);
        const tokens1 = tokens.slice(0, mid);
        const tokens2 = tokens.slice(mid);

        return await Promise.all([
          this.processChunk(contract, tokens1, destination, mode, balance),
          this.processChunk(contract, tokens2, destination, mode, balance),
        ]);
      }

      if (balance.lt(gasCost)) {
        throw new Error("Insufficient ETH for gas cost."); // throw error to be caught at the caller
      }

      const amount = balance.sub(gasCost);
      return [await contract.batchTransfer(tokens, destination, { value: amount })];
    } catch (err) {
      console.error("Error in processChunk:", err);
      throw err; // propagate the error up
    }
  }

  private async estimateGasCost(
    contract: SweepContract,
    tokens: string[],
    destination: string,
    mode: SweepMode,
    balance: ethers.BigNumber
  ) {
    let gasLimit: ethers.BigNumberish;
    let gasPrice: ethers.BigNumberish;
    const txParams = { value: mode === SweepMode.ALL ? balance : 0 };
    gasLimit = await contract.estimateGas.batchTransfer(tokens, destination, txParams);
    gasPrice = (await this.provider.getFeeData()).gasPrice!;

    return { gasLimit, gasPrice, gasCost: gasPrice!.mul(gasLimit).mul(90) };
  }
}
export default TokenSweeper;
