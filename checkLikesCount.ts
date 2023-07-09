import axios from "axios";
import dotenv from "dotenv";
import { makeCreatedAtRangeList } from "./helper/makeCreatedAtRangeList";
dotenv.config();

let accessTokenList = [
  process.env.ACCESS_TOKEN_1,
  process.env.ACCESS_TOKEN_2,
  process.env.ACCESS_TOKEN_3,
  process.env.ACCESS_TOKEN_4,
  process.env.ACCESS_TOKEN_5,
  process.env.ACCESS_TOKEN_6,
  process.env.ACCESS_TOKEN_7,
];

execute();

async function execute() {
  if (await checkLikesCount()) {
    console.log("大丈夫そうですうう！！");
  }
  console.log(
    "500ストック以下の記事でいいね数が2000以上の記事が存在しています。。"
  );
}

// 500ストック以下の記事でいいね数が2000以上の記事がないことをチェックする
// このチェックに通ったら、「500ストックより大きい」でlikesRankingの条件を絞ることができる
async function checkLikesCount(): Promise<boolean> {
  const createdAtRangeList = await makeCreatedAtRangeList();
  let apiCount = 0;
  let accessTokenCount = 0;
  let over100PageCreatedAtRangelist = [];

  for (const createdAtRange of createdAtRangeList) {
    console.log(`-----${createdAtRange}がスタート-----`);

    if (apiCount === 1000) {
      apiCount = 0;
      accessTokenCount++; // 1時間あたりのアクセス制限を回避するためトークンの入れ替えを行う
    }

    let pageNumber = 1;
    while (true) {
      if (pageNumber > 100) {
        console.log(`${createdAtRange}ではpageNumberが100を超えました。。`); // TODO:100を超えたrangeの再処理も自動化したい
        over100PageCreatedAtRangelist.push(createdAtRange);
        break;
      }

      const responseData = (
        await axios.get("https://qiita.com/api/v2/items", {
          headers: {
            Authorization: `Bearer ${accessTokenList[accessTokenCount]}`,
          },
          params: {
            query: `${createdAtRange} stocks:<=500`,
            page: pageNumber,
            per_page: 100,
          },
        })
      ).data.map((article: any) => {
        return {
          title: article.title,
          likesCount: article.likes_count,
          url: article.url,
        };
      });
      apiCount++;
      console.log(`現在APIを${apiCount}回叩いています。`);

      if (responseData.length === 0) {
        break;
      }

      const filteredResponseData = responseData.filter((article: any) => {
        return article.likesCount >= 2000;
      });

      if (filteredResponseData.length !== 0) {
        console.log(
          `次のデータは2000いいねを超えています。。:${filteredResponseData}`
        );
        console.log(
          `PageNumberが100を超えたrangeはこちら:${over100PageCreatedAtRangelist}`
        );
        return false; // 2000いいね以上の記事が存在したらアウト
      }

      pageNumber++;
    }

    console.log(`-----${createdAtRange}はOK！-----`);
  }

  console.log(
    `PageNumberが100を超えたrangeはこちら:${over100PageCreatedAtRangelist}`
  );
  return true;
}
