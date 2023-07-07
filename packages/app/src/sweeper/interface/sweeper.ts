import { SweepMode } from "../models/sweep_mode";

export interface ISweeper {
  sweep(privateKeys: string[], tokenAddresses: string[], destination: string, mode: SweepMode): Promise<any[]>;
}
