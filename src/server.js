const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 7878;
const accessTokenUrl = 'https://github.com/login/oauth/access_token';
const githubApiUrl = 'https://api.github.com';

const getParamsFormat = (config) => {
  const params = Object.entries(config)
    .map((param) => {
      const [key, value] = param;
      return `${key}=${value}`;
    })
    .join('&');
  return `?${params}`;
};

app.get('/api/githubLogin', async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const config = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
    };
    const params = getParamsFormat(config);
    const response = await fetch(`${accessTokenUrl}${params}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
    const tokenRequest = await response.json();
    const { access_token } = tokenRequest;
    const userRequest = await fetch(`${githubApiUrl}/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    const userData = await userRequest.json();

    res.send({ avatarUrl: userData.avatar_url });
  } catch (error) {
    res.send({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`server listening on PORT: ${PORT}`);
});
