(function(window){


  function Store(name, initData = {}){

    var getter = function() {
      console.log(this);
      // o[prop] = value;
      return this;
    },
      setter = function(prop, value){
        console.log('set new val ', value);

        let data = JSON.parse(localStorage.getItem(name));
        data[prop] = value;
        localStorage.setItem(name, JSON.stringify(data));
        this.prop = value;
        return true;
      };

    let o = Object.create(Store.prototype), index = 0,
      init = () => {
        if (!localStorage[name]) {
          let data = initData;
          localStorage.setItem(name, JSON.stringify(data));
        } else {
          let data = JSON.parse(localStorage.getItem(name));
          for(let i in data){

            Object.defineProperty(o, i, {
              get: getter.bind(data[i]),
              set: setter.bind(data, i)
            });

            //o[i] = data[i];
            index ++;
          }
          o.length = index;
        }
      };

    // o.push = (value) => {
    //   let data = JSON.parse(localStorage.getItem(name));
    //   data[index] = value;
    //   //   o[index] = value;
    //
    //   Object.defineProperty(o, index, {
    //     get: getter.bind(data[index]),
    //     set: setter.bind(data, index)
    //   });
    //
    //   localStorage.setItem(name, JSON.stringify(data));
    //   index ++;
    //   o.length = index;
    // };

    //init();


    /*
    var arrayChangeHandler = {
      get: function(target, property) {
        console.log('getting ' + property + ' for ' + target);
        let data = JSON.parse(localStorage.getItem(name));
    //data[index] = value;
    //o[index] = value;
    // property is index in this case
        return data[property];
      },
      set: function(target, property, value, receiver) {
        console.log('setting ' + property + ' for ' + target + ' with value ' + value);
        target[property] = value;
        let data = JSON.parse(localStorage.getItem(name));
        data[index] = value;
        target[index] = value;

        index ++;
        target.length = index;
    // you have to return true to accept the changes
        return true;
      }
    }; *

    let obsi = new Proxy(o, arrayChangeHandler);
    //o.__proto__ = Array.prototype;
    */
    o.length = index;

    let oCopy = Array.prototype.slice.call(o);
    init();

    //   
    // o.forEach( (p, i) => {
    //   Object.defineProperty(o, i, {
    //     get: getter.bind(o, p)
    //   });
    //   //getter.bind(o, p);
    // });


    return o;

  }

  Store.prototype = Array.prototype;


  function ToDoModel(store = []){
    let todoArray = store,
      index = 0,

      addTodo = (todo) => {
        if(todo instanceof ToDo){
          todo.index = index ++;
          todoArray.push(todo);
        }
        console.log(todoArray);
        return todoArray;
      },

      showAll = () => {
        return todoArray;
      },
      showCompleted = () => {
        let arr = [];
        todoArray.forEach( t => (t.completed && arr.push(t)) );
        return arr;
      },

      showActive = () => {
        let arr = [];
        todoArray.forEach( t => ((!t.completed) && arr.push(t)) );
        return arr;
      },

      toggleComplete = (index) => {
        let todo = todoArray[index];
        todo.completed = !todo.completed
        todoArray[index] = todo;
        return todoArray;
      };

    return {
      toggleComplete: toggleComplete,
      addToDo: addTodo,
      showAll: showAll,
      showCompleted: showCompleted,
      showActive: showActive
    }

  }

  function Controller(view, model){
    let todoArray = [], index = 0, observers = [];

    let showAll = () => {
      return todoArray;
    }
    view.addActionHandler(new ActionHandler(model));
  }

  function ToDo(params){
    if(!(this instanceof ToDo)){
      return new Todo;
    }

    var o = Object.create(ToDo.prototype);
    o.index = 0;
    o.text = '';
    o.completed = false;

  }

  function Event(type = '', payload){

    let o = Object.create(Event.prototype);
    o.type = type;
    o.payload = payload;
    return o;
  }

  function ActionHandler(model){

    return {
      handle: (event, callback) => {
        if(!(event instanceof Event) ){
          throw new Error('Not a proper event!');
        }

        if(model[event.type]){
          callback ? callback(model[event.type](event.payload)) : model[event.type](event.payload);
        } else{
          throw new Error('No such method!');
        }
      }
    }
  }

  function View(){

    let txtEle, todoBucket,
      updateBucket = (todoArray) => {
        todoBucket.innerText = "";
        todoArray.forEach( (t, i) => {
          let node = document.createElement("p");
          node.setAttribute("index", i);
          let textnode = document.createTextNode(t.text);

          node.addEventListener("click", (e) => {
            //TODO
            //controller.toggleComplete(e.target.getAttribute('index'));
            var evt = new Event();

            evt.type = 'toggleComplete';
            evt.payload = e.target.getAttribute('index');
            handler.handle(evt, updateBucket);
          });

          if(t.completed){
            node.style.setProperty("text-decoration", "line-through");
          }

          node.appendChild(textnode);
          todoBucket.appendChild(node);
        });
      },
      handler = null;

    let o = {
      render(){
        window.view = o;
        txtEle = document.getElementById('txtTodo');
        todoBucket = document.getElementById('todoBucket');
        o.actions.showAll();

        // controller.addObserver((todo) => {
        //   updateBucket(todo);
        // });
      },

      // actionHandler: null,

      addActionHandler(actionHandler){
        handler = actionHandler;
      },

      actions: {
        addTodo(e){
          if (e.keyCode == 13) {
            let todo = new ToDo();
            let evt = new Event();
            todo.text = txtEle.value;
            evt.type = 'addToDo';
            evt.payload = todo;
            handler.handle(evt, updateBucket);
            txtEle.value = '';

            return false;
          }
        },

        showAll(){
          let evt = new Event();
          evt.type = 'showAll';
          //evt.payload = todo;
          handler.handle(evt, updateBucket);
        },

        showCompleted(){
          let evt = new Event();
          evt.type = 'showCompleted';
          handler.handle(evt, updateBucket);
        },

        showActive(){
          let evt = new Event();
          evt.type = 'showActive';
          handler.handle(evt, updateBucket);
        }
      }
    };

    return o;
  }

  View.prototype = Object.create({
    viewName:'default',
    version:'1.0'
  });

  var App = App || {};

  App.store =  new Store("vanilla-todo"); 
  App.indexView = new View();
  App.indexModel = new ToDoModel(App.store);
  App.controller = new Controller(App.indexView, App.indexModel);
  window.App = App;
  // document.addEventListener('DOMContentLoaded',  window.App.indexView.render(), false);

})(window);

