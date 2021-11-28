const Constants = {
  e: 1.602 * Math.pow(10, -19),
  fiscosity: 1,
  particleRadius: Math.pow(10, -15), //-10
  boltzman: 1.3807 * Math.pow(10, -23),
  avogadro: 6.0221 * Math.pow(10, 23),
  gas: 8.314,
  faraday: 96485,
  temperature: 20 + 273.15,
};

const Ions = [
  {
    name: 'Na+',
    charge: 1,
  },
  {
    name: 'K+',
    charge: 1,
  },
  {
    name: 'Cl-',
    charge: -1,
  }
];



let diffusionConstant = .001;
let NaKPumpSpeedConstant = .1;
let NaChangeVoltage = -.3;

function _World() {
  this.size = { // m
    width: 5 * Math.pow(10, -5),
    height: 2 * Math.pow(10, -5),
  }

  this.grid = new Grid(5, 2, this);
  this.speed = 1;
  this.FPS = 60;
  this.updates = 0;
  

  
  this.setup = async function() {
    this.update();
  }

  this.update = function() {
    let dt = 1 / World.FPS * World.speed; // s
    // for (let i = 0; i < 10; i++)
    // {
    this.updates++;
    this.grid.diffuse(dt);
    this.grid.update();
    // }
    setTimeout(() => {World.update()}, 1000 / World.FPS);
  }

  this.calcMembranePotentialAtX = function(_x) {
    return 0;
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
function Grid(_width, _height, _parent) {
  let Self = [];
  Self.width = _width;
  Self.height = _height;
  Self.tileWidth = _parent.size.width / _width; // m
  Self.tileHeight = _parent.size.height / _height;

  for (let x = 0; x < Self.width; x++)
  {
    Self[x] = [];
    for (let y = 0; y < Self.height; y++)
    {
      Self[x][y] = new GridSquare(x, y);
      Self[x][y].concentrations = [Math.random(), Math.random(), 0];


      // if (y == membraneY) 
      // {
      //   Self[x][y].type = 1;
      //   // if (x % 4 == 0) Self[x][y].type = 2;
      //   // if (x % 4 == 2) Self[x][y].type = 3;
      //   // if (x % 4 == 2) Self[x][y].type = 3;
      //   // if (Math.random() > .8) Self[x][y].type = 4;

      //   // Self[x][y].closed = true; //Math.random() > .5;
      //   if (x == 0) Self[x][y].type = 4;
      //   if (x > 10) Self[x][y].type = 3;
      //   if (x > 30) Self[x][y].type = 2;

      //   if (x == 5) 
      //   {
      //     Self[x][y].type = 3;
      //     Self[x][y].closed = false;
      //     Self[x][y].isLeakChannel = true;
      //   }
      // }
      // if (y > membraneY) 
      // {
      //   Self[x][y].isCytoplasm = true;
      // } else {
      //   // Self[x][y].Cna = .9;
      // }
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


  Self.diffuse = function(_dt) {
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
        Self[x][y].calcDiffusionDeltas(_dt);
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
  this.closed = true;
  this.isCytoplasm = false;
  this.isLeakChannel = false;
  // 0 = empty
  // 1 = cell-membrane
  // 2 = Na-channel?
  // 3 = K-channel?
  // 4 = Na/K-pump


  this.concentrations = [0, 0, 0];
  this.diffusabilityFunctions = [
    () => {
      return This.type == 0 || (This.type == 2 && !This.closed);
    },
    () => {
      return This.type == 0 || (This.type == 3 && !This.closed);
    },
    () => {
      return x != 1;
    }
  ];

  let changeOffset = Math.round(1000 * Math.random() / 10) * 10;
  const naChannelUpdateLength = 10000;
  let openedUpdateIndex = -naChannelUpdateLength;
  let refractoryUpdateIndex = -naChannelUpdateLength;
  this.update = function() {
    if (this.type == 2 && (World.updates - changeOffset) % 1000 == 0) // only updates every 1000 updates
    {
      let curVoltage = World.calcMembranePotentialAtX(this.x);
      if (openedUpdateIndex == World.updates - naChannelUpdateLength)
      {
        this.closed = true;
        refractoryUpdateIndex = World.updates;
      }

      if (curVoltage > NaChangeVoltage && this.closed && refractoryUpdateIndex < World.updates - naChannelUpdateLength)
      {
        this.closed = false;
        openedUpdateIndex = World.updates;
      } 
    }
    if (this.type == 3 && !this.isLeakChannel && (World.updates - changeOffset) % 10000 == 0) // only updates every 1000 updates
    {
      let curVoltage = World.calcMembranePotentialAtX(this.x);
      this.closed = curVoltage < NaChangeVoltage;
    };


    if (this.type != 4) return;
    let dCUnit = NaKPumpSpeedConstant;
    if (World.grid[this.x][this.y - 1].Ck < 2 * dCUnit) dCUnit = World.grid[this.x][this.y - 1].Ck / 2;
    if (World.grid[this.x][this.y + 1].Cna < 3 * dCUnit) 
    {
      let newDCUnit = World.grid[this.x][this.y + 1].Cna / 3;
      if (newDCUnit < dCUnit) dCUnit = newDCUnit;
    }


    World.grid[this.x][this.y - 1].concentrations[0] += 3 * dCUnit;
    World.grid[this.x][this.y - 1].concentrations[1] -= 2 * dCUnit;
    World.grid[this.x][this.y + 1].concentrations[0] -= 3 * dCUnit;
    World.grid[this.x][this.y + 1].concentrations[1] += 2 * dCUnit;
  }


  this.calcVoltage = function(_other) {
    let sumSelf = 0;
    for (let ionConcentration of this.concentrations) sumSelf += ionConcentration;
    
    let sumOther = 0;
    for (let ionConcentration of _other.concentrations) sumOther += ionConcentration;
    if (sumOther == 0) sumOther = .00001;

    let ionRatio = sumSelf / sumOther;
    return Constants.gas * Constants.temperature / Constants.faraday * Math.log(ionRatio);
  }

  this.calcDiffusionDeltas = function(_dt) {
    let neighbours = getNeighbours();

    let dragCoefficient = 6 * Math.PI * Constants.fiscosity * Constants.particleRadius;
    let D = Constants.boltzman * Constants.temperature / dragCoefficient;

    for (let i = 0; i < Ions.length; i++)
    {
      if (!this.diffusabilityFunctions[i]()) continue;

      for (let neighbour of neighbours)
      {
        if (!neighbour.diffusabilityFunctions[i]()) continue;

        let V = this.calcVoltage(neighbour); 
        let eField = V / World.grid.tileWidth; // l = 1
        let dC = neighbour.concentrations[i] - this.concentrations[i]; // M

        let totalFlux = Ions[i].charge * Constants.e / dragCoefficient * this.concentrations[i] * eField - D * (dC / World.grid.tileWidth);
        let dIonsMolair = totalFlux * _dt; // A = l^2 = 1
        
        this.concentrations[i]      -= dIonsMolair;
        neighbour.concentrations[i] += dIonsMolair;
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
