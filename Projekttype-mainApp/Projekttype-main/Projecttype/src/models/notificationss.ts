export type ISOString = string;

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: ISOString;
  priority: "low" | "medium" | "high";
  read: boolean;
};