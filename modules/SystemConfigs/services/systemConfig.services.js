import { Banks } from "../models/banks.model.js";
import { NonBank_kyc } from "../../kyc/models/non-bankKyc.model.js";
import { User } from "../../auth/models/user.model.js";

export const bankListingService = async (req) => {
  try {
    const { bankId } = req.query;
    let bank;
    if (bankId) {
      bank = await Banks.findOne({
        where: {
          id: bankId,
        },
      });

      return bank;
    }
    bank = await Banks.findAll();

    return bank;
  } catch (error) {}
};

export const titleFetchService = async (req) => {
  try {
    const { email, title } = req.query;

    if (email === req.user.email) {
      throw new Error("Email belongs to the requester");
    }

    let data = null;
    if (title === "bank") {
      data = await User.findOne({
        where: {
          email,
        },
        attributes: ["id", "name", "walletAddress", "isKYC"],
      });

      if (!data) {
        throw new Error("No bank user found with the provided email");
      }

      if (!data.isKYC) {
        throw new Error("Unverified User");
      }
    }

    if (title === "nonbank") {
      data = await NonBank_kyc.findOne({
        where: {
          email,
        },
        attributes: ["id", "name", "wallet_address", "isKYC"],
      });

      if (!data) {
        throw new Error("No non-bank user found with the provided email");
      }

      if (!data.isKYC) {
        throw new Error("Unverified User");
      }

      data = {
        id: data.id,
        name: data.name,
        walletAddress: data.wallet_address,
      };
    }

    if (!data) {
      throw new Error("No user found with the provided email");
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
