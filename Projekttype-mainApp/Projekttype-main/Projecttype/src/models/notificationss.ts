export type ISOString = string;

export interface Notification {
    id: string;
    message: string;
    date: string;
    priority: "low" | "medium" | "high";
    title: string;
    read: boolean;
  }