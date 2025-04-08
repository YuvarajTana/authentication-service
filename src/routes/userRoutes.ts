// 7. User Routes: src/routes/userRoutes.ts
import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;