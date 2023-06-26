import axios from "axios";
import CheerioAPI from "cheerio";

async function getLocalDom(link) {
  return await axios.get(link).then(({data}) => CheerioAPI.load(data))
}

export default getLocalDom