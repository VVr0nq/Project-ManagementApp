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
import { NotificationService } from "./services/notifcations.ts";
import { Notification } from "./models/notificationss.ts";

const notificationService = new NotificationService();
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
        <div id="notification-icon" class="relative cursor-pointer ml-4">
          <span class="material-icons">notifications</span>
        </div>
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
    <dialog id="notification-dialog" class="rounded-lg p-4 shadow-lg w-80">
        <h3 class="text-lg font-bold mb-2">Notification (<span id="notification-count"></span>)</h3>
        <div id="notifications-list" class="mt-2"></div>
        <div class="flex justify-end mt-4">
          <button id="close-notification-dialog" py-2 px-4 rounded">Close</button>
        </div>
      </dialog>
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

  const notificationIcon = document.getElementById("notification-icon");
  const notificationDialog = document.getElementById("notification-dialog") as HTMLDialogElement;
  const closeNotificationDialog = document.getElementById("close-notification-dialog");

  if (notificationIcon) {
    notificationIcon.addEventListener("click", () => {
      if (notificationDialog) {
        notificationDialog.showModal();
      }
    });
  }

  if (closeNotificationDialog) {
    closeNotificationDialog.addEventListener("click", () => {
      if (notificationDialog) {
        notificationDialog.close();
      }
    });
  }

  notificationService.list().subscribe((notificationList: Notification[]) => {
    const notificationsList = document.getElementById("notifications-list");
    if (notificationsList) {
      notificationsList.innerHTML = notificationList.map(notification => `
        <div class="notification p-2 border-b dark:border-gray-600 ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
          <h3 class="font-bold">${notification.title}</h3>
          <p>${notification.message}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${notification.date}</p>
           <p class="text-xs">${notification.priority}</p>
          <p class="text-xdd  dark:border-green-600 ${notification.read ? 'read' : ''}">${notification.read ? 'Read' : ''}</p>
          <p class="text-xd  dark:border-red-600 ${notification.read ? 'unread' : ''}">${!notification.read ? 'Unread' : ''}</p>
        </div>
      `).join('');

      // Update notification count
      const notificationCount = document.getElementById("notification-count");
      if (notificationCount) {
        notificationCount.textContent = notificationList.length.toString();
      }
    }

    // Add event listeners for notifications
    const notificationElements = document.querySelectorAll('.notification');
    notificationElements.forEach(notificationElement => {
      notificationElement.addEventListener('click', () => {
        const notificationId = notificationElement.getAttribute('data-id');
        if (notificationId) {
          notificationService.markAsRead(notificationId);
          notificationElement.classList.remove('unread');
          notificationElement.classList.add('read');
        }
      });
    });
  });

  notificationService.unreadCount().subscribe((count) => {
    const notificationDot = document.getElementById("unread-count");
    if (notificationDot) {
      notificationDot.textContent = count > 0 ? count.toString() : '';
      notificationDot.style.display = count > 0 ? 'block' : 'none';
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
    notificationService.send({
      id: Date.now().toString(),
      message: `Project ${newName} has been created.`,
      date: new Date().toISOString(),
      priority: "low",
      title: "Project Created",
      read: false,
    });
  }
  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    await deleteProject(projectId);
    await refreshProjects();
    notificationService.send({
      id: Date.now().toString(),
      message: `Project has been deleted.`,
      date: new Date().toISOString(),
      priority: "medium",
      title: "Project Deleted",
      read: false,
    });
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
