const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

const categoryController =  require('./category.controller');
const categoryRouter = express.Router();

categoryRouter.post('/add', auth, role.checkRole(role.ROLES.Admin), categoryController.createCategory);

categoryRouter.get('/list', categoryController.getCategories);

categoryRouter.get('/', categoryController.getAllCategories);

categoryRouter.put('/:id', auth, role.checkRole(role.ROLES.Admin), categoryController.updateCategory);



module.exports = categoryRouter;
