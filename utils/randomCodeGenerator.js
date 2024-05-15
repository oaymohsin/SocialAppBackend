import crypto from 'crypto'

export function generateRandomCode(length){

    const codeLength= length || 6;

    const buffer= crypto.randomBytes(codeLength)

    //convert bytes to a string containing only number (0-9)
    const code= buffer.toString('hex').slice(0,codeLength)
    console.log(code)
    // const codeInNumber= Number(code)
    return code;
}