import axios from "axios";
import * as fs from "node:fs/promises";
import dotenv from "dotenv";
import { makeRank } from "./helper/makeRank";
import { formatDate } from "./helper/formatDate";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN_1;

makeStocksRankingArticle();

async function makeStocksRankingArticle() {
  const stocksRanking = await makeStocksRanking();
  await makeAndPatchArticle(stocksRanking);
}

async function makeStocksRanking() {
  let pageNumber = 1;
  let allResponseData = [];
  while (true) {
    const responseData = (
      await axios.get("https://qiita.com//api/v2/items", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          query: "stocks:>2300",
          page: pageNumber,
          per_page: 100,
        },
      })
    ).data.map((article: any) => {
      return {
        title: article.title,
        stocksCount: article.stocks_count,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        url: article.url,
      };
    });

    if (responseData.length === 0) {
      break;
    }

    allResponseData.push(responseData);

    pageNumber++;
  }

  const stocksRanking = allResponseData
    .flat()
    .sort((a: any, b: any) => {
      if (a.stocksCount > b.stocksCount) {
        return -1;
      }
      if (a.stocksCount < b.stocksCount) {
        return 1;
      }
      return 0;
    })
    .slice(0, 100);

  return stocksRanking;
}

async function makeAndPatchArticle(stocksRanking: any) {
  const articleInformation = {
    title: "【保存版】Qiita歴代ストック数ランキング100",
    body: await makeArticleBody(stocksRanking),
    tags: [
      { name: "TypeScript" },
      { name: "QiitaAPI" },
      { name: "Qiita" },
      { name: "JavaScript" },
      { name: "初心者" },
    ],
  };

  try {
    await axios.patch(
      "https://qiita.com/api/v2/items/2391cd66cd00048df7cb",
      articleInformation,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("更新が完了しました！");
  } catch (e) {
    console.log(e);
    console.log("更新に失敗しました。。");
  }
}

async function makeArticleBody(stocksRanking: any) {
  const lead = await fs.readFile("stocksRankingLead.md", "utf-8");
  const articleBody = stocksRanking.reduce(
    async (prevArticleBody: string, rankingData: any, index: number) => {
      const content = await fs.readFile("stocksRanking.md", "utf-8");
      return (
        (await prevArticleBody) +
        content
          .replace("rankValue", makeRank(index + 1))
          .replace("titleValue", rankingData.title)
          .replace("stockValue", rankingData.stocksCount)
          .replace("urlValue", rankingData.url)
          .replace("createdAtValue", formatDate(rankingData.createdAt))
          .replace("updatedAtValue", formatDate(rankingData.updatedAt))
      );
    },
    lead
  );

  return articleBody;
}
