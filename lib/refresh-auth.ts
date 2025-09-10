import { axiosInstance, setHeaderToken, getFinalUrl } from "./queries";


export const fetchNewToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    const token_json = {
      refresh: refresh
    }
    const token: string = await axiosInstance
      .post("/token/refresh/", token_json)
      .then(res => res.data.access);
    return token;
  } catch (error) {
    console.log("Error getting refresh token");
    console.log(error);
    return null;
  }
};

export const refreshAuth = async (failedRequest: any) => {
  const newToken = await fetchNewToken();

  if (newToken) {
    failedRequest.response.config.headers.Authorization = "Bearer " + newToken;
    setHeaderToken(newToken);
    localStorage.setItem('accessToken', newToken);
    // you can set your token in storage too
    // setToken({ token: newToken });
    return Promise.resolve(newToken);
  } else {
    // you can redirect to login page here
    // router.push("/login");
    return Promise.reject();
  }
};
