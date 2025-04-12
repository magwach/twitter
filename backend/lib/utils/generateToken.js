import jwt from "jsonwebtoken";

export function generateTokenAndSetCookie(id, res){

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5d" });

    res.cookie("jwt", token, {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    })
}

