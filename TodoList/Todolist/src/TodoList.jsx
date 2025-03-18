import TodoItem from "./TodoItem";

export default function TodoList({todos,toggleTodo,deleteTodo}) {
    return (
        <>
        {todos.length===0 && <div>No items to display</div>}

        <ul className="list">
            {todos.map((todo) => (
                <TodoItem {...todo} key={todo.id} toggleTodo={toggleTodo} deleteTodo={deleteTodo}/>
            ))}
        </ul>
        </>
    )
}