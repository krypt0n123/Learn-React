import React, {useState} from 'react';

export default function NewTodoForm({addTodos}) {
    const[newItem, setNewItem] = useState('');

    function handleSubmit(e){
        e.preventDefault();
        if(newItem==='')return;//防止用户提交空白项
    
        addTodos(newItem);
        
        setNewItem('');
      }

    return(
        <form onSubmit={handleSubmit}className="new-item-form">
            <div className="form-row">
            <label htmlFor="new-item-input">New item:</label>
            <input id="item" type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}/>
            </div>

            <button className="btn">Add</button>
        </form>
    );
}