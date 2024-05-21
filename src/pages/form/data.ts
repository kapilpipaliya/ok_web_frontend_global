import postAPI from "~/components/api/postApi";

export async function getAll() {
  const data = await postAPI("/api/get_userFromDomain", {});
  return data;
}
