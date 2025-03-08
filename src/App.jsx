import "./style.css";
import { useState } from "react";

import NewTodoForm from "./NewTodoForm";
import TodoList from "./TodoList";

export default function App() {
  const[todos,setTodos] = useState([]);

  function addTodos(title){
    setTodos((current)=>[...current, { id:crypto.randomUUID(),title, completed: false}]);
  }

  function toggleTodo(id,completed){
    setTodos((current)=>
      current.map((todo)=>{
        if(todo.id === id)return {...todo, completed}

        return todo;
      })
    );
  }

  function deleteTodo(id){
    setTodos((current)=>current.filter((todo)=>todo.id!==id));
  }

  return (
    <>
      <NewTodoForm addTodos={addTodos}/>

      <h1 className="header">To Do List</h1>

      <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo}/>
    </>
  );
}