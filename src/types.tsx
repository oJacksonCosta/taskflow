export interface User {
  accessToken?: string;
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
  defaultLogin: boolean;
}
