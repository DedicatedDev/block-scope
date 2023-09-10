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
    const [owner] = await ethers.getSigners();
    //deploy contracts

    const scopeTokenFactory = await ethers.getContractFactory(
      "BlockScopeToken"
    );
    const scopeToken = await scopeTokenFactory.deploy(
      "BlockScope Token",
      "Scope",
      owner.address
    );
    await scopeToken.deployed();

    const scopeVestingFactory = await ethers.getContractFactory(
      "BlockScopeVesting"
    );
    const scopeVesting = await scopeVestingFactory.deploy(scopeToken.address);
    await scopeVesting.deployed();

    const scopePaymentFactory = await ethers.getContractFactory(
      "BlockScopePayment"
    );
    const scopePayment = await scopePaymentFactory.deploy();
    await scopePayment.deployed();

    await scopeToken
      .connect(owner)
      .approve(scopePayment.address, ERC20_MINT_AMOUNT);
    await scopeToken
      .connect(owner)
      .approve(scopeVesting.address, ERC20_MINT_AMOUNT);

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
