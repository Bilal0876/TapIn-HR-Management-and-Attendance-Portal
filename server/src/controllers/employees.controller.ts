import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employees.service';
import { CreateEmployeeSchema } from '../dtos/employees.dto';

export class EmployeesController {
  static async suggestCode(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).employee.id;
      const { department, designation } = req.query as { department?: string; designation?: string };
      const employeeCode = await EmployeeService.suggestEmployeeCode(adminId, department, designation);
      res.json({ employeeCode });
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).employee.id;
      const validatedData = CreateEmployeeSchema.parse(req.body);
      const result = await EmployeeService.createEmployee(adminId, { ...validatedData, password: req.body.password } as any);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).employee.companyId;
      const result = await EmployeeService.getAllEmployees(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).employee.companyId;
      const result = await EmployeeService.getEmployeeById(companyId, req.params.id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).employee.id;
      await EmployeeService.deactivateEmployee(adminId, req.params.id);
      res.json({ message: 'Employee deactivated' });
    } catch (e) {
      next(e);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).employee.id;
      const result = await EmployeeService.toggleEmployeeStatus(adminId, req.params.id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
