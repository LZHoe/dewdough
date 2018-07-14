exports.show = (req, res) => {
    res.render('home', {
        title: "Home",
        testd: req.user
    });
}