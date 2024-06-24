import { Story } from "./story";

export type Project = {
  id: string;
  name: string;
  desc: string;
  stories?: Story[];
};