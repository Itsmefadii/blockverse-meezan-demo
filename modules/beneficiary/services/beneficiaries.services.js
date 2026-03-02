import { Op } from "sequelize";
import { BankCostumerDummy } from "../model/BankCostumerDummy.model.js";
import { Beneficiaries } from "../model/beneficiaries.model.js";
import sequelize from "../../../config/db.js";

export const addBeneficiariesService = async (req) => {
  try {
    const { benefId } = req.query;

    const findBenef = await Beneficiaries.findOne({
      where: {
        [Op.and]: [{ userId: req.user.id }, { bankCostumerId: benefId }],
      },
    });

    if (findBenef) {
      throw new Error("Beneficiary Already Exists");
    }

    const addBenef = await Beneficiaries.create({
      userId: req.user.id,
      bankCostumerId: benefId,
    });

    if (!addBenef) {
      throw new Error("Unable to add beneficiary");
    }

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const findBenficiaryService = async (req) => {
  try {
    const { bankId, walletAddress, benefId } = req.query;

    let where = ''

    if (!bankId && !walletAddress) {
        where = `WHERE b.userId = ${req.user.id}`
        
        if(benefId){
            where = `WHERE b.userId = ${req.user.id} AND b.bankCostumerId = ${benefId}`
        }
      const [findBenefs] =
        await sequelize.query(`SELECT b.bankCostumerId AS benefId, bcd.costumerName, bcd.walletAddress, bcd.bankId, bnk.bankName 
FROM Beneficiaries b 
LEFT JOIN BankCostumerDummy bcd ON b.bankCostumerId = bcd.id 
LEFT JOIN Banks bnk ON bcd.bankId = bnk.id
${where}`);

      return findBenefs;
    }

    const findBenef = await BankCostumerDummy.findOne({
      where: {
        [Op.and]: [{ bankId }, { walletAddress }],
      },
    });

    if (!findBenef) {
      throw new Error("Beneficiary not found");
    }

    return findBenef;
  } catch (error) {
    throw new Error(error.message);
  }
};
