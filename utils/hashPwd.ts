import {
    genSaltSync,
    compareSync,
    hashSync,
} from '../deps.ts'

export async function encryptPwd(pwd:any) {
    const salt = genSaltSync(5)
    const hs = hashSync(pwd,salt);
    return hs;
}

export async function comparePwd(pwd:any,pwdHash:any) {
    const isValid = compareSync(pwd, pwdHash);
    return isValid;
}