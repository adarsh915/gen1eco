const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/footer_banners';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });
exports.upload = upload;

// ─── PAGE ─────────────────────────────────────────────────────────────────────
exports.bannerPage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM footer_top_banners ORDER BY created_at DESC LIMIT 1');
    const banner = rows[0] || null;
    res.render('admin/footer-top-banner', {
      title: 'Footer Top Banner',
      subTitle: 'Settings / Footer Top Banner',
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
    const {
      left_title, left_subtitle, left_button_text, left_button_link,
      right_title, right_subtitle, right_button_text, right_button_link,
      status
    } = req.body;

    const leftImage  = req.files?.left_banner?.[0]?.filename  || null;
    const rightImage = req.files?.right_banner?.[0]?.filename || null;

    // Check if record exists
    const [rows] = await db.execute('SELECT id, left_banner_image, right_banner_image FROM footer_top_banners LIMIT 1');
    const existing = rows[0] || null;

    if (existing) {
      // Use new image or keep old one
      const leftImg  = leftImage  || existing.left_banner_image;
      const rightImg = rightImage || existing.right_banner_image;

      await db.execute(`
        UPDATE footer_top_banners SET
          left_banner_image=?, left_title=?, left_subtitle=?, left_button_text=?, left_button_link=?,
          right_banner_image=?, right_title=?, right_subtitle=?, right_button_text=?, right_button_link=?,
          status=?
        WHERE id=?`,
        [leftImg, left_title, left_subtitle, left_button_text, left_button_link,
         rightImg, right_title, right_subtitle, right_button_text, right_button_link,
         status, existing.id]
      );
    } else {
      await db.execute(`
        INSERT INTO footer_top_banners
          (left_banner_image, left_title, left_subtitle, left_button_text, left_button_link,
           right_banner_image, right_title, right_subtitle, right_button_text, right_button_link, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [leftImage, left_title, left_subtitle, left_button_text, left_button_link,
         rightImage, right_title, right_subtitle, right_button_text, right_button_link,
         status]
      );
    }

    res.redirect('/footer-top-banner?success=Banner updated successfully.');
  } catch (err) {
    console.error('DB Error (saveBanner):', err);
    res.redirect('/footer-top-banner?error=Failed to save banner.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteBanner = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT left_banner_image, right_banner_image FROM footer_top_banners LIMIT 1');
    const banner = rows[0];
    if (banner) {
      // Delete image files
      ['left_banner_image', 'right_banner_image'].forEach(key => {
        if (banner[key]) {
          const filePath = path.join('public/uploads/footer_banners', banner[key]);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
      await db.execute('DELETE FROM footer_top_banners');
    }
    res.redirect('/footer-top-banner?success=Banner deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteBanner):', err);
    res.redirect('/footer-top-banner?error=Failed to delete banner.');
  }
};

// ─── PUBLIC API FOR REACT ─────────────────────────────────────────────────────
exports.getBanner = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM footer_top_banners WHERE status = 1 LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};