const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ─── MULTER SETUP FOR SLIDER IMAGES ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/sliders';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'slider_' + file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
exports.upload = upload;

// ─── ADMIN LIST PAGE ────────────────────────────────────────────────────────
exports.sliderList = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sliders ORDER BY sort_order ASC');
    res.render('admin/main-slider', {
      title: 'Main Slider',
      subTitle: 'Settings / Main Slider',
      sliders: rows,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (sliderList):', err);
    res.status(500).send('Server Error');
  }
};

// ─── ADMIN ADD PAGE ─────────────────────────────────────────────────────────
exports.addSliderPage = async (req, res) => {
  res.render('admin/add-main-slider', {
    title: 'Add Main Slider',
    subTitle: 'Settings / Add Main Slider',
    error: req.query.error || null,
  });
};

// ─── ADD NEW SLIDER ─────────────────────────────────────────────────────────
exports.addSlider = async (req, res) => {
  try {
    const { heading_small, heading_main, description, button_text, button_link, sort_order, status } = req.body;
    
    // multer might provide large_image and small_image in req.files -> mapping to image_large, image_small
    const image_large = req.files && req.files.large_image ? req.files.large_image[0].filename : null;
    const image_small = req.files && req.files.small_image ? req.files.small_image[0].filename : null;

    const query = `
      INSERT INTO sliders 
      (heading_small, heading_main, description, button_text, button_link, image_large, image_small, sort_order, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      heading_small || '', heading_main || '', description || '', 
      button_text || '', button_link || '', 
      image_large, image_small, 
      sort_order || 0, status === 'Active' ? 1 : 0
    ];

    await db.execute(query, params);
    res.redirect('/main-slider?success=Slider added successfully.');
  } catch (err) {
    console.error('DB Error (addSlider):', err);
    res.redirect('/main-slider?error=Failed to add slider.');
  }
};

// ─── EDIT SLIDER PAGE ───────────────────────────────────────────────────────
exports.editSliderPage = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM sliders WHERE id = ?', [id]);
    if (rows.length === 0) return res.redirect('/main-slider?error=Slider not found.');
    
    res.render('admin/edit-main-slider', {
      title: 'Edit Main Slider',
      subTitle: 'Settings / Edit Main Slider',
      slider: rows[0],
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (editSliderPage):', err);
    res.redirect('/main-slider?error=Failed to load edit page.');
  }
};

// ─── UPDATE SLIDER ──────────────────────────────────────────────────────────
exports.updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading_small, heading_main, description, button_text, button_link, sort_order, status } = req.body;
    
    // get existing to know old images
    const [rows] = await db.execute('SELECT image_large, image_small FROM sliders WHERE id = ?', [id]);
    if (rows.length === 0) return res.redirect('/main-slider?error=Slider not found.');
    const s = rows[0];

    const newLarge = req.files && req.files.large_image ? req.files.large_image[0].filename : s.image_large;
    const newSmall = req.files && req.files.small_image ? req.files.small_image[0].filename : s.image_small;

    // Remove old files if replaced
    if (req.files && req.files.large_image && s.image_large) {
      const p = path.join('public/uploads/sliders', s.image_large);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    if (req.files && req.files.small_image && s.image_small) {
      const p = path.join('public/uploads/sliders', s.image_small);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    const query = `
      UPDATE sliders 
      SET heading_small=?, heading_main=?, description=?, button_text=?, button_link=?, 
          image_large=?, image_small=?, sort_order=?, status=?
      WHERE id=?
    `;
    const params = [
      heading_small || '', heading_main || '', description || '', 
      button_text || '', button_link || '', 
      newLarge, newSmall, 
      sort_order || 0, status === 'Active' ? 1 : 0, id
    ];

    await db.execute(query, params);
    res.redirect('/main-slider?success=Slider updated successfully.');
  } catch (err) {
    console.error('DB Error (updateSlider):', err);
    res.redirect('/main-slider?error=Failed to update slider.');
  }
};

// ─── DELETE SLIDER ──────────────────────────────────────────────────────────
exports.deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    
    // get old images to delete them
    const [rows] = await db.execute('SELECT image_large, image_small FROM sliders WHERE id = ?', [id]);
    if (rows.length > 0) {
      const s = rows[0];
      if (s.image_large) {
        const p = path.join('public/uploads/sliders', s.image_large);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      if (s.image_small) {
        const p = path.join('public/uploads/sliders', s.image_small);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }

    await db.execute('DELETE FROM sliders WHERE id = ?', [id]);
    res.redirect('/main-slider?success=Slider deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteSlider):', err);
    res.redirect('/main-slider?error=Failed to delete slider.');
  }
};

// ─── PUBLIC API FOR FRONTEND ────────────────────────────────────────────────
exports.getSlidersApi = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sliders WHERE status = 1 ORDER BY sort_order ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
