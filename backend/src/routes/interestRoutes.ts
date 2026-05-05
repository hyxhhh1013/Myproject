import { Router } from 'express';
import { interestController } from '../controllers/interestController';

const router = Router();

// 配置上传中间件
const upload = interestController.upload.single('cover');

// 获取所有兴趣
router.get('/', interestController.getAllInterests);

// 获取单个兴趣
router.get('/:id', interestController.getInterestById);

// 创建兴趣
router.post('/', upload, interestController.createInterest);

// 更新兴趣
router.put('/:id', upload, interestController.updateInterest);

// 删除兴趣
router.delete('/:id', interestController.deleteInterest);

export default router;
