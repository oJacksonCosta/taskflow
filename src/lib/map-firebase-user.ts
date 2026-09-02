export default function mapFirebaseUser(
  firebaseUser: any,
  defaultLogin: boolean,
) {
  const mappedUser = {
    accessToken: firebaseUser.accessToken,
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || "Usuário sem nome",
    email: firebaseUser.email,
    photoUrl: firebaseUser.photoURL || null,
    defaultLogin: defaultLogin,
  };

  return mappedUser;
}
