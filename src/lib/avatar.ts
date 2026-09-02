const getAvatarColor = (str: string = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 50%)`;
};

export default function createAvatar(name: string) {
  return {
    color: getAvatarColor(name),
    text: (name || "U").charAt(0).toUpperCase(),
  };
}
