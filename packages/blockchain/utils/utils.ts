import {
  appendFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "fs";

import { ethers } from "hardhat";
export const ERC20_MINT_AMOUNT = 100000000;

export const saveDeployedAddress = async (
  sweeper: string,
  tokens: string[]
) => {
  const settingInfo: {
    sweeperAddress: string;
    erc20Tokens: string[];
  } = {
    sweeperAddress: "",
    erc20Tokens: [],
  };
  settingInfo.sweeperAddress = sweeper;
  settingInfo.erc20Tokens = tokens;

  const settingsPath = "../contracts-typechain/settings";
  if (!existsSync(settingsPath)) {
    mkdirSync(settingsPath, { recursive: true });
  } else {
    const rawData = readFileSync(`${settingsPath}/settings.json`);
    const data = JSON.parse(rawData.toString());
  }
  const json = JSON.stringify(settingInfo);
  writeFileSync(`${settingsPath}/settings.json`, json, "utf-8");
};

export const Utils = {
  prepareTest: async function () {
    //import users
    const accounts = await ethers.getSigners();
    const users = accounts.map((acc) => acc.address);

    //deploy contracts
    const scopeVestingFactory = await ethers.getContractFactory("ScopeVesting");
    const scopeVesting = await scopeVestingFactory.deploy();
    await scopeVesting.deployed();

    const scopePaymentFactory = await ethers.getContractFactory("ScopePayment");
    const scopePayment = await scopePaymentFactory.deploy();
    await scopePayment.deployed();

    const scopeTokenFactory = await ethers.getContractFactory("ScopeToken");
    const scopeToken = await scopeTokenFactory.deploy(
      "BlockScope Token",
      "Scope"
    );
    await scopeToken.deployed();
    await scopeToken.mint(users, ERC20_MINT_AMOUNT);

    // approve sweep by sweeper.
    accounts.forEach(async (acc) => {
      await scopeToken
        .connect(acc)
        .approve(scopePayment.address, ERC20_MINT_AMOUNT);
      await scopeToken
        .connect(acc)
        .approve(scopeVesting.address, ERC20_MINT_AMOUNT);
    });
    return {
      scopeToken,
      scopeVesting,
      scopePayment,
    };
  },
};

export function generateRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
