import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import sequelize from "../config/db.js";

export const apiResponse = (
  success,
  message,
  data = null,
  code = 200,
  type = "success",
) => {
  return {
    type,
    success,
    code,
    message,
    data,
  };
};

export const signJWT = async (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const verifyAccessToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return reject(new Error("Token expired"));
        }
        return reject(new Error("Invalid token"));
      }
      resolve(decoded);
    });
  });
};

export const ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

export const fetchWalletBalances = async (privateKey, walletAddress) => {
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  const userWallet = new ethers.Wallet(privateKey, ethProvider);

  const contract = new ethers.Contract(
    process.env.USDC_CONTRACT_ADDRESS,
    ERC20_ABI,
    userWallet,
  );
  const balance = await contract.balanceOf(walletAddress);

  const decimals = await contract.decimals();
  const _balance = ethers.formatUnits(balance, decimals);

  return _balance;
};

export const getDisputedAmountBalance = async (userId) => {
  const [query] = await sequelize.query(`
    SELECT IFNULL(SUM(amount), 0) AS unauthorizedAmount FROM TransactionHistory WHERE initiator = ${userId} AND isAuthorized = 0 AND toDisputeWallet = 0;
    `);

  return query[0].unauthorizedAmount;
};

export const transferDisputedUsdc = async (amount, toWalletAddress, action) => {

  const ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
    ];
    
  let adminWallet = new ethers.Wallet(
    process.env.DISPUTE_WALLET_PRIVATE_KEY,
    ethProvider,
  );

  const token = new ethers.Contract(
    process.env.USDC_CONTRACT_ADDRESS,
    ERC20_ABI,
    adminWallet,
  );

  const decimals = await token.decimals();

  const _amount = ethers.parseUnits(amount.toString(), decimals);

  const balance = await token.balanceOf(adminWallet.address);

  console.log("Balance: ", Number(balance));

  if (balance < _amount) {
    throw new Error(
      `Insufficient balance. Available: ${ethers.formatUnits(
        balance,
        decimals,
      )}`,
    );
  }

  console.log("Token Contract:", token);

  const txIntent = await token.transfer.populateTransaction(
    toWalletAddress,
    _amount,
  );

  console.log("Transaction Intent:", txIntent);

  const _tx = await adminWallet.sendTransaction(txIntent);

  console.log("Transaction Hash:", _tx.hash);

  const receipt = await _tx.wait();

  if (!receipt) {
    throw new Error(`Unable to ${action}`);
  }

  console.log(`Transaction successful: ${receipt.hash}`);
  return receipt.hash
};