import jwt from 'jsonwebtoken';

const tokenAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            req.payload = payload;
            next();
        } catch (error) {
            return res.status(401).json({ message: "invalid token" });
        }
    } else {
        return res.status(401).json({ message: "missing or invalid authorization header" });
    }
};

export default tokenAuth;
