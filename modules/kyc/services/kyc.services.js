import { Op } from "sequelize";
import { User } from "../../auth/models/user.model.js";
import { BankKyc } from "../models/bankKyc.model.js";
import { NonBank_kyc } from "../models/non-bankKyc.model.js";

export const bankKycService = async (req) => {
  const { userId, nicNumber, phoneNumber, city, nicPicture } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (user == null) {
      throw new Error("User Not Found");
    }

    const existingKyc = await BankKyc.findOne({
      where: {
        user_id: userId,
      },
    });

    if (existingKyc != null) {
      throw new Error("KYC already submitted for this user");
    }

    const bankKyc = await BankKyc.create({
      user_id: userId,
      nic_no: nicNumber,
      phone_number: phoneNumber,
      city: city,
      nic_picture: nicPicture,
    });

    await user.update({
      isKYC: true,
    });

    return bankKyc;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const nonBankKycService = async (req) => {
  const { name, email, walletAddress, userId } = req.body;

  try {
    const user = await User.findByPk(userId);
    
    if (user == null) {
      throw new Error("User Not Found");
    }

    const findNonBankKyc = await NonBank_kyc.findOne({
      where: {
        wallet_address: walletAddress,
        user_id: userId,
      },
    });

    let kyc;
    if (findNonBankKyc) {
      kyc = findNonBankKyc.toJSON();

      kyc.receiverAddress = user.walletAddress;

      return kyc;
    }

    const nonBankKyc = await NonBank_kyc.create({
      name: name,
      email: email,
      wallet_address: walletAddress,
      user_id: userId,
      isKYC: true,
    });

    kyc = nonBankKyc.toJSON();

    kyc.receiverAddress = user.walletAddress;

    return kyc;
  } catch (error) {
    throw new Error(error.message);
  }
};
