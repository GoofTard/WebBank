import axios from "axios";

console.log(process.env);

const instance = axios.create({
  baseURL: "http://localhost:9000",
  timeout: 1000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

export default {
  getUser: async (userid) => (await instance.get(`/users/${userid}`)).data,
  updateUser: async ({ id, items, total, usages }) =>
    (
      await instance.put(`/users/${id}`, {
        query: {
          $set: {
            items,
            total,
            usages,
          },
        },
      })
    ).status,
  updateItems: async (userid, items) =>
    (
      await instance.put(`/users/${userid}`, {
        query: {
          $set: {
            items,
          },
        },
      })
    ).status,
  updateTotal: async (userid, total) =>
    (
      await instance.put(`/users/${userid}`, {
        query: {
          $set: {
            total,
          },
        },
      })
    ).status,
};
