import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const uploadDir = path.resolve('uploads')
fs.mkdirSync(uploadDir, { recursive: true })
app.use('/uploads', express.static(uploadDir))
const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true }, password: { type: String, required: true } }, { timestamps: true })
const documentSchema = new mongoose.Schema({ title: { type: String, required: true }, description: String, originalName: { type: String, required: true }, storedName: { type: String, required: true }, mimeType: String, size: Number, owner: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentUser', required: true } }, { timestamps: true })
const User = mongoose.model('DocumentUser', userSchema)
const Document = mongoose.model('Document', documentSchema)
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadDir), filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) })
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Login required' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() } catch { res.status(401).json({ message: 'Invalid or expired token' }) }
}
app.get('/', (req, res) => res.json({ message: 'Document Management System API', maxUploadSize: '10 MB' }))
app.post('/api/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and password of at least 6 characters are required' })
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 10) })
    res.status(201).json({ id: user._id, name: user.name, email: user.email })
  } catch (e) { next(e) }
})
app.post('/api/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() })
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' })
    res.json({ token: jwt.sign({ id: user._id.toString(), name: user.name }, process.env.JWT_SECRET, { expiresIn: '4h' }), user: { id: user._id, name: user.name, email: user.email } })
  } catch (e) { next(e) }
})
app.get('/api/documents', auth, async (req, res, next) => {
  try { res.json(await Document.find({ owner: req.user.id }).sort({ createdAt: -1 })) } catch (e) { next(e) }
})
app.post('/api/documents', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a file in the file field' })
    if (!req.body.title?.trim()) return res.status(400).json({ message: 'Document title is required' })
    const doc = await Document.create({ title: req.body.title.trim(), description: req.body.description || '', originalName: req.file.originalname, storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size, owner: req.user.id })
    res.status(201).json({ ...doc.toObject(), url: `/uploads/${doc.storedName}` })
  } catch (e) { next(e) }
})
app.delete('/api/documents/:id', auth, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id })
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    await Document.deleteOne({ _id: doc._id })
    const filePath = path.join(uploadDir, doc.storedName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    res.json({ message: 'Document deleted' })
  } catch (e) { next(e) }
})
app.use((err, req, res, next) => res.status(err.code === 11000 ? 409 : err instanceof multer.MulterError ? 400 : 400).json({ message: err.message }))
mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(process.env.PORT || 3000, () => console.log('Document Management API running'))).catch(err => { console.error(err.message); process.exit(1) })
