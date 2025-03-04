export const getWord = (req, res) => {
	if (!req.session.secretWord) req.session.secretWord = 'syzygy';
	res.render('secretWord', { secretWord: req.session.secretWord });
};

export const postWord = (req, res) => {
	const { secretWord } = req.body;
	if (!secretWord) {
		req.flash('error', "That word won't work!");
		req.flash('error', 'You must provide a word.');
	} else if (secretWord.toUpperCase()[0] === 'P') {
		req.flash('error', "That word won't work!");
		req.flash('error', "You can't use words that start with 'p'.");
	} else {
		req.session.secretWord = secretWord;
		req.flash('info', 'The secret word was changed.');
	}
	res.redirect(req.originalUrl);
};
