import { Wallet, Mnemonic, HDNodeWallet } from "ethers";
import { User } from "../../auth/models/user.model.js";
import { TransactionHistory } from "../../transactions/models/transactionHistory.model.js";
import {
  ethProvider,
  fetchWalletBalances,
  getDisputedAmountBalance,
  transferDisputedUsdc,
} from "../../../utils/utils.js";
import { Op, where } from "sequelize";
import { NonBank_kyc } from "../../kyc/models/non-bankKyc.model.js";
import { BankKyc } from "../../kyc/models/bankKyc.model.js";

export const masterWalletServices = async (req) => {
  try {
    const wallet = Wallet.createRandom();

    console.log("First Account Address:");
    console.log(wallet);
    console.log(wallet.address);
    console.log("Mnemonic: ", wallet.mnemonic.phrase);

    const mnemonic = Mnemonic.fromPhrase(wallet.mnemonic.phrase);
    const seed = mnemonic.computeSeed();
    const root = HDNodeWallet.fromSeed(seed);

    console.log("Root Path:", root.path); // m
    console.log("Root Address:", root.address);
    console.log("Master Private Key:", root.privateKey);
    console.log("Master Public Key:", root.publicKey);
    console.log("Master xprv:", root.extendedKey);
    console.log("Master xpub:", root.neuter().extendedKey);

    await User.update(
      {
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        extendedKey: root.extendedKey,
      },
      {
        where: {
          roleId: 1,
        },
      },
    );

    return {
      path: root.path,
      address: root.address,
      privateKey: root.privateKeyx,
      publicKey: root.publicKey,
      extendedKey: root.extendedKey,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchTransactionHistoryService = async (req) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized Access");
    }

    const { txnId, isAuthorized, isDispute, isTreasury} =
      req.query;

    if (isAuthorized && isDispute && isTreasury)
      throw new Error("Use only 1 param at a time");
    let where = {};
    if (isAuthorized) {
      where = {
        isAuthorized: 1,
      };
    }
    if (isDispute) {
      where = {
        [Op.and]: [{ toDisputeWallet: 1 }, { isDispute: 1 }],
      };
    }
    if (isTreasury) {
      where = {
        [Op.or]: [
          { fromWalletAddress: process.env.TREASURY_WALLET_ADDRESS },
          { toWalletAddress: process.env.TREASURY_WALLET_ADDRESS },
        ],
      };
    }
    let transactionHistory;
    if (txnId) {
      transactionHistory = await TransactionHistory.findOne({
        where: {
          id: txnId,
        },
      });

      return transactionHistory;
    }

    const limitValue = Number(req.query.limit) || 10;
    const offsetValue = Number(req.query.offset) || 0;

    transactionHistory = await TransactionHistory.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitValue,
      offset: offsetValue,
    });

    return {count: transactionHistory.count, data: transactionHistory.rows};
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateTransactionHistory = async (req) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized Access");
    }

    const { txnId, isAuthorized } = req.query;

    await TransactionHistory.update({
      isAuthorized,
      where: {
        id: txnId,
      },
    });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const processRefundService = async (req) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized Access");
    }

    const { txnId, action } = req.body;

    let transfer = null;
    let toWalletAddress = null;
    let transInfo = null;

    if (action === "refund") {
      transInfo = await TransactionHistory.findOne({
        where: {
          id: txnId,
        },
        attributes: ["fromWalletAddress", "amount"],
      });

      toWalletAddress = transInfo.fromWalletAddress;
      transfer = await transferDisputedUsdc(transInfo.amount, toWalletAddress, action);
    }

    if (action === "process") {
      transInfo = await TransactionHistory.findOne({
        where: {
          id: txnId,
        },
        attributes: ["toWalletAddress", "amount"],
      });

      toWalletAddress = transInfo.toWalletAddress;

      transfer = await transferDisputedUsdc(transInfo.amount, toWalletAddress, action);
    }

    if (transfer) {
      await TransactionHistory.create({
        fromWalletAddress: process.env.DISPUTE_WALLET_ADDRESS,
        toWalletAddress,
        amount: transInfo.amount,
        status: "SUCCESS",
        transactionHash: transfer,
        initiator: req.user.id,
        isAuthorized: 1,
        toDisputeWallet: 0,
        isDispute: 0,
      });

      await TransactionHistory.update(
        {
          isDispute: 0,
        },
        {
          where: {
            id: txnId,
          },
        },
      );
    }

    return transfer;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const adminWalletsBalancesService = async (req) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized Access");
    }

    const treasuryWalletBalance = await fetchWalletBalances(
      process.env.TREASURY_WALLET_PRIVATE_KEY,
      process.env.TREASURY_WALLET_ADDRESS,
    );
    const disputeWalletBalance = await fetchWalletBalances(
      process.env.DISPUTE_WALLET_PRIVATE_KEY,
      process.env.DISPUTE_WALLET_ADDRESS,
    );

    return {
      treasuryWalletBalance,
      disputeWalletBalance,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const userListingService = async (req) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized Access");
    }
    const { userId, searchBy, searchTxt } = req.query;
    let user;

    if (userId) {
      user = await User.findOne({
        where: {
          id: userId,
        },
      });

      const balance = await fetchWalletBalances(
        user.privateKey,
        user.walletAddress,
      );
      console.log("Balance: ", balance);

      user.dataValues.balance = parseFloat(balance).toFixed(2);

      const fetchNonBankers = await NonBank_kyc.findAll({
        where: {
          user_id: userId,
        },
        attributes: ["name", "email", "wallet_address"],
      });

      user.dataValues.authorizedWallets = fetchNonBankers;

      const kyc = await BankKyc.findOne({
        where: {
          user_id: userId,
        }
      })

      user.dataValues.kyc = kyc
      return user;
    }

    let where = {
      roleId: {
        [Op.ne]: 1,
      },
    };

    if (searchBy === "email") {
      where = {
        roleId: {
          [Op.ne]: 1,
        },
        email: {
          [Op.like]: searchTxt,
        },
      };
    }

    if (searchBy === "wallet") {
      where = {
        roleId: {
          [Op.ne]: 1,
        },
        walletAddress: {
          [Op.like]: searchTxt,
        },
      };
    }

    const limit = parseInt(req.query.limit, 10) || 10;
const offset = parseInt(req.query.offset, 10) || 0;

    user = await User.findAndCountAll({
      where,
      limit,
      offset
    });

    console.log("USER: ", user)

    // for (let i = 0; i < user.rows.length; i++) {
    //   const balance = await fetchWalletBalances(
    //     user.rows[i].privateKey,
    //     user.rows[i].walletAddress,
    //   );
    //   console.log("Balance: ", balance);

    //   user.rows[i].dataValues.balance = parseFloat(balance).toFixed(2);
    // }

    const updatedRows = await Promise.all(
  user.rows.map(async (user) => {
    const balance = await fetchWalletBalances(
      user.privateKey,
      user.walletAddress
    );

    return {
      ...user.toJSON(),
      balance: parseFloat(balance).toFixed(2)
    };
  })
);

    return {count: user.count, data: updatedRows};
  } catch (error) {
    throw new Error(error.message);
  }
};
