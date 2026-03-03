import { Op } from "sequelize";
import { User } from "../modules/auth/models/user.model.js";
import { NonBank_kyc } from "../modules/kyc/models/non-bankKyc.model.js";
import { ethProvider } from "./utils.js";
import { ethers } from "ethers";
import { TransactionHistory } from "../modules/transactions/models/transactionHistory.model.js";
import { BankKyc } from "../modules/kyc/models/bankKyc.model.js";

export const USDC_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const usdc = new ethers.Contract(
  process.env.USDC_CONTRACT_ADDRESS,
  USDC_ABI,
  ethProvider,
);

export const transactions = async () => {
  usdc.on("Transfer", async (from, to, value, event) => {
    console.log(
      "From: ",
      from,
      "To: ",
      to,
      "Value: ",
      ethers.formatUnits(value, 6),
    );

    const allUsers = await User.findAll({ attributes: ["walletAddress"] });

    const mapUser = allUsers.map((user) => user.walletAddress);

    console.log("Map User: ", mapUser);

    if (mapUser.includes(to)) {
      let findUser = null;
      findUser = await User.findOne({
        where: {
          walletAddress: to,
        },
        attributes: ["id", "privateKey"],
      });

      console.log("Find User: ", findUser);

      if (findUser && !mapUser.includes(from)) {
        console.log(
          "Id: ",
          findUser?.id,
          "Private Key: ",
          findUser?.privateKey,
        );
        const findNonBankKYC = await NonBank_kyc.findOne({
          where: {
            [Op.and]: [{ user_id: findUser?.id }, { wallet_address: from }],
          },
        });

        const findBankKYC = await User.findOne({
          where: {
            walletAddress: from,
          },
        });

        console.log(findNonBankKYC);

        const amount = ethers.formatUnits(value, 6);

        if (
          !findNonBankKYC &&
          !findBankKYC &&
          from !== process.env.DISPUTE_WALLET_ADDRESS
        ) {
          await TransactionHistory.create({
            fromWalletAddress: from,
            toWalletAddress: to,
            status: "Invalid",
            transHash: null,
            initiator: null,
            isAuthorized: 0,
            toDisputeWallet: 1,
            isDispute: 1,
            amount,
          });

          let adminWallet = new ethers.Wallet(
            process.env.ADMIN_PRIVATE_KEY,
            ethProvider,
          );

          const tx = await adminWallet.sendTransaction({
            to,
            value: ethers.parseEther("0.01"),
          });

          if (!tx) throw new Error("Transaction Not Initiated");
          console.log("Transaction Initiated:", tx.hash);
          const txWait = await tx.wait();
          if (!txWait) throw new Error("Transaction Failed");
          console.log("Transaction Successful:", txWait.hash);

          const wallet = new ethers.Wallet(findUser.privateKey, ethProvider);

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

          const _amount = ethers.parseUnits(
            ethers.formatUnits(value, 6).toString(),
            decimals,
          );

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

          const txIntent = await token.transfer.populateTransaction(
            "0xFA28D1190CFCE05BB529A348863ADA699b8afD8d",
            _amount,
          );

          console.log("Transaction Intent:", txIntent);

          const _tx = await wallet.sendTransaction(txIntent);

          console.log("Transaction Hash:", _tx.hash);

          const receipt = await _tx.wait();

          console.log("Transaction Receipt:", receipt);

          if (receipt.hash) {
            await TransactionHistory.create({
              fromWalletAddress: to,
              toWalletAddress: "0xFA28D1190CFCE05BB529A348863ADA699b8afD8d", //ADMINS DISPUTE WALLET
              status: "SUCCESS",
              transHash: receipt.hash,
              initiator: findUser.id,
              isAuthorized: 1,
              toDisputeWallet: 0,
              isDispute: 0,
              amount,
            });
          }
        }
      }
      if (mapUser.includes(from) && mapUser.includes(to)) {
        await TransactionHistory.create({
          fromWalletAddress: from,
          toWalletAddress: to,
          status: "SUCCESS",
          transHash: null,
          initiator: null,
          isAuthorized: 1,
          toDisputeWallet: 0,
          isDispute: 0,
          amount: ethers.formatUnits(value, 6),
        });
      }
    }
  });
};
