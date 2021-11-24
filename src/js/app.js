



var App = new _App();
const Drawer = new _Drawer();
const World = new _World();


function _App() {
  this.setup = async function() {
    Drawer.setup();
    World.setup();
  }



  this.update = async function() {
   
  }
}


window.onload = async function() {
  console.warn("Start loading..."); 
  await App.setup();
  console.warn("App loaded!");
}