import PromisePool from "@supercharge/promise-pool";
import { Sweeper } from "../base/index";
import { ethers } from "ethers";
class EtherSweeper extends Sweeper {
  async sweep(privateKeys: string[], tokenAddresses: string[], destination: string): Promise<any> {
    try {
      const sweepResult = await PromisePool.withConcurrency(20)
        .for(privateKeys)
        .process(async (privateKey) => await this.sendNativeTransaction(privateKey, destination));

      return sweepResult.errors;
    } catch (err) {
      console.error("Error in sweepOnlyNative:", err);
      throw err; // propagate the error up
    }
  }

  private async sendNativeTransaction(privateKey: string, destination: string) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const balance = await this.provider.getBalance(wallet.address);
      const { gasPrice } = await this.provider.getFeeData();

      const gasLimit = await this.provider.estimateGas({ to: destination, value: balance });
      const gasCost = gasPrice!.mul(gasLimit).mul(90);

      if (balance.lt(gasCost)) {
        throw new Error("Insufficient ETH for gas cost."); // throw error to be caught at the caller
      }

      const amount = balance.sub(gasCost);
      return await wallet.sendTransaction({ to: destination, value: amount });
    } catch (err) {
      console.error("Error in sendNativeTransaction:", err);
      throw err; // propagate the error up
    }
  }
}

export default EtherSweeper;
