// Abstract class defining a base sweeper
import { ISweeper } from "../interface/sweeper";
import { ethers } from "ethers";
import { SweepMode } from "../models/sweep_mode";

export abstract class Sweeper implements ISweeper {
  protected provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  abstract sweep(privateKeys: string[], tokenAddresses: string[], destination: string, mode: SweepMode): Promise<any>;
}
