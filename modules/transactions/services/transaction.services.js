import { ethProvider, getDisputedAmountBalance } from "../../../utils/utils.js";
import { ethers } from "ethers";
import { User } from "../../auth/models/user.model.js";
import { TransactionHistory } from "../models/transactionHistory.model.js";
import { PkrConversions } from "../models/pkrConversions.model.js";

export const transactionServices = async (req) => {
  try {
    const { amount, to } = req.body;

    const data = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: ["privateKey", "isKYC"],
    });

    if (!data.isKYC) {
      throw new Error(
        "Your KYC is not completed, first complete your KYC than you can perform transaction",
      );
    }

    let provider = ethProvider;
    let adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY,
      provider,
    );

    const tx = await adminWallet.sendTransaction({
      to: req.user.walletAddress,
      value: ethers.parseEther("0.01"),
    });

    if (!tx) throw new Error("Transaction Not Initiated");
    console.log("Transaction Initiated:", tx.hash);
    const txWait = await tx.wait();
    if (!txWait) throw new Error("Transaction Failed");
    console.log("Transaction Successful:", txWait.hash);

    const wallet = new ethers.Wallet(data.privateKey, provider);

    const ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    const token = new ethers.Contract(
      process.env.USDC_CONTRACT_ADDRESS,
      ERC20_ABI,
      wallet,
    );

    const decimals = await token.decimals();

    const _amount = ethers.parseUnits(amount.toString(), decimals);

    const balance = await token.balanceOf(wallet.address);

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

    const txIntent = await token.transfer.populateTransaction(to, _amount);

    console.log("Transaction Intent:", txIntent);

    const _tx = await wallet.sendTransaction(txIntent);

    console.log("Transaction Hash:", _tx.hash);

    const receipt = await _tx.wait();

    console.log("Transaction Receipt:", receipt);

    if (receipt.hash) {
      await TransactionHistory.create({
        fromWalletAddress: req.user.walletAddress,
        toWalletAddress: to,
        status: "SUCCESS",
        transHash: receipt.hash,
        amount: amount,
        initiator: req.user.id,
        isAuthorized: 1,
        toDisputeWallet: 0,
      });
    }

    return {
      txHash: receipt.hash,
      intent: txIntent.data,
      to: req.body.toAddress,
      amount: req.body.amount,
      isAuthorized: 1,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBalanceService = async (req) => {
  try {
    const ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    const data = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: ["privateKey"],
    });

    const userWallet = new ethers.Wallet(data.privateKey, ethProvider);

    const contract = new ethers.Contract(
      process.env.USDC_CONTRACT_ADDRESS,
      ERC20_ABI,
      userWallet,
    );
    const balance = await contract.balanceOf(req.user.walletAddress);

    console.log("Balance: ", Number(balance));

    const decimals = await contract.decimals();
    const _balance = ethers.formatUnits(balance, decimals);

    return _balance;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const usdcToPkrConversionService = async (req) => {
  try {      
    const { amount } = req.query;

    const ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    const data = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: ["privateKey"],
    });

    const userWallet = new ethers.Wallet(data.privateKey, ethProvider);

    const contract = new ethers.Contract(
      process.env.USDC_CONTRACT_ADDRESS,
      ERC20_ABI,
      userWallet,
    );

    const decimals = await contract.decimals();

    const _amount = ethers.parseUnits(amount.toString(), decimals);

    const balance = await contract.balanceOf(req.user.walletAddress);

    console.log("Balance: ", Number(balance));

    if (balance < _amount) {
      throw new Error(
        `Insufficient balance. Available: ${ethers.formatUnits(
          balance,
          decimals,
        )}`,
      );
    }

    console.log("Token Contract:", contract);

    const txIntent = await contract.transfer.populateTransaction(
      process.env.TREASURY_WALLET_ADDRESS,
      _amount,
    );

    console.log("Transaction Intent:", txIntent);

    const _tx = await userWallet.sendTransaction(txIntent);

    console.log("Transaction Hash:", _tx.hash);

    const receipt = await _tx.wait();

    if (!receipt.hash) {
      throw new Error("Unable to convert USDC into PKR");
    }

    await TransactionHistory.create({
      fromWalletAddress: req.user.walletAddress,
      toWalletAddress: process.env.TREASURY_WALLET_ADDRESS,
      amount: amount,
      status: "SUCCESS",
      transHash: receipt.hash,
      initiator: req.user.id,
      isAuthorized: 1,
      toDisputeWallet: 0,
    });

    const pkrConversion = amount * 279.78;

    await PkrConversions.create({
      walletAddress: req.user.walletAddress,
      usdcAmount: amount,
      pkrAmount: pkrConversion.toFixed(2),
    });

    return {
      pkrAmount: Number(pkrConversion.toFixed(2)),
      usdcRate: 279.78,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


export const outsideTxnService = async(req) => {
  try {
    const {from, to, amount, status, transHash } = req.body;

    const txnHistory = await TransactionHistory.create({
      fromWalletAddress: from,
      toWalletAddress: to,
      amount,
      status,
      transHash
    })

    return txnHistory

  } catch (error) {
    throw new Error(error.message)
  }
}