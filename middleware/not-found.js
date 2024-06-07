const notFound = (req, res) => res.render('not-found', { notFoundMessage: 'Route does not exist' });

export default notFound;
