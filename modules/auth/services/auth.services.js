import bcrypt from "bcrypt";
import { ethers, HDNodeWallet } from "ethers";
import { User } from "../models/user.model.js";
import { ethProvider, fetchWalletBalances, signJWT } from "../../../utils/utils.js";
import sequelize from "../../../config/db.js";
import { Roles } from "../models/roles.model.js";

export const signupServices = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, password, age, address, roleId } = req.body;

    const existingEmail = await User.findOne({ where: { email } });

    if (existingEmail) {
      throw new Error("Email already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashPassword,
      age,
      address,
      roleId: 2,
    };

    const data = await User.create(userData, { transaction });

    console.log("ID: ", data.id);

    const findExtendedKey = await User.findOne({
      where: {
        roleId: 1
      },
      attributes: ["extendedKey"]
    })

    console.log("Extended Key: ", findExtendedKey.extendedKey)

    const master = HDNodeWallet.fromExtendedKey(
     findExtendedKey.extendedKey,
    );

    // Derive user #1
    const userIndex = data.id;
    const userWallet = master.derivePath(`m/44'/60'/0'/0/${userIndex}`);

    console.log("Wallet: ", userWallet);
    console.log("User Address:", userWallet.address);
    console.log("User Private Key:", userWallet.privateKey);

    await User.update(
      {
        walletAddress: userWallet.address,
        privateKey: userWallet.privateKey,
      },
      {
        where: { id: data.id },
        transaction
      },
    );

    const role = await Roles.findOne({
      where: {
        id: data.roleId,
      },
      attributes: ["roleName"],
      transaction
    });

    const user = {
      id: data.id,
      name,
      email,
      walletAddress: userWallet.address,
      roleId: 2,
      role: role.roleName,
    };

    console.log("User: ", user);

    const token = await signJWT(user);

    await transaction.commit();

    const responseData = {
      id: data.id,
      name,
      email,
      walletAddress: userWallet.address,
      roleId: 2,
      role: role.roleName,
      token,
    };
    return responseData;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};

export const loginServices = async (req) => {
  try {
    const { email, password } = req.body;
    const { isAdmin } = req.query;

    const user = await User.findOne({
      where: { email },
      attributes: [
        "id",
        "name",
        "email",
        "password",
        "walletAddress",
        "roleId",
        "isKYC",
        "privateKey"
      ],
    });
    if (!user) {
      throw new Error("User not found");
    }

    const role = await Roles.findOne({
      where: {
        id: user.roleId,
      },
      attributes: ["roleName"],
    });

    console.log("Role: ", role);

    user.dataValues.role = role.roleName;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    console.log("ROLE: ", role.roleName);
    console.log("Is Admin: ", isAdmin);
    console.log("ROLE: ", role.roleName);
    console.log("Is Admin: ", isAdmin);
    if (!isAdmin && role.roleName === "admin") {
      throw new Error("Unauthorized User");
    }
    if (isAdmin && role.roleName === "user") {
      throw new Error("Unauthorized user");
    }

    console.log("User: ", user.dataValues);
    const token = await signJWT(user.dataValues);

    //BASE64
    const encoded = Buffer.from(JSON.stringify(user.dataValues)).toString("base64");

    const balance = await fetchWalletBalances(user.privateKey, user.walletAddress);

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      receiverAddress: `https://meezan-userpanel.vercel.app:5173/kyc?user=${encoded}`,
      role: role.roleName,
      isKYC: user.isKYC,
      balance,
      token,
    };
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
