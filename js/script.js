let inputTitle = document.querySelector("#input-title");
let inputdescription = document.querySelector("#description");
let taskList = document.querySelector(".task-list");
let sublist = document.querySelector(".subtasks");
let addSub = document.querySelector(".add-sub-task");
let filter = document.querySelectorAll(".filter li");
let closePanel = document.querySelector(".close-panel");
let overlay = document.querySelector(".overlay");
let filterMenu = document.querySelector(".filter");
let filterTag = document.querySelector(".filter-tag");

filterTag.addEventListener("click", () => {
  filterMenu.classList.toggle("d-flex");
});

filter.forEach((element) => {
  element.addEventListener("click", function () {
    filter.forEach((el) => {
      el.classList.remove("active");
    });
    element.classList.add("active");
    filterMenu.classList.toggle("d-flex");
    filterData();
  });
});
function filterData() {
  let allTasks = Array.from(taskList.querySelectorAll(".task"));
  let selected = document.querySelector(".active");
  allTasks.forEach((task) => {
    if (
      task.dataset.stat == selected.dataset.filter ||
      selected.dataset.filter == "all"
    ) {
      task.classList.remove("filtered");
    } else {
      task.classList.add("filtered");
    }
  });
}

// empty array to store tasks

let mainArray = [];
if (localStorage.getItem("Board")) {
  mainArray = JSON.parse(localStorage.getItem("Board"));
}
getData();

function addTaskToArray(taskTitle) {
  // task data
  const task = {
    id: Date.now(),
    title: taskTitle,
    description: "",
    due_date: Date.now(),
    stat: "to do",
    subtasks: "",
  };
  // push task to mainArray
  mainArray.push(task);
  // add task to page
  addTasksToPage(mainArray);
  //add to Storage
  saveData(mainArray);
}
function getSubtasks() {
  let subMap = new Map();
  Array.from(sublist.children).forEach((el) => {
    subMap.set(el.innerHTML.trimEnd(), el.className);
  });
  return subMap;
}
function addTasksToPage(dataArray) {
  taskList.innerHTML = ""; // clear todo section

  dataArray.forEach((task) => {
    let taskDiv = createComponent("div", "task", "");
    taskDiv.setAttribute("data-id", task.id);
    taskDiv.setAttribute("data-stat", task.stat);
    taskHeading(taskDiv, task);
    createInfoSection(taskDiv, task.description, task.subtasks);
    taskList.appendChild(taskDiv);
  });
  filterData();
}

function saveData(mainArray) {
  localStorage.setItem("Board", JSON.stringify(mainArray));
}
function getData() {
  let data = localStorage.getItem("Board");
  if (data) {
    let tasks = JSON.parse(data);
    addTasksToPage(tasks);
  }
}

function deleteTaskWith(taskId) {
  mainArray = mainArray.filter((task) => task.id != taskId);
  saveData(mainArray);
}

function taskHeading(div, task) {
  let head = createComponent("div", "task-heading d-flex", "");
  let title = createComponent("h3", "title", task.title);
  let taskDate = createComponent("span", "date", "");
  let dateformat = moment(task.id).format("MMM Do YYYY, HH:mm");
  console.log(moment().add(28, 'days').calendar());
  taskDate.innerHTML = `${dateformat}`;
  head.appendChild(title);
  head.appendChild(taskDate);
  head.appendChild(createComponent("i", "material-icons detail", "more_vert"));
  div.appendChild(head);
}
function taskProgress(task, progressValue) {
  let progress = createComponent("progress", "", "");
  progress.setAttribute("value", progressValue);
  progress.setAttribute("max", "100");
  progress.setAttribute("data-value", `${progressValue}%`);
  task.appendChild(progress);
}

/*** add sub task to control list */
addSub.onclick = function () {
  Array.from(sublist.children).forEach((el) => {
    if (el.innerHTML == "" && sublist.children) {
      el.remove();
    }
  });
  let li = document.createElement("li");
  sublist.appendChild(li);

  li.setAttribute("contenteditable", true);
  subTaskEvents(li, sublist);
 
  li.focus();
};

/**************** update section */
function targetSubtask(subtask) {
  let taskTargetID = subtask.parentElement.parentElement.dataset.id;
  let subtaskID = Array.from(subtask.parentElement.children).indexOf(subtask);
  mainArray.forEach((task) => {
    if (task.id == taskTargetID) {
      let sub = mainArray[mainArray.indexOf(task)].subtasks;
      let obj = Object.assign(JSON.parse(sub));
      if (subtask.className == "done") {
        obj[subtask.innerHTML] = "done";
      } else {
        obj[subtask.innerHTML] = "";
      }
      task.subtasks = JSON.stringify(obj);
    }
  });
  saveData(mainArray);
}

function createComponent(type, className, innerHTML) {
  let element = document.createElement(type);
  if (className != "") {
    element.className = `${className}`;
  }
  element.innerHTML = `${innerHTML}`;
  return element;
}

let AddNewTask = document.querySelector("#addNew");
let detailsPanel = document.querySelector(".task-details");
let detailsTitle = document.querySelector("#details-title");
let description = document.querySelector("#description");
let deleteTask = document.querySelector(".delete-task");
AddNewTask.addEventListener("keypress", (event) => {
  if (event.key == "Enter" && AddNewTask.value !== "") {
    addTaskToArray(AddNewTask.value); // add task to array
    AddNewTask.value = "";
  }
});
deleteTask.addEventListener("click", (event) => {
  let targetID = deleteTask.parentElement.dataset.id;

  let confirm = window.confirm("do you want to delete this");
  if (confirm) {
    //remove task data
    deleteTaskWith(targetID);
    //remove task ui
    overlay.classList.toggle("d-flex");
    addTasksToPage(mainArray);
  }
});

/////----------- show task details in details panel
taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("detail")) {
    let targetID = e.target.parentElement.parentElement.dataset.id;
    detailsPanel.setAttribute("data-id", targetID);
    mainArray.forEach((task) => {
      if (+targetID == task.id) {
        detailsTitle.value = task.title;
        description.value = task.description;
        taskStat.forEach((stat) => {
          stat.classList.remove("selected-stat");
          if (stat.innerHTML === task.stat) {
            stat.classList.add("selected-stat");
          }
        });
        sublist.innerHTML = "";
        if (task.subtasks != "") {
          let subData = Object.entries(JSON.parse(task.subtasks));
          subData.map((el) => {
            let li = createComponent("li", el[1], el[0]);
            subTaskEvents(li, sublist);
          });
        }
      }
    });
    overlay.classList.toggle("d-flex");
  }
});

/////----------- create info section in the task
function createInfoSection(task, parag, subtasks) {
  let info = createComponent("div", "info", "");
  let tag = createComponent(
    "span",
    "tag",
    `#${task.dataset.stat}`.replace(" ", "")
  );
  info.appendChild(tag);
  if (parag !== "") {
    let note = createComponent("i", "material-icons", "notes");
    info.appendChild(note);
  }
  if (subtasks != "" && subtasks != "{}") {
    let list = createComponent("i", "material-icons", "checklist");
    info.appendChild(list);
    let subData = Object.entries(JSON.parse(subtasks));
    let doneSize = Array.from(subData).filter((e) => {
      if (e[1] == "done") {
        return e;
      }
    });
    let progress = Math.round((doneSize.length / +subData.length) * 100);
    taskProgress(info, progress);
  }
  task.appendChild(info);
}

/////----------- change task stats
let taskStat = Array.from(
  document.querySelectorAll(".task-details .stat span")
);
taskStat.forEach((element) => {
  element.addEventListener("click", function () {
    taskStat.forEach((el) => {
      el.classList.remove("selected-stat");
    });
    element.classList.add("selected-stat");
  });
});
/////----------- close details panel add save any changes
closePanel.addEventListener("click", () => {
  if (detailsTitle.value !== "") {
    mainArray.forEach((task) => {
      if (task.id == detailsPanel.dataset.id) {
        task.title = detailsTitle.value;
        task.description = description.value;
        task.stat = document.querySelector(".selected-stat").innerHTML;
        let targetID = deleteTask.parentElement.dataset.id;
        mainArray.forEach((task) => {
          if (+targetID == task.id) {
            task.subtasks = JSON.stringify(Object.fromEntries(getSubtasks()));
          }
        });
        addTasksToPage(mainArray);
        saveData(mainArray);
      }
    });
    overlay.classList.toggle("d-flex");
  }
});
/////----------- set events for subtasks

function subTaskEvents(li, sublist) {
  // li.setAttribute("contenteditable", false);
  li.addEventListener("click", () => {
    li.classList.toggle("done");
    targetSubtask(li);
  });
  li.addEventListener("dblclick", () => {
    li.remove();
  });
  li.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
      li.blur();
      li.setAttribute("contenteditable", false);
    }
  });
  li.onblur = () => {
    li.setAttribute("contenteditable", false);
    Array.from(sublist.children).forEach((el) => {
      if (el.innerHTML == "") {
        el.remove();
      }
    });
  };
  sublist.appendChild(li);
}
