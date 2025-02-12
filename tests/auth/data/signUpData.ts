import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";

export interface SignUpData {
  email: string;
  name: string;
  password: string;
  subDomain: string;
}
export const signUpData: SignUpData = {
  email: 'kapil1@kapil1.com',
  name: 'kapil1',
  password: 'kK11235813@',
  subDomain: 'kapil1'
};

export const superUserData = {
  email: "superuser@easyformforge.com",
  password: "kK11235813@",
  subDomain: SYSTEM_DB_NAME,
  username: "superuser"
};