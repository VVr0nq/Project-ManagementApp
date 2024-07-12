import { addTask, updateTask, deleteTask } from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status, Task } from "../models/task";
import { refreshProjects } from "../main";
import { Project } from "../models/project";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase";

export function renderStories(
  project: Project,
  userManager: UserSessionManager
): string {
  let story: Story | undefined = undefined;
  if (userManager.currentStoryId != null && project.stories) {
    story = project.stories.find(
      (story) => story.id === userManager.currentStoryId
    );
  }

  if (!project || !story) {
    return "";
  }

  document.addEventListener("click", handleClick);

  async function populateUserAssignedDropdown() {
    const db = getFirestore(app);
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const userAssignedDropdown = document.getElementById(
      "editTaskUserAssigned"
    ) as HTMLSelectElement;
    userAssignedDropdown.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const option = document.createElement("option");
      option.value = JSON.stringify({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      });

      option.textContent = userData.firstName + " (" + userData.role + ")";
      userAssignedDropdown.appendChild(option);
    });
  }

  populateUserAssignedDropdown();

  async function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const editDialog = document.getElementById(
      "editTaskDialog"
    ) as HTMLDialogElement;

    if (target.classList.contains("addTask")) {
      const newTaskName = prompt("Enter the name of the new task:");
      const newTaskDescription = prompt(
        "Enter the description of the new task:"
      );
      let maxTaskID = -1;
      story?.tasks?.forEach((task) => {
        if (task.id != undefined && task.id > maxTaskID) {
          maxTaskID = task.id;
        }
      });

      if (newTaskName && newTaskDescription && story?.id != null) {
        const newTask: Task = {
          id: maxTaskID + 1,
          name: newTaskName,
          description: newTaskDescription,
          priority: Priority.LOW,
          story: story.id,
          status: Status.TODO,
          addedDate: Date.now(),
        };

        addTask(project.id, story.id, newTask);
        document.removeEventListener("click", handleClick);
        refreshProjects();
      }
    } else if (target.classList.contains("exitStory")) {
      userManager.setCurrentStory(null);
      document.removeEventListener("click", handleClick);
      refreshProjects();
    } else if (target.classList.contains("editTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null && story.tasks != null) {
        const taskToEdit = story.tasks.find((task) => task.id === taskId);
        if (taskToEdit) {
          const editTaskNameInput = document.getElementById(
            "editTaskName"
          ) as HTMLInputElement;
          const editTaskDescriptionInput = document.getElementById(
            "editTaskDescription"
          ) as HTMLTextAreaElement;
          const editTaskPrioritySelect = document.getElementById(
            "editTaskPriority"
          ) as HTMLSelectElement;
          const editTaskUserAssignedInput = document.getElementById(
            "editTaskUserAssigned"
          ) as HTMLSelectElement;
          const editTaskEstimatedTimeInput = document.getElementById(
            "editTaskEstimatedTime"
          ) as HTMLInputElement;

          editTaskNameInput.value = taskToEdit.name;
          editTaskDescriptionInput.value = taskToEdit.description;
          editTaskPrioritySelect.value = taskToEdit.priority;
          editTaskEstimatedTimeInput.value =
            taskToEdit.estimatedTime?.toString() || "";

          if (taskToEdit.userAssigned) {
            editTaskUserAssignedInput.value = JSON.stringify(
              taskToEdit.userAssigned
            );
          }

          editDialog?.showModal();

          const saveButton = document.getElementById(
            "saveTaskButton"
          ) as HTMLButtonElement;

          const saveListener = () => {
            const updatedTaskName = editTaskNameInput.value;
            const updatedTaskDescription = editTaskDescriptionInput.value;
            const updatedTaskPriority =
              editTaskPrioritySelect.value as Priority;
            const updatedTaskUserAssigned = editTaskUserAssignedInput.value;
            const updatedTaskEstimatedTime =
              new Date(editTaskEstimatedTimeInput.value) > new Date(Date.now())
                ? editTaskEstimatedTimeInput.value
                : undefined;
            let updatedTaskStatus = Status.TODO;

            if (updatedTaskUserAssigned != undefined)
              updatedTaskStatus = Status.DOING;

            if (
              updatedTaskName &&
              updatedTaskDescription &&
              story.id != undefined
            ) {
              const updatedTask: Partial<Task> = {
                id: taskId,
                name: updatedTaskName,
                description: updatedTaskDescription,
                startWorkDate: updatedTaskUserAssigned ? Date.now() : undefined,
                priority: updatedTaskPriority,
                status: updatedTaskStatus,
                userAssigned: JSON.parse(updatedTaskUserAssigned),
                estimatedTime: updatedTaskEstimatedTime,
              };
              updateTask(project.id, story.id, updatedTask);
              editDialog?.close();
              refreshProjects();
            }
          };

          saveButton?.addEventListener("click", saveListener);
          editDialog?.addEventListener("close", () => {
            saveButton?.removeEventListener("click", saveListener);
          });
        }
      }
    } else if (target.classList.contains("deleteTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null) {
        deleteTask(project.id, story?.id, taskId);
        document.removeEventListener("click", handleClick);
        refreshProjects();
      }
    } else if (target.classList.contains("endTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null && story.tasks != null) {
        const taskToEnd = story.tasks.find((task) => task.id === taskId);
        if (taskToEnd) {
          let updatedTask: Partial<Task>;
          if (taskToEnd.status === Status.DONE) {
            updatedTask = {
              id: taskId,
              status: Status.DOING,
              endDate: 0,
            };
          } else {
            updatedTask = {
              id: taskId,
              status: Status.DONE,
              endDate: Date.now(),
            };
          }

          updateTask(project.id, story.id, updatedTask);
          document.removeEventListener("click", handleClick);
          refreshProjects();
        }
      }
    }
  }

  const tasksByStatus = {
    [Status.TODO]:
      story.tasks?.filter((task) => task.status === Status.TODO) || [],
    [Status.DOING]:
      story.tasks?.filter((task) => task.status === Status.DOING) || [],
    [Status.DONE]:
      story.tasks?.filter((task) => task.status === Status.DONE) || [],
  };

  const renderTasks = (tasks: Task[]) => {
    return tasks
      .map(
        (task) =>
          `<div class="p-4 w-[17em] mx-auto m-4 bg-white dark:bg-gray-700 shadow-md rounded-lg mb-4">
            <h3 class="text-xl font-semibold mb-2">${task.name}</h3>
            <p class="mb-2">Description: ${task.description}</p>
            <p class="mb-2">Priority: ${task.priority}</p>
            <p class="mb-2">Status: ${task.status}</p>
            <p class="mb-2">Creation Date : ${new Date(
              task.addedDate
            ).toLocaleString()}</p>
            ${
              task.startWorkDate == undefined
                ? ``
                : `<p class="mb-2">Start Date: ${new Date(
                    task.startWorkDate
                  ).toLocaleString()}</p>`
            }
            ${
              task.endDate === undefined || task.endDate === 0
                ? ``
                : `<p class="mb-2">End Date: ${new Date(
                    task.endDate
                  ).toLocaleString()}</p>`
            }
            <p class="mb-2">Contractor: ${
              task.userAssigned ? task.userAssigned?.firstName : "<i>missing</i>"
            }</p>
            <p class="mb-2">Expected execution time: ${
              task.estimatedTime ? task.estimatedTime : "<i>missing</i>"
            }</>
            <div class="flex space-x-2">
            <button class="editTask bg-orange-500 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Edit</button>
            <button class="deleteTask bg-blue-400 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Delete</button>
            ${
              task.status === Status.DONE || task.endDate !== undefined 
                ? ""
                : `<button class="endTask bg-brown-700 text-white py-1 px-2 rounded" data-task-id="${
                    task.id
                  }">End Task</button>`
            }
          </div>
        </div>`
      )
      .join("");
  };

  const tasksList = `
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <div class="col-span-1">
      <h2 class="text-lg text-center font-semibold mb-4">TODO</h2>
      ${renderTasks(tasksByStatus[Status.TODO])}
    </div>
    <div class="col-span-1 ">
      <h2 class="text-lg text-center font-semibold mb-4">DOING</h2>
      ${renderTasks(tasksByStatus[Status.DOING])}
    </div>
    <div class="col-span-1">
      <h2 class="text-lg text-center font-semibold mb-4">DONE</h2>
      ${renderTasks(tasksByStatus[Status.DONE])}
    </div>
  </div>
`;

  return `
  <div class="p-4 bg-gray-100  dark:bg-gray-800 rounded-lg shadow-md">
    <div class="flex justify-center items-center space-x-4 mb-4">
      <button class="exitStory  px-10 text-lg font-bold mb-2">←</button>
      </div>
      <div class="inline-block mb-4">
      <h1 class="text-2xl font-bold mb-4">Story: ${story.name}</h1>
      </div>
      <div class="p-4 bg-gray-100  dark:bg-gray-800">
      <div class="flex justify-center items-center space-x-4 mb-4">
      <button class="addTask bg-blue-500 text-white py-2 px-4 rounded ">Add Task</button>
      </div>
    </div>
    <dialog id="editTaskDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Edit task</h2>
      <label for="editTaskName" class="block mb-2">Name task:</label>
      <input type="text" id="editTaskName" name="editTaskName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      <label for="editTaskDescription" class="block mb-2">Description:</label>
      <textarea id="editTaskDescription" name="editTaskDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
      <label for="editTaskPriority" class="block mb-2">Priority:</label>
      <select id="editTaskPriority" name="editTaskPriority" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <option value="${Priority.LOW}">Low</option>
        <option value="${Priority.MEDIUM}">Medium</option>
        <option value="${Priority.HIGH}">High</option>
      </select>
      <label for="editTaskUserAssigned" class="block mb-2">Contractor:</label>
      <select id="editTaskUserAssigned" name="editTaskUserAssigned" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      
      </select>
      <label for="editTaskEstimatedTime" class="block mb-2">Expected execution time (days):</label>
      <input type="date" id="editTaskEstimatedTime" name="editTaskEstimatedTime" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      <div class="flex justify-end space-x-2">
        <button id="saveTaskButton" class="bg-green-200 text-white py-2 px-4 rounded">Save</button>
        <button id="cancelEditTaskButton" class="bg-gray-300 text-white py-2 px-4 rounded" onclick="document.getElementById('editTaskDialog').close()">Cancel</button>
      </div>
    </dialog>
    <div class="taskList">
      ${tasksList}
    </div>
  </div>`;
}
