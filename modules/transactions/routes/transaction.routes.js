import { getBalanceController, trasactionController, usdcToPkrConversionController } from "../controllers/transactions.controller.js";

export const transactionRoutes = (fastify, options, done) => {
    fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/",
    handler: (req, reply) => {
      if (req.method == "POST") {
        trasactionController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/ouside-txn",
    handler: (req, reply) => {
      if (req.method == "POST") {
        trasactionController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/balance",
    handler: (req, reply) => {
      if (req.method == "GET") {
        getBalanceController(req, reply)
      }
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/currency-conversion",
    handler: (req, reply) => {
      if (req.method == "GET") {
        usdcToPkrConversionController(req, reply)
      }
    },
  });


  done();
}