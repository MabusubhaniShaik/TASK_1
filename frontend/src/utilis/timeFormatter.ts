export const formatExpiry = (exp: number): string => {
  const date = new Date(exp * 1000);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const tt = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 → 12

  const hh = String(hours).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const YYYY = date.getFullYear();

  return `${hh}:${minutes}:${seconds} ${tt} ${MM}/${DD}/${YYYY}`;
};
