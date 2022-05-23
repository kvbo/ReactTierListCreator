import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const App = () => {
  return (
    <div className="App"> 
      <List />
    </div>
  );
}

export default App;

const _Tier = (title, color) => {
  return { title: title, color: color, id: title + color, list: [] }
}

const _Images = (url=null) => {
  let  id = uuid();
  return { url: url, uuid:  id}
}

const List = () => {
  const [ editable, setEditable ] = useState(false)
  
  const [ collection, setCollection ] = useState([_Images(), _Images(), _Images()])

  const [ tierList, setTierList ] = useState([
    _Tier('S', '#ff6666'),
    _Tier('A', '#ffbb99'),
    _Tier('B', '#ffff88'),
    _Tier('C', '#88ff88'),
    _Tier('D', '#88ccff'),
    // _Tier('E', '#bbccff'),
    // _Tier('F', '#ff88ff'),
  ])

  const onDragEnd = (result) => {
    if(result.type === null)
      return

    const source = result.destination.source;
    const destination = result.destination.destination;

    if(destination.droppableId !== 'imgs'){
      let s =  tierList.indexOf(tierList.filter(i => i.id === destination.droppableId )[0])
      tierList[s].list.push()
    }
    if(source.draggableId === destination.draggableId){

    }


  }

  return(
  <>
  <DragDropContext onDragEnd={e => onDragEnd(e) }>
  <div className='main'>
    {
      tierList.map((i, index) => (
        <Tier 
          key={i.id} 
          index={index} 
          {...i} 
          setTierList={setTierList} 
          editable={editable}/>
      ))
    }
    </div>
    <Droppable droppableId="imgs" >
      {(provided) => (
      <div className="imgs flex" {...provided.droppableProps} ref={provided.innerRef} >
        {
          collection.map((i, index) => <Image index={index} {...i} key={i.uuid}/> )
        }
        {provided.placeholder}
      </div>
      )}
    </Droppable>
  </DragDropContext>
  <div className='cntrls flex'>
    <button onClick={() => setEditable(!editable)}>Edit</button>
  </div>
  </>
)}

const Tier = (props) => {
  const colorPick = (e) => {
    props.setTierList( prev => {
      prev[props.index].color = e.target.value;
      return [ ...prev ]
    })
  }
  return(
    <div className='tier'>
      {
        props.editable &&
      <div className='flex flex-col justify-between'>
        <input type="color" onInput={ e => colorPick(e)} value={props.color}/>
        <span className="material-symbols-outlined text-white pointer">
          text_fields
        </span>
        <span class="material-symbols-outlined text-white pointer">
          remove
        </span>     
      </div>
      }
      <div className='title' style={{ backgroundColor: props.color }}>{props.title}</div>
      <Droppable droppableId={props.id} >
        {(provided) => {
          return (
          <div className='dropArea' {...provided.droppableProps} ref={provided.innerRef}>
          {
            props.list.map((i, index) => <Image {...i} index={index} /> )
          }
          {provided.placeholder}
          </div>
          )}  
        }        
      </Droppable>
    </div>
  )
}

const Image = (props) => {

  return(
    <Draggable   index={props.index} draggableId={props.uuid}>
      {(provided) => (
        <div className='imgc' ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}> 
          {props.index}
        </div>
      )}
    </Draggable>
  )
}