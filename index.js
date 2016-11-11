(function(window){

  /**Store wrapper object for localstorage */
  function Store(name){
    this._name = name;

    let init = () => {
      if (!localStorage[this._name]) {
        let data = [];
        localStorage.setItem(this._name, JSON.stringify(data));
      } else {
        let data = JSON.parse(localStorage.getItem(this._name));
      }
    };

    init();
  }

  Store.prototype.findAll = function(callback){
    let data = JSON.parse(localStorage.getItem(this._name));
    callback(data);
  };


  Store.prototype.findByIndex = function(index, callback){
    let data = JSON.parse(localStorage.getItem(this._name));
    data.forEach((t) => {
      if(t.index == index){
        callback(t);
        return;
      }
    });
  };

  Store.prototype.persist = function(todo, callback){
    let data = JSON.parse(localStorage.getItem(this._name));
    for(let i = 0; i < data.length; i++){
      if(data[i].index == todo.index){
        data[i] = todo;
        localStorage.setItem(this._name, JSON.stringify(data));
        callback && callback(data);
        return;
      }
    }

    todo.index = new Date().getTime();
    data.push(todo);
    localStorage.setItem(this._name, JSON.stringify(data));
    callback(data);
  };

  Store.prototype.remove = function(index, callback){
    let data = JSON.parse(localStorage.getItem(this._name));
    for(let i = 0; i < data.length; i++){
      if(data[i].index == index){
        data.splice(i, 1);
        localStorage.setItem(this._name, JSON.stringify(data));
        callback(data);
      }
    }
  };

  //End of Store

  /** TodoModel to manipulate store for todos*/
  function TodoModel(store){
    this._store = store;
  };

  TodoModel.prototype.showAll = function( callback ){
    this._store.findAll(function(data){callback(data)});
  };

  TodoModel.prototype.showCompleted = function( callback ){
    let data, completed = [];
    this._store.findAll( d =>  data = d );
    data.forEach( todo => {
      todo.completed && completed.push(todo);
    });
    callback(completed);
  };

  TodoModel.prototype.showActive = function( callback ){
    let data, active = [];
    this._store.findAll( d =>  data = d );
    data.forEach( todo => {
      (!todo.completed) && active.push(todo);
    });
    callback(active);
  };

  TodoModel.prototype.deleteTodo = function(todo, callback){
    this._store.remove(todo, callback);
  };

  TodoModel.prototype.addTodo = function( todo, callback ){
    this._store.persist(todo, callback);
  };

  TodoModel.prototype.toggleCompleted = function(index, callback){
    var _this = this;
    this._store.findByIndex(index, function(todo){
      if(todo){
        todo.completed = !todo.completed;
        _this._store.persist(todo, callback);
      }
    });
  };


  function ToDo(index = 0, text = '', completed = false){
    // strictly object only
    if(!(this instanceof ToDo)){
      return new Todo;
    }
    this.index = index;
    this.text = text;
    this.completed = completed;
  }

  function View(idTxtField, idShowAll, idShowCompleted, idShowActive, idTodoBucket, model){
    var _this = this;

    this._eleTxtField = document.getElementById( idTxtField );
    this._eleBtnShowAll = document.getElementById( idShowAll );
    this._eleBtnShowCompleted = document.getElementById( idShowCompleted );
    this._eleBtnShowActive = document.getElementById( idShowActive );
    this._eleUlTodoBucket = document.getElementById( idTodoBucket );
    this._model = model;

    this._eleTxtField.addEventListener("keypress", (e) => {
      if (e.keyCode == 13) {
        let todo = new ToDo();
        todo.text = _this._eleTxtField.value;
        _this._model.addTodo(todo, function(data){
          _this.updateBucket(data);
        });
        _this._eleTxtField.value = '';
        return false;
      }
    });

    this._eleBtnShowCompleted.addEventListener("click", (e) => {
      let _this = this;
      this._model.showCompleted(function(data){
        _this.updateBucket(data);
      });
    });

    this._eleBtnShowAll.addEventListener("click", (e) => {
      let _this = this;
      this._model.showAll(function(data){
        _this.updateBucket(data);
      });
    });

    this._eleBtnShowActive.addEventListener("click", (e) => {
      let _this = this;
      this._model.showActive(function(data){
        _this.updateBucket(data);
      });
    });
  }

  View.prototype.render = function(){
    this.showAll();
  };

  View.prototype.updateBucket = function (data){
    var _this = this;
    let todoBucket = this._eleUlTodoBucket;
    todoBucket.innerHTML = "";

    data.forEach((t) => {
      let node = document.createElement("li");
      node.setAttribute("index", t.index);
      node.innerText = t.text;

      node.addEventListener("click" , (e) => {
        _this._model.toggleCompleted(e.target.getAttribute('index'));
        this._model.showAll(function(data){
          _this.updateBucket(data);
        });
      });

      node.addEventListener("dblclick", (e) => {
        _this._model.deleteTodo(e.target.getAttribute('index'), 
          function(data){
            _this.updateBucket(data);
          });
      });

      if(t.completed){
        node.style.setProperty( "text-decoration", "line-through" );
      }
      todoBucket.appendChild(node);
    });
  };

  View.prototype.addTodo = function(){
    let todo = new ToDo();
    todo.text = this._eleTxtField.value;
    this._model.addTodo(todo, this.updateBucket);
    this._eleTxtField.value = '';
  };

  View.prototype.deleteTodo = function(index){
    this._model.deleteTodo(index, this.updateBucket);
  };

  View.prototype.showAll = function(){
    let _this = this;
    this._model.showAll(function(data){
      _this.updateBucket(data);
    });
  };

  View.prototype.showCompleted = function(){
    let _this = this;
    this._model.showCompleted(function(data){
      _this.updateBucket(data);
    });
  }

  var App = App || {};

  App.Store = Store;
  App.TodoModel = TodoModel;
  App.View = View;

  window.App = App;

})(window);

(function(scope){
  var App = scope.App;
  function init() {
    let store = new App.Store('vanilla-todo'),
      indexModel = new App.TodoModel(store),
    indexView = new App.View( 'txt-todo', 'view-all', 'view-completed',
      'view-active', 'todo-bucket', indexModel );
    console.info('initializing app...');

    indexView.render();
    scope.indexView = indexView;
    scope.indexModel = indexModel;
  }

  window.addEventListener('load', init);
})(window);
