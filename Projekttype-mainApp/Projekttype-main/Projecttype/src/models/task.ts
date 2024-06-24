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

export class Task {
    id?: number;
    name: string;
    description: string;
    priority: Priority;
    story: number;
    estimatedTime?: string;
    status: Status;
    startDate?: number;
    endDate?: number;
    addedDate: number;
    startWorkDate?: number;
    userAssigned?: User;
  
    constructor(
      id: number,
      name: string,
      description: string,
      priority: Priority,
      story: number,
      estimatedTime: string,
      status: Status,
      addedDate: number,
      startWorkDate?: number,
      endDate?: number,
      userAssigned?: User
    ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.priority = priority;
      this.story = story;
      this.estimatedTime = estimatedTime;
      this.status = status;
      this.addedDate = addedDate;
      this.startWorkDate = startWorkDate;
      this.endDate = endDate;
      this.userAssigned = userAssigned;
    }
  }