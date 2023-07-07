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
    const sweeperFactory = await ethers.getContractFactory("Sweeper");
    const sweeper = await sweeperFactory.deploy();
    await sweeper.deployed();

    const tokens: string[] = [];
    for (let index = 0; index < 10; index++) {
      const tokenName = generateRandomString(3);
      const mockERC20Factory = await ethers.getContractFactory(
        "MockErc20Token"
      );
      const mockERC20Token = await mockERC20Factory.deploy(
        tokenName,
        tokenName
      );
      await mockERC20Token.deployed();
      tokens.push(mockERC20Token.address);
      await mockERC20Token.mint(users, ERC20_MINT_AMOUNT);

      // approve sweep by sweeper.
      accounts.forEach(async (acc) => {
        await mockERC20Token
          .connect(acc)
          .approve(sweeper.address, ERC20_MINT_AMOUNT);
      });
    }
    return {
      tokens,
      sweeper,
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
