import { User } from "../models/user";

export class UserSessionManager {
  private static readonly STORAGE_KEY = "userSessionManagerData";

  loggedInUser: User | null;
  currentProjectId: string | null;
  currentStoryId: number | null;

  constructor() {
    const data = localStorage.getItem(UserSessionManager.STORAGE_KEY);
    if (data) {
      const { loggedInUser, currentProjectId, currentStoryId } =
        JSON.parse(data);
      this.loggedInUser = loggedInUser;
      this.currentProjectId = currentProjectId;
      this.currentStoryId = currentStoryId;
    } else {
      this.loggedInUser = null;
      this.currentProjectId = null;
      this.currentStoryId = null;
    }
  }

  private saveToLocalStorage() {
    const data = {
      loggedInUser: this.loggedInUser,
      currentProjectId: this.currentProjectId,
      currentStoryId: this.currentStoryId,
    };
    localStorage.setItem(UserSessionManager.STORAGE_KEY, JSON.stringify(data));
  }

  login(user: User) {
    this.loggedInUser = user;
    this.saveToLocalStorage();
  }

  logout() {
    this.loggedInUser = null;
    this.currentProjectId = null;
    this.currentStoryId = null;
    this.saveToLocalStorage();
  }

  setCurrentProject(projectId: string | null) {
    this.currentProjectId = projectId;
    this.saveToLocalStorage();
  }

  setCurrentStory(storyId: number | null) {
    this.currentStoryId = storyId;
    this.saveToLocalStorage();
  }
}