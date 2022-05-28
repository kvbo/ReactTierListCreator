import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const App = () => {
  useEffect(() => {
   document.title = 'Tierlist Creator' 
  })
  return (
    <div className="App"> 
      <List />
    </div>
  );
}

export default App;

const _Tier = (title, color, list=[]) => {
  return { title: title, color: color, id: title + color, list: list }
}

const _Image = (url=null) => {
  let  id = uuid();
  return { url: url, uuid:  id}
}

const List = () => {
  const [ editable, setEditable ] = useState(false)
  const [ collection, setCollection ] = useState([])
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

    const source = result.source;
    const destination = result.destination;

    //do nothing if the source and destination the same 
    if(source.droppableId === destination.droppableId)
      return 

    if(source.droppableId !== 'imgs'){
      let s_index =  tierList.indexOf(tierList.filter(i => i.id === source.droppableId )[0])
      let item = tierList[s_index]['list'].slice(source.index)[0]

      if(destination.droppableId !== 'imgs'){
        let d_index =  tierList.indexOf(tierList.filter(i => i.id === destination.droppableId )[0])
        
        tierList[d_index]['list'].push(item)

      }else{
        collection.push(item)
        setCollection([...collection])
      }

      tierList[s_index]['list'][source.index] = null
      tierList[s_index]['list'] = tierList[s_index]['list'].filter(i => i !== null )

      setTierList([...tierList])

    }else{
      let d_index = tierList.indexOf(tierList.filter(i => i.id === destination.droppableId )[0])
      let item = collection.slice(source.index)[0]

      tierList[d_index]['list'].push(item)
      setTierList([...tierList])

      collection[source.index] = null

      const temp = collection.filter( i => i !== null)
      setCollection([...temp])
    }
  }

  const addImage = (e) => {
    for(let i = 0; i < e.target.files.length; i++ ){
      if(!/image\//g.test(e.target.files[i].type)){
        continue;
      }

      let reader = new FileReader();
      reader.onload = (ev) => {
        collection.push(_Image(ev.target.result))
        setCollection([...collection])
      };
      reader.readAsDataURL(e.target.files[i]);
    }
  }

  const drag = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const drop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    e.target.files = e.dataTransfer.files
    addImage(e)

  }

  const saveTemplate = async () => {

    let data = {
      tierlist: tierList,
      collection: collection
    }
    const fileHandle = await window.showSaveFilePicker();
    const fileStream = await fileHandle.createWritable();

    await fileStream.write(new Blob([JSON.stringify(data)], {type: "text/plain"}));
    await fileStream.close();
  }             

  const openTemplate = (e) => {
    let reader = new FileReader();
    reader.onload = (ev) => {
      const _ = JSON.parse(ev.target.result);
      if(('collection' in _ ) && ('tierlist' in _ )){
        setCollection([..._.collection]);
        setTierList([..._.tierlist])
      }
    }
    reader.readAsText(e.target.files[0])
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
    <Droppable droppableId="imgs" 
      direction='horizontal'
      >
      {(provided) => (
      <div className="imgs flex flex-wrap" 
        onDrop={e => drop(e)} onDragOver={ e => drag(e)}
        
        {...provided.droppableProps} 
        ref={provided.innerRef} >
        {
          collection.map((i, index) => <Image index={index} {...i} key={i.uuid}/> )
        }
        {
          collection.length === 0 && <div className='empty'>drag and drop</div>
        }
        {provided.placeholder}
      </div>
      )}
    </Droppable>
  </DragDropContext>
  <div className='cntrls flex'>
    {/* <button className='btn' onClick={() => setEditable(!editable)}>
      <span class="material-symbols-outlined">
      settings
      </span>
      Edit
    </button> */}

    <label htmlFor="add-img" className='btn font-size-1'>
      <input type='file' id='add-img' accept='image/*' className="d-none" multiple onChange={e => addImage(e)} />
      <span className='material-symbols-outlined'>add</span>
      add image
    </label>
    <button id='save' onClick={ saveTemplate } className='btn mr-0'>
      <span className='material-symbols-outlined'>
        save</span>
        save
    </button>
    <label className='btn font-size-1' htmlFor='open'>
      <input type='file' hidden accept='text/*' id='open' onChange={ e => openTemplate(e) }/>
      <span className='material-symbols-outlined'>folder_open</span>
      open
    </label>
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
        <span className="material-symbols-outlined text-white pointer">
          remove
        </span>     
      </div>
      }
      <div className='title not-selectable' style={{ backgroundColor: props.color }}>{props.title}</div>
      <Droppable droppableId={props.id} direction='horizontal'>
        {(provided) => {
          return (
          <div className='dropArea flex' {...provided.droppableProps} ref={provided.innerRef}>
          {
            props.list.map((i, index) => <Image {...i} index={index} key={i.uuid} /> )
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
    <Draggable index={props.index} draggableId={props.uuid}>
      {(provided) => (
        <img src={props.url} 
        alt='' 
        className='imgc not-selectable' 
        ref={provided.innerRef}       
        {...provided.draggableProps} 
        {...provided.dragHandleProps}
        /> 
      )}
    </Draggable>
  )
}