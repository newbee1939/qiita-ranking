import axios from "axios";
import * as fs from "node:fs/promises";
import dotenv from "dotenv";
import { makeRank } from "./helper/makeRank";
import { formatDate } from "./helper/formatDate";
import { makeCreatedAtRangeList } from "./helper/makeCreatedAtRangeList";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN_3;

makeLikesRankingArticle();

async function makeLikesRankingArticle() {
  const likesRanking = await makeLikesRanking();

  await makeAndPatchArticle(likesRanking);
}

async function makeLikesRanking() {
  const createdAtRangeList = await makeCreatedAtRangeList();
  const likesRanking = [];

  for (const createdAtRange of createdAtRangeList) {
    console.log(`-----${createdAtRange}-----`);

    let pageNumber = 1;
    let allResponseData = [];

    while (true) {
      const responseData = (
        await axios.get("https://qiita.com/api/v2/items", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            query: `${createdAtRange} stocks:>500`, // 500以下の記事にいいねが多い記事がないことは担保しないといけない
            page: pageNumber,
            per_page: 100,
          },
        })
      ).data.map((article: any) => {
        return {
          title: article.title,
          likesCount: article.likes_count,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          url: article.url,
          userId: `@${article.user.id}`,
        };
      });

      if (responseData.length === 0) {
        break;
      }

      console.log(`${pageNumber}ページ`);

      allResponseData.push(responseData);

      pageNumber++;
    }

    likesRanking.push(...allResponseData.flat());

    console.log(`-----${createdAtRange}-----`);
  }

  return likesRanking
    .sort((a, b) => {
      if (a.likesCount > b.likesCount) {
        return -1;
      }
      if (a.likesCount < b.likesCount) {
        return 1;
      }
      return 0;
    })
    .slice(0, 100);
}

async function makeAndPatchArticle(likesRanking: any) {
  const articleInformation = {
    title: "【保存版】Qiita歴代いいね数ランキング100【自動更新】",
    body: await makeArticleBody(likesRanking),
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
      "https://qiita.com/api/v2/items/48a37fcdc458603797de",
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
    console.log("更新に失敗しました..");
  }
}

async function makeArticleBody(likesRanking: any) {
  const lead = await fs.readFile("likesRankingLead.md", "utf-8");
  const articleBody = likesRanking.reduce(
    async (prevArticleBody: string, rankingData: any, index: number) => {
      const content = await fs.readFile("likesRanking.md", "utf-8");
      return (
        (await prevArticleBody) +
        content
          .replace("rankValue", makeRank(index + 1))
          .replace("titleValue", rankingData.title)
          .replace("likeValue", rankingData.likesCount)
          .replace("urlValue", rankingData.url)
          .replace("userIdValue", rankingData.userId)
          .replace("createdAtValue", formatDate(rankingData.createdAt))
          .replace("updatedAtValue", formatDate(rankingData.updatedAt))
      );
    },
    lead
  );

  return articleBody;
}
