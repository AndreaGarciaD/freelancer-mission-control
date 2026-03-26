import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import {
    createPhase,
    getPhases,
    getPhaseById,
    updatePhase,
    deletePhase,
    reorderPhases,
} from '../controllers/phase.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', createPhase);
router.get('/', getPhases);
router.get('/:id', getPhaseById);
router.put('/reorder', reorderPhases);
router.put('/:id', updatePhase);
router.delete('/:id', deletePhase);

export default router;