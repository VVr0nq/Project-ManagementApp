import "./style.css";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectById,
} from "./services/projectManager.ts";
import { renderProjects } from "./views/projectview.ts";
import { User, mockUsers } from "./models/user.ts";
import { UserSessionManager } from "./services/userSessionManager.ts";
import { loginView } from "./views/loginview.ts";

const users: User[] = [];
const userManager = new UserSessionManager();
users.push(...mockUsers());

export async function refreshProjects() {
  const Projects = await getAllProjects();
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  if (appDiv) {
    appDiv.innerHTML = `
          <h1 class="text-2xl font-bold mb-4 text-center">Project Manager App</h1>
        </div>
        ${loginView(userManager)}
        <div class="flex justify-center mb-4">
        <button class="addBtn bg-purple-500 text-white py-1 px-4">Add Project</button>
        </div>
        <div class="absolute right-11 lg:right-[19%] top-6">
          <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" id="themeToggle" class="sr-only peer" checked>
        <div class="relative w-11 h-6 bg-gray-100 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span class="ms-3 text-sm font-medium text-white dark:text-gray-300">Dark mode</span>
        </label>
        </div>
        <div class="projectContainer flex-col flex ">
      ${
        userManager.currentProjectId == null
          ? Projects.map(
              (project) => `
          <div class="border rounded-xl mx-auto w-1/2 bg-gray-500 dark:bg-green-800 p-4 m-4" data-id="${project.id}">
            <h2 class="text-3xl font-semibold">${project.name}</h2>
            <p class="mb-2 py-2">${project.desc}</p>
            <button class="modBtn bg-orange-500 text-white py-1 px-2 rounded mr-2" data-id="${project.id}">Edit</button>
            <button class="delBtn bg-brown-500 text-white py-1 px-2 rounded mr-2" data-id="${project.id}">Delete</button>
            <button class="chooseBtn bg-purple-500 text-white py-1 px-2 rounded" data-id="${project.id}">Choose</button>
          </div>
        `
            ).join("")
          : renderProjects(
              await getProjectById(userManager.currentProjectId),
              userManager
            )
      }
    </div>
    `;
  }
  const themeToggle = document.getElementById("themeToggle") as HTMLInputElement;
  const isDarkMode = localStorage.getItem("theme") === "dark";
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }
  themeToggle.checked = isDarkMode;

  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
}

refreshProjects();

document.addEventListener("click", handleClick);

async function handleClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains("addBtn")) {
    const newName = prompt("Name the project:");
    const newDesc = prompt("Description of the project:");
    if (
      newName === null ||
      newDesc === null ||
      newName === "" ||
      newDesc === ""
    ) {
      return;
    }

    await createProject({ id: "", name: newName, desc: newDesc });
    userManager.setCurrentProject(null); // going back?
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    await deleteProject(projectId);
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("modBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    const project = await getProjectById(projectId);
    if (!project) return;

    const newName = prompt("Name the project:", project.name);
    const newDesc = prompt("Description of the project:", project.desc);

    if (
      newName === null ||
      newDesc === null ||
      newName === "" ||
      newDesc === ""
    ) {
      return;
    }

    await updateProject(projectId, { name: newName, desc: newDesc });
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("chooseBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    userManager.setCurrentProject(projectId);
    location.reload();
  }

  if ((event.target as HTMLElement).classList.contains("exitProject")) {
    userManager.setCurrentProject(null);
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("navStory")) {
    userManager.setCurrentStory(null);
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("navHome")) {
    userManager.setCurrentProject(null);
    userManager.setCurrentStory(null);
    await refreshProjects();
  }
}
