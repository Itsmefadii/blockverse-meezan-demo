import { adminWalletsBalancesController, fetchTransactionHistoryController, masterWalletController, processRefundController, updateTransactionHistoryController, userListingController } from "../controllers/admin.controller.js";

export const adminRoutes = (fastify, options, done) => {
    fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/master-wallet",
    handler: (req, reply) => {
      if (req.method == "GET") {
        masterWalletController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/transaction-history",
    handler: (req, reply) => {
      if (req.method == "GET") {
        fetchTransactionHistoryController(req, reply)
      }
      if (req.method == "PUT") {
        updateTransactionHistoryController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/refund-process",
    handler: (req, reply) => {
      if (req.method == "POST") {
        processRefundController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/wallets-balances",
    handler: (req, reply) => {
      if (req.method == "GET") {
        adminWalletsBalancesController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/users",
    handler: (req, reply) => {
      if (req.method == "GET") {
        userListingController(req, reply)
      }
    },
  });


  done();
}