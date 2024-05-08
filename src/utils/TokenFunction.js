import jwt from 'jsonwebtoken'

////////Token Generation////////
export const Tokengen = ({
    payload = {},
    signature = process.env.DEFAULT_SIGNATURE,
    expiresIn = '3h',
  } = {}) => {
    // check if the payload is empty object
    if (!Object.keys(payload).length) {
      return false
    }
    const token = jwt.sign(payload, signature, { expiresIn })
    return token
  }

  ////////VerifyToken//////////
  export const verifyToken = ({
    token = '',
    signature = process.env.DEFAULT_SIGNATURE,
  } = {}) => {
    // check if the payload is empty object
    if (!token) {
      return false
    }
    const data = jwt.verify(token, signature)
    return data
  }

