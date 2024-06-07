const getSecretWord = async (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = 'syzygy';
  };
  res.render('secretWord', { secretWord: req.session.secretWord });
};

const changeSecretWord = async (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == 'P') {
    req.flash('error', `That word won't work!`);
    req.flash('error', `You can't use words that start with p.`);
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash('info', 'The secret word was changed.');
  };
  res.redirect('/secretWord');
};

export {getSecretWord, changeSecretWord};
