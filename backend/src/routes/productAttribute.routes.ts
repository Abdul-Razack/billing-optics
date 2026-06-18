import { Router } from 'express';
import { ProductAttributeController } from '../controllers/productAttribute.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

export function createProductAttributeRoutes() {
  // Staff can read the attributes and options
router.get('/categories/:categoryId/attributes', authenticate, ProductAttributeController.getAttributesByCategory);

// Admins can define new attributes
router.post(
  '/attributes', 
  authenticate, 
  authorizeRoles(ROLES.ADMIN), 
  ProductAttributeController.createAttributeDefinition
);

// Managers/Admins can add new dropdown options inline
router.post(
  '/attributes/:id/options', 
  authenticate, 
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), 
  ProductAttributeController.createAttributeOption
);

// Admins can delete attributes
router.delete(
  '/attributes/:id', 
  authenticate, 
  authorizeRoles(ROLES.ADMIN), 
  ProductAttributeController.deleteAttributeDefinition
);

  return router;
}
