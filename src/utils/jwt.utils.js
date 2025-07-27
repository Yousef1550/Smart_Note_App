import jwt from 'jsonwebtoken'




export const signToken = ({data, privateKey, options} = {}) => {
    return jwt.sign(data, privateKey, {
        algorithm: 'RS256',
        ...options
    })
}


export const verifyToken = ({token, publicKey} = {}) => {
    return jwt.verify(token, publicKey, {
        algorithms: ['RS256']
    })
}


