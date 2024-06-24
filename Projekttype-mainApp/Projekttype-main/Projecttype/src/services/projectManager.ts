import { Story } from "../models/story";
import { Task } from "../models/task";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { app } from "../firebase";
import { Project } from "../models/project";

const db = getFirestore(app);

export async function getAllProjects(): Promise<Project[]> {
  try {
    const projectsCollectionRef = collection(db, "projects");
    const querySnapshot = await getDocs(projectsCollectionRef);
    const projects: Project[] = querySnapshot.docs.map((doc) => {
      const projectData = doc.data() as Project;
      return {
        id: doc.id,
        name: projectData.name,
        desc: projectData.desc,
        stories: projectData.stories,
      };
    });

    return projects;
  } catch (error) {
    console.error("Error loading projects from Firebase:", error);
    return [];
  }
}

export async function createProject(project: Project) {
  try {
    const projectsCollectionRef = collection(db, "projects");
    await addDoc(projectsCollectionRef, {
      name: project.name,
      desc: project.desc,
    });
  } catch (error) {
    console.error("Error creating project and saving to Firebase:", error);
  }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  try {
    const projectDocRef = doc(db, "projects", id);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      return {
        id: projectDoc.id,
        name: projectData.name,
        desc: projectData.desc,
        stories: projectData.stories,
      };
    } else {
      console.error("No such project!");
      return undefined;
    }
  } catch (error) {
    console.error("Error getting project from Firebase:", error);
    return undefined;
  }
}

export async function updateProject(id: string, newData: Partial<Project>) {
  try {
    const projectDocRef = doc(db, "projects", id);
    await updateDoc(projectDocRef, newData);
  } catch (error) {
    console.error("Error updating project:", error);
  }
}

export async function deleteProject(id: string) {
  try {
    const projectDocRef = doc(db, "projects", id);
    await deleteDoc(projectDocRef);
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}

export async function getStoryById(
  projectId: string,
  storyId: number
): Promise<Story | undefined> {
  try {
    const project = await getProjectById(projectId);
    if (project && project.stories) {
      return project.stories.find((story) => story.id === storyId);
    }
    return undefined;
  } catch (error) {
    console.error("Error getting story from Firebase:", error);
    return undefined;
  }
}

export async function addStory(projectId: string, story: Story): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      if (!projectData.stories) {
        projectData.stories = [];
      }
      projectData.stories.push(story);
      await updateDoc(projectDocRef, { stories: projectData.stories });
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error adding story:", error);
  }
}

export async function updateStory(
  projectId: string,
  updatedStory: Partial<Story>
): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      if (projectData.stories) {
        const index = projectData.stories.findIndex(
          (story) => story.id === updatedStory.id
        );
        if (index !== -1) {
          projectData.stories[index] = {
            ...projectData.stories[index],
            ...updatedStory,
          };
          await updateDoc(projectDocRef, { stories: projectData.stories });
        } else {
          console.error("Story not found in project");
        }
      } else {
        console.error("No stories found in project");
      }
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error updating story:", error);
  }
}

export async function deleteStory(
  projectId: string,
  storyId: number
): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      if (projectData.stories) {
        const index = projectData.stories.findIndex(
          (story) => story.id === storyId
        );
        if (index !== -1) {
          projectData.stories.splice(index, 1);
          await updateDoc(projectDocRef, { stories: projectData.stories });
        } else {
          console.error("Story not found in project");
        }
      } else {
        console.error("No stories found in project");
      }
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error deleting story:", error);
  }
}

export async function addTask(
  projectId: string,
  storyId: number,
  task: Task
): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      const story = projectData.stories?.find((story) => story.id === storyId);
      if (story) {
        if (!story.tasks) {
          story.tasks = [];
        }
        story.tasks.push(task);
        await updateDoc(projectDocRef, { stories: projectData.stories });
      } else {
        console.error("No such story in project");
      }
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

export async function updateTask(
  projectId: string,
  storyId: number,
  updatedTask: Partial<Task>
): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      const story = projectData.stories?.find((story) => story.id === storyId);
      if (story && story.tasks) {
        const index = story.tasks.findIndex(
          (task) => task.id === updatedTask.id
        );
        if (index !== -1) {
          story.tasks[index] = { ...story.tasks[index], ...updatedTask };
          await updateDoc(projectDocRef, { stories: projectData.stories });
        } else {
          console.error("Task not found in story");
        }
      } else {
        console.error("No tasks found in story");
      }
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

export async function deleteTask(
  projectId: string,
  storyId: number,
  taskId: number
): Promise<void> {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Project;
      const story = projectData.stories?.find((story) => story.id === storyId);
      if (story && story.tasks) {
        const index = story.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          story.tasks.splice(index, 1);
          await updateDoc(projectDocRef, { stories: projectData.stories });
        } else {
          console.error("Task not found in story");
        }
      } else {
        console.error("No tasks found in story");
      }
    } else {
      console.error("No such project!");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}