import Cryptr from "cryptr";
const cryptr = new Cryptr(process.env.DB_ENCRYPTION_SECRET as string);

export const encryption = cryptr.encrypt;
export const decryption = cryptr.decrypt;
