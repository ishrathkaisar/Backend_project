import { body, validationResult, param, query } from 'express-validator';

export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const registerRules = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

export const loginRules = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

export const createTodoRules = [
  body('title').notEmpty().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low','medium','high']),
];
