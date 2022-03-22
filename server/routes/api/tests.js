const router = require('express').Router();
const runSeed = require('../../db/seed');

router.get('/resetdb', async (req, res, next) => {
	runSeed();
	res.status(200).send('database reset');
});

module.exports = router;
