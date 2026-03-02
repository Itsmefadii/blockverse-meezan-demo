import { adminRoutes } from "./modules/admin/routes/admin.routes.js";
import { authRoutes } from "./modules/auth/routes/auth.routes.js";
import { beneficiaryRoutes } from "./modules/beneficiary/routes/beneficiaries.routes.js";
import { kycRoutes } from "./modules/kyc/routes/kyc.routes.js";
import { systemConfigRoutes } from "./modules/SystemConfigs/routes/systemConfigs.routes.js";
import { transactionRoutes } from "./modules/transactions/routes/transaction.routes.js";

export const allRoutes = (fastify, options, done) => {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.register(beneficiaryRoutes, { prefix: "/beneficiary" });
  fastify.register(systemConfigRoutes, { prefix: "/system-config" });
  fastify.register(transactionRoutes, { prefix: "/transactions" });
  fastify.register(kycRoutes, { prefix : "/kyc"});
 
  fastify.get("/health", async () => {
    return {
      status: "ok",
      success: true,
      service: "api",
      timestamp: new Date().toISOString(),
    };
  });
  done();
};
