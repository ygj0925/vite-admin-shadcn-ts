import CryptoJS from 'crypto-js'
import { JSEncrypt } from 'jsencrypt'

export function encodeByBase64(txt: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(txt))
}

export function decodeByBase64(txt: string): string {
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(txt))
}

export function encryptByMd5(txt: string): string {
  return CryptoJS.MD5(txt).toString()
}

export function encryptByRsa(txt: string): string {
  const encryptor = new JSEncrypt()
  const publicKey = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALrGECBDi1cHvGmR3cBBCslsIFHJ
  rJbjJPPBJiIGjPNqJf2PGFCkufHo3FUhGEFDcGNMwNVJP3OOFQM0K7kCAwEAAQ==`
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt) || ''
}

export function encryptByAes(word: string, keyWord = 'XwKsGlMcdPMEhR1B'): string {
  const key = CryptoJS.enc.Utf8.parse(keyWord)
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}
