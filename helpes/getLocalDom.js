import request from "request-promise";
import cheerio from "cheerio";

export default async function getLocalDom(link) {
  return await request({
    uri: link,
    transform: function (body) {
        return cheerio.load(body);
    }
  }).catch (err => {throw err})
}