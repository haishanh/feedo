const env = process.env;

export const config = {
  "site.name": "Feedo",
  "site.url": "https://feedo.vercel.app",
  "site.avatar":
    "https://user-images.githubusercontent.com/1166872/126872372-745e56b1-35b3-49cc-a3c8-6082e6960d76.png",

  "epicgames.offer.astra.dbId": env.EPICGAMES_ASTRA_DB_ID,
  "epicgames.offer.astra.region": env.EPICGAMES_ASTRA_REGION,
  "epicgames.offer.astra.keyspace": env.EPICGAMES_ASTRA_KEYSPACE,
  "epicgames.offer.astra.appToken": env.EPICGAMES_ASTRA_APP_TOKEN,
};
