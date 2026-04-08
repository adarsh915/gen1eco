const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/banner';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'banner_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
exports.upload = upload;

// ─── PAGE ─────────────────────────────────────────────────────────────────────
exports.bannerPage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM single_banner LIMIT 1');
    const banner = rows[0] || null;
    res.render('admin/single-banner', {
      title: 'Single Banner',
      subTitle: 'Settings / Single Banner',
      banner,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (bannerPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── SAVE / UPDATE ────────────────────────────────────────────────────────────
exports.saveBanner = async (req, res) => {
  try {
    const { title_small, title_big, button_text, link } = req.body;
    const newImage = req.file ? req.file.filename : null;

    const [rows] = await db.execute('SELECT id, image FROM single_banner LIMIT 1');
    const existing = rows[0] || null;

    if (existing) {
      const image = newImage || existing.image;

      // Delete old image if new one uploaded
      if (newImage && existing.image) {
        const oldPath = path.join('public/uploads/banner', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await db.execute(
        'UPDATE single_banner SET image=?, title_small=?, title_big=?, button_text=?, link=? WHERE id=?',
        [image, title_small, title_big, button_text, link, existing.id]
      );
    } else {
      await db.execute(
        'INSERT INTO single_banner (image, title_small, title_big, button_text, link) VALUES (?, ?, ?, ?, ?)',
        [newImage, title_small, title_big, button_text, link]
      );
    }

    res.redirect('/single-banner?success=Banner updated successfully.');
  } catch (err) {
    console.error('DB Error (saveBanner):', err);
    res.redirect('/single-banner?error=Failed to save banner.');
  }
};

// ─── PUBLIC API FOR REACT ─────────────────────────────────────────────────────
exports.getBanner = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM single_banner LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};