(function(window){

  function Controller(){
    let todoArray = [], index = 0, observers = [];
    let showAll = function(){
      return todoArray;
    },

      addTodo = function(todo){
        if(todo instanceof ToDo){
          todo.index = index ++;
          todoArray.push(todo);
        }
        console.log(todoArray);
        notify();
      },

      showCompleted = function(){
        let arr = [];
        todoArray.forEach( t => (t.completed && arr.push(t)) );
        return arr;
      },

      showActive = () => {
        let arr = [];
        todoArray.forEach( t => ((!t.completed) && arr.push(t)) );
        return arr;
      },

      notify = () => {
        observers.forEach(o => o(todoArray));
      },

      addObserver = (o) => observers.push(o),

      toggleComplete = (index) => {
        todoArray[index].completed = ! todoArray[index].completed;
        notify();
      }

    ;

    return {
      toggleComplete: toggleComplete,
      addTodo: addTodo,
      showAll: showAll,
      showCompleted: showCompleted,
      showActive: showActive,
      addObserver: addObserver
    }
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

  function View(controller){

    let txtEle, todoBucket,

      updateBucket = (todoArray) => {
        todoBucket.innerText = "";
        todoArray.forEach( (t, i) => {
          let node = document.createElement("p");
          node.setAttribute("index", i);
          let textnode = document.createTextNode(t.text);
          node.addEventListener("click", (e) => {

            controller.toggleComplete(e.target.getAttribute('index'));

          });

          if(t.completed){
            node.style.setProperty("text-decoration", "line-through");
          }
          node.appendChild(textnode);
          todoBucket.appendChild(node);
        });
      };

    let o = {
      render(){
        window.view = o;
        txtEle = document.getElementById('txtTodo');
        todoBucket = document.getElementById('todoBucket');

        controller.addObserver((todo) => {
          updateBucket(todo);
        });
      },
      actions: {

        addTodo(e){
          if (e.keyCode == 13) {
            let todo = new ToDo();
            todo.text = txtEle.value;
            controller.addTodo(todo);
            txtEle.value = '';
            return false;
          }
        },

        showAll(){
          let allArray = controller.showAll();
          updateBucket(allArray);
        },

        showCompleted(){
          let completedArray = controller.showCompleted();
          updateBucket(completedArray);
        },

        showActive(){
          let activeArray = controller.showActive();
          updateBucket(activeArray);
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

  App.controller = new Controller();
  App.indexView = new View(App.controller);
  window.App = App;
  // document.addEventListener('DOMContentLoaded',  window.App.indexView.render(), false);

})(window);

