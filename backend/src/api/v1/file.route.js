/*
file.route.js
파일 업로드와 다운로드를 관리하는 Route

*/

import { Router } from 'express'
import {
    upload,
    getFileInfo,
    getFilePath,
    increaseFileHit,
} from '../../utils/file'
import { asyncRoute, validateParams } from '../../utils/api'
import { param } from 'express-validator'

const router = Router()

// 업로드 된 파일의 정보 획득
router.get(
    '/info/:file_id',
    [param('file_id').isMongoId(), validateParams],
    asyncRoute(async (req, res) => {
        const fileinfo = await getFileInfo(req.params.file_id)
        if (fileinfo) {
            res.json(fileinfo)
        } else {
            const err = new Error('존재하지 않는 파일입니다.')
            err.status = 404
            throw err
        }
    })
)

// 파일을 업로드
router.post(
    '/upload',
    upload.single('file'),
    asyncRoute(async (req, res) => {
        res.json({
            id: req.file.filename,
            size: req.file.size,
        })
    })
)

// 파일을 다운로드
router.get(
    '/download/:file_id',
    [param('file_id').isMongoId(), validateParams],
    asyncRoute(async (req, res) => {
        const fileinfo = await getFileInfo(req.params.file_id)
        if (fileinfo) {
            const fullpath = getFilePath(req.params.file_id)
            res.download(fullpath, fileinfo.filename, async err => {
                if (err) {
                    res.status(404).json({
                        message: '파일을 다운로드 할 수 없습니다.',
                    })
                } else {
                    await increaseFileHit(req.params.file_id)
                }
            })
        } else {
            res.status(404).json({ message: '존재하지 않는 파일입니다.' })
        }
    })
)
export default router
