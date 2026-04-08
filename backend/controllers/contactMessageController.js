const db = require('../config/db');

const getAllMessages = async (req, res) => {
  try {
    const [messages] = await db.execute(`
      SELECT \`id\`, \`name\`, \`email\`, \`phone\`, \`subject\`, \`message\`, \`created_at\`
      FROM \`contact_messages\`
      ORDER BY \`created_at\` DESC
    `);
    res.render('admin/contact-messages', {  // ✅ must match your actual file path inside views/
      title: 'Contact Messages',
      subTitle: 'Contact / Messages',
      messages,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (getAllMessages):', err);
    res.status(500).send('Server Error');
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.redirect('/contact-messages?error=Invalid message ID.');
  }
  try {
    const [result] = await db.execute('DELETE FROM `contact_messages` WHERE `id` = ?', [id]);
    if (result.affectedRows === 0) {
      return res.redirect('/contact-messages?error=Message not found.');
    }
    res.redirect('/contact-messages?success=Message deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteMessage):', err);
    res.redirect('/contact-messages?error=Failed to delete message.');
  }
};



const createMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    await db.execute(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, subject, message]
    );
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('DB Error (createMessage):', err);
    res.json({ success: false, message: 'Failed to send message.' });
  }
};

module.exports = { getAllMessages, deleteMessage, createMessage };