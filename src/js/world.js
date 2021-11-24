
function _World() {
  this.grid = new Grid(50, 50);
  

  

  this.setup = async function() {
    
  }



  this.draw = function() {
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    
    
  }
}

function Grid(_width, _height) {
  let Self = [];
  Self.width = _width;
  Self.height = _height;

  for (let x = 0; x < Self.width; x++)
  {
    Self[x] = [];
    for (let y = 0; y < Self.height; y++)
    {
      Self[x][y] = new GridSquare(x, y);
      if (y == 5) Self[x][y].type = 1;
    }
  } 

  return Self;
}

function GridSquare(x, y) {
  this.type = 0;
  this.isCytoplasm = false;
  // 0 = empty
  // 1 = cell-membrane
  // 2 = Na-channel?
  // 3 = K-channel?


  this.Cna = 0;
  this.Ck = 0;
}
