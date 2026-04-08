const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/three-boxes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });
exports.upload = upload;

// ─── LIST PAGE ────────────────────────────────────────────────────────────────
exports.listPage = async (req, res) => {
  try {
    const [boxes] = await db.execute('SELECT * FROM home_three_boxes ORDER BY created_at DESC');
    res.render('admin/three-boxes/index', {
      title: 'Three Boxes',
      subTitle: 'Home / Three Boxes',
      boxes,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (listPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── ADD PAGE ─────────────────────────────────────────────────────────────────
exports.addPage = async (req, res) => {
  res.render('admin/three-boxes/form', {
    title: 'Add Three Box',
    subTitle: 'Home / Three Boxes / Add',
    box: null,
    success: req.query.success || null,
    error:   req.query.error   || null,
  });
};

// ─── EDIT PAGE ────────────────────────────────────────────────────────────────
exports.editPage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM home_three_boxes WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/three-boxes?error=Box not found.');
    res.render('admin/three-boxes/form', {
      title: 'Edit Three Box',
      subTitle: 'Home / Three Boxes / Edit',
      box: rows[0],
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (editPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createBox = async (req, res) => {
  try {
    const { heading, sub_heading, button_text, button_link, status } = req.body;
    const image = req.file ? req.file.filename : null;
    await db.execute(
      'INSERT INTO home_three_boxes (heading, sub_heading, button_text, button_link, image, status) VALUES (?, ?, ?, ?, ?, ?)',
      [heading, sub_heading, button_text, button_link, image, status || 1]
    );
    res.redirect('/three-boxes?success=Box created successfully.');
  } catch (err) {
    console.error('DB Error (createBox):', err);
    res.redirect('/three-boxes/add?error=Failed to create box.');
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateBox = async (req, res) => {
  try {
    const { id, heading, sub_heading, button_text, button_link, status } = req.body;
    const newImage = req.file ? req.file.filename : null;

    const [rows] = await db.execute('SELECT image FROM home_three_boxes WHERE id=?', [id]);
    const existing = rows[0];
    if (!existing) return res.redirect('/three-boxes?error=Box not found.');

    const image = newImage || existing.image;

    // Delete old image if new one uploaded
    if (newImage && existing.image) {
      const oldPath = path.join('public/uploads/three-boxes', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.execute(
      'UPDATE home_three_boxes SET heading=?, sub_heading=?, button_text=?, button_link=?, image=?, status=? WHERE id=?',
      [heading, sub_heading, button_text, button_link, image, status, id]
    );
    res.redirect('/three-boxes?success=Box updated successfully.');
  } catch (err) {
    console.error('DB Error (updateBox):', err);
    res.redirect('/three-boxes?error=Failed to update box.');
  }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT status FROM home_three_boxes WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/three-boxes?error=Box not found.');
    const newStatus = rows[0].status == 1 ? 0 : 1;
    await db.execute('UPDATE home_three_boxes SET status=? WHERE id=?', [newStatus, req.params.id]);
    res.redirect('/three-boxes?success=Status updated successfully.');
  } catch (err) {
    console.error('DB Error (toggleStatus):', err);
    res.redirect('/three-boxes?error=Failed to update status.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteBox = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT image FROM home_three_boxes WHERE id=?', [req.params.id]);
    const box = rows[0];
    if (!box) return res.redirect('/three-boxes?error=Box not found.');

    if (box.image) {
      const filePath = path.join('public/uploads/three-boxes', box.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.execute('DELETE FROM home_three_boxes WHERE id=?', [req.params.id]);
    res.redirect('/three-boxes?success=Box deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteBox):', err);
    res.redirect('/three-boxes?error=Failed to delete box.');
  }
};

// ─── API: GET ALL ACTIVE BOXES ────────────────────────────────────────────────
exports.apiGetThreeBoxes = async (req, res) => {
  try {
    const [boxes] = await db.execute('SELECT * FROM home_three_boxes WHERE status = 1 ORDER BY created_at ASC');
    res.json({ success: true, data: boxes });
  } catch (err) {
    console.error('API Error (apiGetThreeBoxes):', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};