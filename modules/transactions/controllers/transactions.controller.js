import { apiResponse } from "../../../utils/utils.js";
import { getBalanceService, outsideTxnService, transactionServices, usdcToPkrConversionService } from "../services/transaction.services.js";

export const trasactionController = async (req, reply) => {
    try {
        const data = await transactionServices(req);

        return reply.status(200).send(apiResponse(true, "Transaction successful", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Transactio failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const outsideTxnController = async (req, reply) => {
    try {
        const data = await outsideTxnService(req);

        return reply.status(200).send(apiResponse(true, "Transaction successful", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Transactio failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const getBalanceController = async (req, reply) => {
    try {
        const data = await getBalanceService(req);

        return reply.status(200).send(apiResponse(true, "Balance fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch balance: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const usdcToPkrConversionController = async (req, reply) => {
    try {
        const data = await usdcToPkrConversionService(req);

        return reply.status(200).send(apiResponse(true, "USDC to PKR converted successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, error.message, null, 400, "FAILURE"));
    }
}