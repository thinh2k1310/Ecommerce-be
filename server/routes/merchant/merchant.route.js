const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const merchantController = require('./merchant.controller');
const role = require('../../middleware/role');
const merchantRouter = express.Router();

merchantRouter.get('/', auth, role.checkRole(role.ROLES.Admin), merchantController.getAllMerchants);

merchantRouter.post('/add', auth, role.checkRole(role.ROLES.Admin), merchantController.createMerchant);

merchantRouter.get('/:id', auth, role.checkRole(role.ROLES.Admin), merchantController.getMerchantById);

merchantRouter.put('/:id', auth,role.checkRole(role.ROLES.Admin), merchantController.updateMerchant);

merchantRouter.delete('/:id', auth, role.checkRole(role.ROLES.Admin), merchantController.deleteMerchant);

module.exports = merchantRouter;
