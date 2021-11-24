let diffusionConstant = .1;
let NaKPumpSpeedConstant = .01;

function _World() {
  this.grid = new Grid(50, 20);
  

  

  this.setup = async function() {
    this.update();
  }

  this.update = function() {
    this.grid.diffuse();
    this.grid.update();
    setTimeout(() => {World.update()}, 10);
  }

  this.calcMembranePotentialAtX = function(_x) {
    let chargeCytoplasm = this.grid[_x][membraneY + 1].Cna + this.grid[_x][membraneY + 1].Ck;
    let chargeExtracellular = this.grid[_x][membraneY - 1].Cna + this.grid[_x][membraneY - 1].Ck;

    return chargeCytoplasm - chargeExtracellular;
  }
  this.calcMembranePotential = function() {
    let totalDpot = 0;
    for (let x = 0; x < this.grid.width; x++) totalDpot += this.calcMembranePotentialAtX(x);
    return totalDpot / this.grid.width;
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
      Self[x][y].Cna = .5;
      Self[x][y].Ck = .5;


      if (y == membraneY) 
      {
        Self[x][y].type = 1;
        // if (x % 4 == 0) Self[x][y].type = 2;
        // if (x % 4 == 2) Self[x][y].type = 3;
        // if (x % 4 == 2) Self[x][y].type = 3;
        // if (Math.random() > .8) Self[x][y].type = 4;

        // Self[x][y].closed = true; //Math.random() > .5;
        if (x == 0) Self[x][y].type = 4;
        if (x == 15) Self[x][y].type = 2;
        if (x == 16) Self[x][y].type = 3;

      }
      if (y > membraneY) Self[x][y].isCytoplasm = true;
    }
  } 


  Self.update = function() {
    for (let y = 0; y < Self.height; y++)
    {
      for (let x = 0; x < Self.width; x++)
      {
        Self[x][y].update();
      }
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
  this.closed = false;
  this.isCytoplasm = false;
  // 0 = empty
  // 1 = cell-membrane
  // 2 = Na-channel?
  // 3 = K-channel?
  // 4 = Na/K-pump



  this.Cna = 0;
  this.Ck = 0;
  
  this.dCna = 0;
  this.dCk = 0;

  this.NaDiffusable = function() {
    return this.type == 0 || (this.type == 2 && !this.closed);
  }
  this.KDiffusable = function() {
    return this.type == 0 || (this.type == 3 && !this.closed);
  }

  this.update = function() {
    if (this.type != 4) return;
    let dCUnit = NaKPumpSpeedConstant;
    if (World.grid[this.x][this.y - 1].Ck < 2 * dCUnit) dCUnit = World.grid[this.x][this.y - 1].Ck / 2;
    if (World.grid[this.x][this.y + 1].Cna < 3 * dCUnit) 
    {
      let newDCUnit = World.grid[this.x][this.y + 1].Ck / 3;
      if (newDCUnit < dCUnit) dCUnit = newDCUnit;
    }


    World.grid[this.x][this.y - 1].Cna  += 3 * dCUnit;
    World.grid[this.x][this.y - 1].Ck   -= 2 * dCUnit;
    World.grid[this.x][this.y + 1].Cna  -= 3 * dCUnit;
    World.grid[this.x][this.y + 1].Ck   += 2 * dCUnit;
  }


  this.calcDiffusionDeltas = function() {
    let neighbours = getNeighbours();
    if (This.NaDiffusable()) 
    {
      for (let neighbour of neighbours)
      {
        if (!neighbour.NaDiffusable()) continue;
        let dCna = this.Cna - neighbour.Cna;
        let dIons = dCna * diffusionConstant * .5;

        this.Cna      -= dIons;
        neighbour.Cna += dIons;
      }
    }
    if (This.KDiffusable()) 
    {
      for (let neighbour of neighbours)
      {
        if (!neighbour.KDiffusable()) continue;
        let dCk = this.Ck - neighbour.Ck;
        let dIons = dCk * diffusionConstant * .5;
        
        this.Ck      -= dIons;
        neighbour.Ck += dIons;
      }
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
