import { Router } from 'express';
import { EmployeesController } from '../controllers/employees.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { CreateEmployeeSchema } from '../dtos/employees.dto';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', EmployeesController.list);
router.get('/suggest-code', EmployeesController.suggestCode);
router.post('/', validate({ body: CreateEmployeeSchema }), EmployeesController.create);
router.get('/:id', EmployeesController.getOne);
router.patch('/:id/toggle-status', EmployeesController.toggleStatus);
router.delete('/:id', EmployeesController.deactivate);

export default router;
