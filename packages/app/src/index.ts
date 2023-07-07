// import {TokenSweeper, EtherSweeper} from "./sweeper/index";
// import dotenv from "dotenv";
// import { ethers } from "ethers";
// dotenv.config();
// const startSweeper = async () => {
//   const rpcUrl = process.env.MAINNET_URL!;
//   const destination = process.env.DESTINATION!;
//   const tokens = JSON.parse(process.env.ERC20_TOKENS!);
//   const privateKeys = JSON.parse(process.env.PRIVATE_KEYS!);
//   if ((privateKeys as Array<string>).length == 0) {
//     throw new Error("There is no any kind of account for sweep");
//   }
//   // const sweeper = new TokenSweeper(rpcUrl);
//   //await sweeper.sweepTokens(privateKeys, tokens, destination, SweepMode.ALL);
// };
// startSweeper();

import { TokenSweeper, EtherSweeper } from "./sweeper/index";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

dotenv.config();

const rpcUrl = process.env.MAINNET_URL!;
const destination = process.env.DESTINATION!;

const builder = (yargs: yargs.Argv) => {
  return yargs
    .positional("sweeperType", {
      describe: 'Specify the type of assets to sweep ("Token" or "Ether")',
      type: "string",
      choices: ["Token", "Ether"],
      demandOption: true,
    })
    .positional("sweepMode", {
      describe: 'Specify the mode to sweep tokens (only for "Token" type - "ERC20" or "ALL")',
      type: "string",
      choices: ["ERC20", "ALL"],
    });
};

const startSweeper = async (argv: any) => {
  let tokens: string[] = [];
  const privateKeys = JSON.parse(process.env.PRIVATE_KEYS!);

  if ((privateKeys as Array<string>).length == 0) {
    throw new Error("There is no any kind of account for sweep");
  }

  if (argv.sweeperType === "Token") {
    tokens = JSON.parse(process.env.ERC20_TOKENS!);
  }

  let sweeper;

  if (argv.sweeperType === "Token") {
    sweeper = new TokenSweeper(rpcUrl);
    await sweeper.sweep(privateKeys, tokens, destination, argv.sweepMode);
  } else {
    sweeper = new EtherSweeper(rpcUrl);
    await sweeper.sweep(privateKeys, tokens, destination);
  }
};

yargs(hideBin(process.argv))
  .command("$0 <sweeperType> [sweepMode]", "Start the sweeper", builder, startSweeper)
  .strict()
  .parse();
