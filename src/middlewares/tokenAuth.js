const tokenAuth = (req,res,next) => {
    const token = req.headers.authorization.split(' ')[1]

    
    if(req.headers.authorization !== "password giusta e bella") {
        const error = new Error("wrong credentials.")
        error.status = 400
        next(error)
    }
    else {
        next()
    }
}

export default userAuth;