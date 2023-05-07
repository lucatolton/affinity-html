const express = require('express');
const router = express.Router();

// GET: /
router.get('/', (req, res) => {
    if (req.session.authenticated) return res.redirect('/account');
    else return res.render('index');
});

// Export router
module.exports = router;