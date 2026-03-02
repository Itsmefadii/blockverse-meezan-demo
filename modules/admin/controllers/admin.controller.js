import { adminWalletsBalancesService, fetchTransactionHistoryService, masterWalletServices, processRefundService, updateTransactionHistory, userListingService } from "../services/admin.services.js";
import { apiResponse } from "../../../utils/utils.js";

export const masterWalletController = async (req, reply) => {
    try {
        const data = await masterWalletServices(req);

        return reply.status(200).send(apiResponse(true, "Master wallet created successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Master wallet creation failed: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const fetchTransactionHistoryController = async (req, reply) => {
    try {
        const data = await fetchTransactionHistoryService(req);

        return reply.status(200).send(apiResponse(true, "Transaction history fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch transaction history: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const updateTransactionHistoryController = async (req, reply) => {
    try {
        const data = await updateTransactionHistory(req);

        return reply.status(200).send(apiResponse(true, "Transaction history fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch transaction history: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const adminWalletsBalancesController = async (req, reply) => {
    try {
        const data = await adminWalletsBalancesService(req);

        return reply.status(200).send(apiResponse(true, "Balances fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch balances: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const userListingController = async (req, reply) => {
    try {
        const data = await userListingService(req);

        return reply.status(200).send(apiResponse(true, "Users fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch users: ${error.message}`, null, 400, "FAILURE"));
    }
}

export const processRefundController = async (req, reply) => {
    try {
        const data = await processRefundService(req);

        return reply.status(200).send(apiResponse(true, "Users fetched successfully", data, 200, "SUCCESS"));
    } catch (error) {
        return reply.status(400).send(apiResponse(false, `Failed to fetch users: ${error.message}`, null, 400, "FAILURE"));
    }
}