// Middleware to validate API key
const validateAPIKey = (req, res, next) => {
    const apiKey = req.headers['authorization']
    if (!apiKey) {
        res.status(401).json({
            error: 'Unauthorized'
        }); 
    }
    if (apiKey === process.env.API_KEY) {
        next(); // API key is valid, proceed next
    } else {
        res.status(401).json({
            error: 'Unauthorized'
        }); 
    }
};

module.exports = {validateAPIKey}