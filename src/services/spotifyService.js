import axios from "axios";

const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const refreshToken = async (refreshToken) => {
  const authOptions = {
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(client_id + ":" + client_secret),
    },
    data: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  };

  try {
    const response = await axios(authOptions);
    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;
      console.log("Updated access token Granted");
      return { access_token, refresh_token };
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

const getToken = async (code) => {
  const redirect_uri = "http://localhost:5173/callback";

  const authOptions = {
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(client_id + ":" + client_secret),
    },
    data: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
    }),
  };

  try {
    const response = await axios(authOptions);
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

const apiRequest = async (options) => {
  try {
    const response = await axios(options);
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const refreshTokenValue = sessionStorage.getItem("refresh_token");
      if (refreshTokenValue) {
        const tokenData = await refreshToken(refreshTokenValue);
        sessionStorage.setItem("access_token", tokenData.access_token);
        options.headers.Authorization = `Bearer ${tokenData.access_token}`;
        return axios(options);
      }
    }
    throw error;
  }
};

export { refreshToken, getToken, apiRequest };
