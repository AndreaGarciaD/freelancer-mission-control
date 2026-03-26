import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
} from '../controllers/document.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;