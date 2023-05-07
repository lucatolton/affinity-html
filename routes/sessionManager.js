const express = require('express');
const router = express.Router();

// POST: /sessionmanager/update
// Allows the HTML client to update the session information, without the need of multiple APIs
router.post('/update', (req, res) => {
    if (!req.body.update) {
        return res.status(400).json({
            error: 'Invalid request'
        });
    }

    req.body.update.forEach((update) => {
        req.session[update.key] = update.value;
    });
});

// Export router
module.exports = router;