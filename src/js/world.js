const diffusionConstant = .5;

function _World() {
  this.grid = new Grid(50, 50);
  

  

  this.setup = async function() {
    this.update();
  }

  this.update = function() {
    this.grid.diffuse();
    setTimeout(() => {World.update()}, 10);
  }
}

const membraneY = 10;
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
      if (y == membraneY && x != 15) Self[x][y].type = 1;
      if (y > membraneY) Self[x][y].isCytoplasm = true;
    }
  } 

  Self.diffuse = function() {
    // Calculate changes
    // for (let y = 0; y < Self.height; y++)
    // {
    //   for (let x = y % 2 ? 1 : 0; x <= Self.width - 1; x += 2)
    //   {
    //     Self[x][y].calcDiffusionDeltas();
    //   }
    // } 
    for (let y = 0; y < Self.height; y++)
    {
      for (let x = 0; x < Self.width; x++)
      {
        Self[x][y].calcDiffusionDeltas();
      }
    } 
    // Apply changes
    // for (let x = 0; x < Self.width; x++)
    // {
    //   for (let y = 0; y < Self.height; y++)
    //   {
    //     Self[x][y].Cna += Self[x][y].dCna;
    //     if (Self[x][y].Cna < 0) Self[x][y].Cna = 0;
    //     Self[x][y].Ck += Self[x][y].dCk;

    //     Self[x][y].dCna = 0;  
    //     Self[x][y].dKn = 0;
    //   }
    // } 
  }

  Self.calcTotalConcentrations = function() {
    let totalCna = 0;
    let totalCk = 0;
    for (let x = 0; x < Self.width; x++)
    {
      for (let y = 0; y < Self.height; y++)
      {
        totalCna += Self[x][y].Cna;
        totalCk += Self[x][y].Ck;
      }
    }
    return {
      Cna: totalCna,
      Ck: totalCk,
    }
  }

  return Self;
}

function GridSquare(x, y) {
  const This = this;
  this.x = x;
  this.y = y;

  this.type = 0;
  this.isCytoplasm = false;
  // 0 = empty
  // 1 = cell-membrane
  // 2 = Na-channel?
  // 3 = K-channel?


  this.Cna = 0;
  this.Ck = 0;
  
  this.dCna = 0;
  this.dCk = 0;


  this.calcDiffusionDeltas = function() {
    if (this.type != 0) return;
    let neighbours = getNeighbours();
    for (let neighbour of neighbours)
    {
      if (neighbour.type != 0) continue;
      let dCna = this.Cna - neighbour.Cna;
      let dCk = this.Ck - neighbour.Ck;
      // let dCk = this.Cna - neighbour.Cna;

      let dNaIons = dCna * diffusionConstant * .5;
      let dKIons = dCk * diffusionConstant * .5;

      this.Cna      -= dNaIons;
      neighbour.Cna += dNaIons;
      this.Ck       -= dKIons;
      neighbour.Ck  += dKIons;
    }
  }



  function getNeighbours() {
    let neighbours = [];
    if (This.x > 0) neighbours.push(World.grid[This.x - 1][This.y]);
    if (This.x < World.grid.width - 1) neighbours.push(World.grid[This.x + 1][This.y]);
    if (This.y > 0) neighbours.push(World.grid[This.y][This.y - 1]);
    if (This.y < World.grid.height - 1) neighbours.push(World.grid[This.x][This.y + 1]);
    return neighbours;
  }


}
