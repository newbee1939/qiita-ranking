export const formatDate = (dateTime: string): string => {
  const date: Date = new Date(dateTime);

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
