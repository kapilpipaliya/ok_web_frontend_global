import { useSession } from "vinxi/http";


export function getHttpsSession() {
  const config = {
    password: "asdfgargabaewt124333415342erwbwetvfvgaqwt",
    // Other configuration options if required
  };
  return useSession(config);
}
