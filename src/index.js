const TODOFORMHTML=`<form class="todoForm">
      <button type="button" class="closeButton">Close</button>
      <br>
      <label for="todoName">Name</label>
      <input id="todoName">
      <br>
      <label for="description">Description</label>
      <input id="description">
      <br>
      <label for="dueDate">Due Date</label>
      <input id="dueDate" type="date">
      <br>
      <label for="priority">Priority</label>
      <input id="priority" type="number">
      <br>
      <label for="notes">Notes</label>
      <textarea id="notes"></textarea>
      <br>
      <ul class="checklist"></ul>
      <label for="task">Task</label>
      <input id="task"><input type="checkbox" id="taskCheckbox">
      <button class="taskButton" type="button">Add Task</button>
      <br>
      <button class="todoButton" type="button">Create Todo</button>
    </form>`

class Task{
  constructor(name,done){
    this.name=name;
    this.done=done;
  }
}

class Todo{
  constructor(name,description,dueDate,priority,notes,tasks){
    this.name=name;
    this.description=description;
    this.dueDate=dueDate;
    this.priority=priority;
    this.notes=notes;
    this.tasks=tasks;
  }
}
class Project{
  constructor(name){
    this.name=name;
    this.todos=[] ;
  }
  addTodo(todo){
    this.todos.push(todo)
  }
  getTodo(name){
    for(let todo of this.todos){
      if(todo.name==name){
        return todo;
      }
    }
    return null;
  }
  deleteTodo(todo){
    for(let i=0;i<this.todos.length;i++){
      if(this.todos[i]==todo){
        this.todos.splice(i,1)
        return
      }
    }
  }
}
class ProjectManager{
  constructor(){
    this.projects=[];
    this.loadProjects();
    this.currentProject=null;
  }
  getProject(name){
    for(let project of this.projects){
      if(project.name==name){
        return project;
      }
    }
    return null
  }
  addProject(name){
    this.projects.push(new Project(name));
    this.saveProjects()
  }
  changeProject(name){
    this.currentProject=this.getProject(name)
  }
  deleteProject(){
    for(let i=0;i<this.projects.length;i++){
      if(this.projects[i]==this.currentProject){
        this.projects.splice(i,1)
        this.currentProject=null;
        return
      }
    }
  }
  addTodo(name,description,dueDate,priority,notes,tasks){
    this.currentProject.addTodo(new Todo(name,description,dueDate,priority,notes,tasks))
    this.saveProjects()
  }
  changeTodo(oldName,name,description,dueDate,priority,notes,tasks){
    let todo=this.currentProject.getTodo(oldName)
    todo.name=name;
    todo.description=description;
    todo.dueDate=dueDate;
    todo.priority=priority;
    todo.notes=notes;
    todo.tasks=tasks;
    this.saveProjects()
  }
  deleteTodo(todo){
    this.currentProject.deleteTodo(todo)
    this.saveProjects()
  }
  saveProjects(){
    localStorage.setItem("projects",JSON.stringify(this.projects))
  }
  loadProjects(){
    let stringProjects=JSON.parse(localStorage.getItem("projects"))
    if (!stringProjects){
      return;
    }
    for(let stringProject of stringProjects){
      let project= new Project(stringProject["name"])
      for(let todo of stringProject["todos"]){
        let taskManager=new TaskManager();
        for(let task of todo.tasks){
          taskManager.addTask(task.name,task.done)
        }
        todo=new Todo(todo.name,todo.description,todo.dueDate,todo.priority,todo.notes,taskManager.tasks)
        project.addTodo(todo);
      }
      this.projects.push(project);
    }
  }
}
class TaskManager{
  constructor(){
    this.tasks=[];
  }
  addTask(name,done){
    this.tasks.push(new Task(name,done));
  }
  toggleDone(index){
    this.tasks[index].done=!this.tasks[index].done
  }
}
class CreateTodoManager{
  constructor(projectManager,domManager){
    this.createTodo=document.querySelector(".createTodo");
    this.resetForm();

    this.todoForm=document.querySelector(".todoForm")
    this.closeButton=document.querySelector(".closeButton");
    this.todoName=document.querySelector("#todoName");
    this.description=document.querySelector("#description");
    this.dueDate=document.querySelector("#dueDate");
    this.priority=document.querySelector("#priority");
    this.notes=document.querySelector("#notes");
    this.checklist=document.querySelector(".checklist");
    this.task=document.querySelector("#task");
    this.taskCheckbox=document.querySelector("#taskCheckbox");
    this.taskButton=document.querySelector(".taskButton");
    this.todoButton=document.querySelector(".todoButton");
    this.setupEventListeners()

    this.taskManager=new TaskManager()
    this.projectManager=projectManager
    this.domManager=domManager
  }
  setupEventListeners(){
    this.closeButton.addEventListener("click",()=>{
      this.closeForm();
    })
    this.taskButton.addEventListener("click",()=>{
      this.taskManager.addTask(this.task.value,this.taskCheckbox.checked);
      this.task.value="";
      this.taskCheckbox.checked=false;
      this.updateTaskDisplay();
    })
    this.todoButton.addEventListener("click",()=>{
      this.projectManager.addTodo(todoName.value,description.value,dueDate.value,priority.value,notes.value,this.taskManager.tasks);
      this.closeForm();
      this.domManager.updateTodoListDisplay()
    })
  }
  initialize(todo){
    todoName.value=todo.name;
    description.value=todo.description;
    dueDate.value=todo.dueDate;
    priority.value=todo.priority;
    notes.value=todo.notes;
    this.taskManager.tasks=todo.tasks;
    this.updateTaskDisplay()
    let saveButton=this.todoButton.cloneNode(true);
    this.todoButton.remove();
    saveButton.textContent="Save Changes";
    saveButton.addEventListener("click",()=>{
      this.projectManager.changeTodo(todo.name,todoName.value,description.value,dueDate.value,priority.value,notes.value,this.taskManager.tasks);
      this.closeForm();
      this.domManager.updateTodoListDisplay()
    })
    this.todoForm.appendChild(saveButton);

  }
  openForm(){
    if(this.projectManager.currentProject!=null){
      this.createTodo.showModal();
    }
    else{
      alert("select project")
    }
  }
  closeForm(){
    this.createTodo.close();
  }
  resetForm(){
    this.createTodo.innerHTML=TODOFORMHTML;
  }
  toggleTask(e){
    let checkbox=e.target;
    this.taskManager.toggleDone(checkbox.getAttribute("data-id"));
  }
  updateTaskDisplay(){
    this.checklist.innerHTML=""
    let index=0;
    for(let task of this.taskManager.tasks){
      let li=document.createElement("li");
      li.textContent=task.name;
      let checkbox=document.createElement("input")
      checkbox.type="checkbox"
      checkbox.checked=task.done
      checkbox.setAttribute("data-id",index);
      checkbox.addEventListener("change",(e)=>{
        this.toggleTask(e)
      })
      li.appendChild(checkbox)
      this.checklist.appendChild(li)
      index++;
    }
  }

}
class DomManager{
  constructor(){
    this.projectSelect=document.querySelector("#projectSelect");
    this.projectSelectButton=document.querySelector(".projectSelectButton");
    this.setupProjectSelect()

    this.projectForm=document.querySelector(".projectForm");
    this.projectName=document.querySelector("#projectName");
    this.projectButton=document.querySelector(".projectButton");
    this.setupProjectForm()

    this.createTodoButton=document.querySelector(".createTodoButton");
    this.setupCreateTodo()

    this.deleteProjectButton=document.querySelector(".deleteProjectButton");
    this.setupDeleteProjectButton()
    
    this.todoList=document.querySelector(".todoList")

    this.projectManager=new ProjectManager()
    this.createTodoManager=new CreateTodoManager(this.projectManager,this);
    this.updateProjectDisplay()
    this.updateTodoListDisplay()
  }
  setupProjectSelect(){
    this.projectSelectButton.addEventListener("click",()=>{
      this.projectManager.changeProject(this.projectSelect.value);
      this.updateTodoListDisplay();
     })
  }
  setupProjectForm(){
    this.projectButton.addEventListener("click",()=>{
      this.projectManager.addProject(this.projectName.value);
      this.projectName.value=""
      this.updateProjectDisplay();
      this.updateTodoListDisplay();
    })
  }
  setupCreateTodo(){
    this.createTodoButton.addEventListener("click",()=>{
      this.createTodoManager=new CreateTodoManager(this.projectManager,this);
      this.createTodoManager.openForm();
    })
  }
  setupDeleteProjectButton(){
    this.deleteProjectButton.addEventListener("click",()=>{
      this.projectManager.deleteProject()
      this.updateProjectDisplay()
      this.updateTodoListDisplay()
    })
  }
  
  updateProjectDisplay(){
    this.projectSelect.innerHTML="";
    this.projectManager.projects.forEach((project)=>{
      let option=document.createElement("option");
      option.textContent=project.name
      this.projectSelect.appendChild(option);
    })
  }
  updateTodoListDisplay(){
    this.todoList.innerHTML="";
    if(this.projectManager.currentProject!=null){
      this.projectManager.currentProject.todos.forEach((todo)=>{
        let li=document.createElement("li");
        li.textContent=`${todo.name}    ${todo.dueDate}`
        let editButton=document.createElement("button");
        editButton.textContent="Edit"
        editButton.type="button"
        editButton.addEventListener("click",()=>{
          this.createTodoManager=new CreateTodoManager(this.projectManager,this);
          this.createTodoManager.initialize(todo);
          this.createTodoManager.openForm();
        })
        li.appendChild(editButton)

        let deletebutton=document.createElement("button");
        deletebutton.textContent="Delete"
        deletebutton.type="button"
        deletebutton.addEventListener("click",()=>{
          this.projectManager.deleteTodo(todo)
          this.updateTodoListDisplay()
        })
        li.appendChild(deletebutton)
        this.todoList.appendChild(li);
      })
    }
    else{
      let li=document.createElement("li");
        li.textContent="No Project Selected"
        this.todoList.appendChild(li);
    }
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  domManager=new DomManager()
})