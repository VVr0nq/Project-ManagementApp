import { Task } from "./task";
import { User } from "./user";

export enum Priority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
  }
  
  export enum Status {
    TODO = "Todo",
    DOING = "Doing",
    DONE = "Done",
  }
  export class Story {
    id?: number;
    name: string;
    description: string;
    priority: Priority;
    project: string;
    creationDate: number;
    status: Status;
    owner: User;
    tasks?: Task[];
  
    constructor(
      id: number,
      name: string,
      description: string,
      priority: Priority,
      project: string,
      creationDate: number,
      status: Status,
      owner: User
    ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.priority = priority;
      this.project = project;
      this.creationDate = creationDate;
      this.status = status;
      this.owner = owner;
    }
  }