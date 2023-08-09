# qiita-ranking

- [【保存版】Qiita 歴代いいね数ランキング 100](https://qiita.com/newbee1939/items/48a37fcdc458603797de)
- [【保存版】Qiita 歴代ストック数ランキング 100](https://qiita.com/newbee1939/items/2391cd66cd00048df7cb)

## 環境構築

1. cp .env.example .env
2. npm ci

## document

- Qiita API:https://qiita.com/api/v2/docs
- https://help.qiita.com/ja/articles/qiita-search-options
- https://scrapbox.io/masaks/Promise%E3%81%AE%E7%9B%B4%E5%88%97%E5%8C%96

## how to update the article

- npm run ts stocksRanking.ts
- npm run ts likesRanking.ts

## check

checkLikesCount.ts 実行することで 500 ストック以下の記事でいいね数が 2000 以上の記事が存在しているかどうかチェックできる。
チェックが OK なら likesRanking.ts を実行できる。

npm run ts checkLikesCount.ts

## 機能追加等で別で記事を投稿してチェックしたい場合

以下のように実装を一時的に変える

1. private:true にする
2. axios.post にする
3. URL の最後の記事 ID を外す

```typescript
const articleInformation = {
    title: "【保存版】Qiita歴代ストック数ランキング100",
    private: true,
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
await axios.post("https://qiita.com/api/v2/items", articleInformation, {
```
