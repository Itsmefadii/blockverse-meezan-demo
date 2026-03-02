import { bankListingController } from "../Controllers/systemConfig.controller.js";

export const systemConfigRoutes = (fastify, options, done) => {
    fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/banks",
    handler: (req, reply) => {
      if (req.method == "POST") {
       
      }
      if (req.method == "GET") {
       bankListingController(req, reply)
      }
    },
  });


  done();
}