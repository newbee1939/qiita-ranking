export const makeRank = (rank: number) => {
  if (rank === 1) {
    return '<font color="#EFAF00">1位</font>';
  }
  if (rank === 2) {
    return '<font color="#BBBDC0">2位</font>';
  }
  if (rank === 3) {
    return '<font color="#C47222">3位</font>';
  }
  return `${rank}位`;
};
