import { Router } from 'express';
import { EmployeesController } from './employees.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validate } from '../../middleware/validate';
import { CreateEmployeeSchema } from '../../schemas/employee.schemas';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', EmployeesController.list);
router.get('/suggest-code', EmployeesController.suggestCode);
router.post('/', validate({ body: CreateEmployeeSchema }), EmployeesController.create);
router.get('/:id', EmployeesController.getOne);
router.delete('/:id', EmployeesController.deactivate);

export default router;
