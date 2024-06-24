import { Project } from "../models/project";
import { UserSessionManager } from "../services/userSessionManager";
import { Story, Priority, Status } from "../models/story";
import { addStory, deleteStory, updateStory } from "../services/projectManager";
import { refreshProjects } from "../main";
import { renderStories } from "./storyview";


export function renderProjects(
  project: Project | undefined,
  userManager: UserSessionManager
): string {
  if (!project) {
    return "";
  }

  document.addEventListener("click", handleClick2);

  function handleClick2(event: MouseEvent) {
    const editDialog = document.getElementById(
      "editStoryDialog"
    ) as HTMLDialogElement;
    const target = event.target as HTMLElement;
    if (target.classList.contains("addStoryBtn")) {
      if (project?.id) {
        const newStoryName = prompt("Enter the name of the new story:");
        const newStoryDescription = prompt(
          "Enter the description of the new story:"
        );
        let maxID = -1;

        project.stories?.forEach((story) => {
          if (story.id != undefined && story.id > maxID) {
            maxID = story.id;
          }
        });

        if (newStoryName && newStoryDescription && userManager.loggedInUser) {
          const newStory: Story = {
            id: maxID + 1,
            name: newStoryName,
            description: newStoryDescription,
            priority: Priority.LOW,
            project: project.id,
            creationDate: Date.now(),
            status: Status.TODO,
            owner: userManager.loggedInUser,
          };

          if (newStory && project.id) {
            addStory(project.id, newStory);
          }
          document.removeEventListener("click", handleClick2);
          refreshProjects();
        }
      }
    } else if (target.classList.contains("editStoryBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );
      if (storyId != undefined && project?.stories != undefined) {
        const storyToEdit = project?.stories.find(
          (story) => story.id === storyId
        );

        if (!isNaN(storyId) && storyToEdit != null) {
          const editStoryNameInput = document.getElementById(
            "editStoryName"
          ) as HTMLInputElement;
          const editStoryDescriptionInput = document.getElementById(
            "editStoryDescription"
          ) as HTMLTextAreaElement;
          const editStoryPrioritySelect = document.getElementById(
            "editStoryPriority"
          ) as HTMLSelectElement;
          const editStoryStatusSelect = document.getElementById(
            "editStoryStatus"
          ) as HTMLSelectElement;

          editStoryNameInput.value = storyToEdit.name;
          editStoryDescriptionInput.value = storyToEdit.description;
          editStoryPrioritySelect.value = storyToEdit.priority;
          editStoryStatusSelect.value = storyToEdit.status;

          editDialog?.showModal();

          const saveButton = document.getElementById(
            "saveStoryButton"
          ) as HTMLButtonElement;
          const saveListener = () => {
            const updatedStoryName = editStoryNameInput.value;
            const updatedStoryDescription = editStoryDescriptionInput.value;
            const updatedStoryPriority =
              editStoryPrioritySelect.value as Priority;
            const updatedStoryStatus = editStoryStatusSelect.value as Status;

            if (
              updatedStoryName &&
              updatedStoryDescription &&
              storyId != undefined &&
              userManager.loggedInUser
            ) {
              const updatedStory: Partial<Story> = {
                id: storyId,
                name: updatedStoryName,
                description: updatedStoryDescription,
                priority: updatedStoryPriority,
                status: updatedStoryStatus,
                owner: userManager.loggedInUser,
              };
              updateStory(project.id, updatedStory);
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
    } else if (target.classList.contains("deleteStoryBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );
      if (!isNaN(storyId)) {
        const confirmDelete = confirm("Are you sure to delete story?");
        if (confirmDelete && project?.id) {
          deleteStory(project.id, storyId);
        }
        document.removeEventListener("click", handleClick2);
        refreshProjects();
      }
    } else if (target.classList.contains("selectBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );

      if (!isNaN(storyId)) {
        userManager.setCurrentStory(storyId);
      }
      document.removeEventListener("click", handleClick2);
      refreshProjects();
    } else if (target.classList.contains("exitStory")) {
      document.removeEventListener("click", handleClick2);
      userManager.setCurrentStory(null);
    }
  }

  const renderStoryItem = (story: Story): string => `
    <tr class="storyItem" data-id="${story.id}">
      <td class="border px-4 py-2">${story.name}</td>
      <td class="border px-4 py-2">${story.description}</td>
      <td class="border px-4 py-2">${story.owner.lastName}</td>
      <td class="border px-4 py-2">${story.priority}</td>
      <td class="border px-4 py-2">${story.status}</td>
      <td class="border px-4 py-2">${new Date(
        story.creationDate
      ).toLocaleString()}</td>
      <td class="border px-4 py-2">
        <button class="editStoryBtn bg-orange-500 text-white py-1 px-2 rounded mr-2">Edit</button>
        <button class="deleteStoryBtn bg-brown-500 text-white py-1 px-2 rounded mr-2">Delete</button>
        <button class="selectBtn bg-purple-500 text-white py-1 px-2 rounded">Choose</button>
      </td>
    </tr>
  `;
  const storyItems = project.stories
    ?.map((story) => renderStoryItem(story))
    .join("");

  return `${
    userManager.currentStoryId == null
      ? `<div class="projectDetails p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md text-center">
  <div class="projectInfo" data-id="${project.id}">   
    <button class="exitProject bg-blue-500 text-white py-2 px-4 rounded mb-4">&larr;</button>  
    <h2 class="text-2xl font-bold mb-4">Name: ${project.name}</h2>
    <p class="mb-4">Description: ${project.desc}</p>
    <button class="addStoryBtn bg-blue-500 text-white py-2 px-4 rounded mb-4">Add Story</button>
  </div>
  <dialog id="editStoryDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md w-1/2">
        <h2 class="text-xl font-bold mb-4">Edit Story</h2>
        <label for="editStoryName" class="block mb-2">Story Name:</label>
        <input type="text" id="editStoryName" name="editStoryName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="editStoryDescription" class="block mb-2">Story Description:</label>
        <textarea id="editStoryDescription" name="editStoryDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
        <label for="editStoryPriority" class="block mb-2">Story Priority:</label>
        <select id="editStoryPriority" name="editStoryPriority" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${Priority.LOW}">Low</option>
          <option value="${Priority.MEDIUM}">Medium</option>
          <option value="${Priority.HIGH}">High</option>
        </select>
        <label for="editStoryStatus" class="block mb-2">Story Status:</label>
        <select id="editStoryStatus" name="editStoryStatus" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${Status.TODO}">To Do</option>
          <option value="${Status.DOING}">In Progress</option>
          <option value="${Status.DONE}">Done</option>
        </select>
        
        <div class="flex justify-end space-x-2">
          <button id="saveStoryButton" class="bg-green-200 text-white py-2 px-4 rounded">Save</button>
          <button id="cancelEditStoryButton" class="bg-gray-300 text-white py-2 px-4 rounded" onclick="document.getElementById('editStoryDialog').close()">Cancel</button>
        </div>
      </dialog>
  <table class="storyTable  w-full bg-white dark:bg-gray-700">
    <thead class="bg-gray-200 dark:bg-gray-600">
      <tr>
        <th class="border  py-2">Name</th>
        <th class="border  py-2">Description</th>
        <th class="border  py-2">Owner</th>
        <th class="border  py-2">Priority</th>
        <th class="border  py-2">Status</th>
        <th class="border  py-2">Creation Date</th>
        <th class="border  py-2">Action</th>
      </tr>
    </thead>
    <tbody>
      ${storyItems}
    </tbody>
  </table>
  
</div>`
      : renderStories(project, userManager)
  }
  `;
}