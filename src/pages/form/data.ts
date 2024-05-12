import postAPI from "~/components/api/postApi";

export const getAll = async () => {
    const data = await postAPI('/api/get_userFromDomain',{});
    return data;    

};