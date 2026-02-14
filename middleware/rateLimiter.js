import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 1000 * 60 * 3,
    max: 4,
    message: "req limit exceeded ",
    legacyHeaders: true,
    standardHeaders:'draft-7',
})


export {
    limiter
}