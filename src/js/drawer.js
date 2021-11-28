
function _Drawer() {
  const Canvas = simCanvas;
  const ctx = Canvas.getContext('2d');

  
  let squareWidth = 0;
  let squareHeight = 0;
  this.setup = async function() {
    squareWidth = Canvas.width / World.grid.width;
    squareHeight = Canvas.height / World.grid.height;
    this.draw();
  }



  this.draw = function() {
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);

    for (let x = 0; x < World.grid.width; x++)
    {
      for (let y = 0; y < World.grid.height; y++)
      {
        drawGridSquare(World.grid[x][y]);
      }
    }

    ctx.fillStyle = '#fff';
    ctx.font = '20px serif';
    ctx.fillText(World.calcMembranePotential() + 'V', 10, 20);
    ctx.fill();

    requestAnimationFrame(Drawer.draw);
  }

  function drawGridSquare(_square) {
    ctx.fillStyle = 'rgba(' + _square.concentrations[0] * 255 + ', ' + _square.concentrations[1] * 255 + ', ' + _square.concentrations[2] * 255 + ', .5)';
    if (_square.type == 1) ctx.fillStyle = '#aaa';
    if (_square.type == 2) ctx.strokeStyle = '#f00';
    if (_square.type == 3) ctx.strokeStyle = '#0f0';
    if (_square.type == 4) ctx.strokeStyle = '#00f';

    ctx.beginPath();
    if (_square.type <= 1)
    {
      ctx.fillRect(_square.x * squareWidth, _square.y * squareHeight, squareWidth, squareHeight);
      ctx.fillText(
        Math.round(_square.concentrations[0] * 100) / 100, 
        _square.x * squareWidth, 
        _square.y * squareHeight + squareHeight * .5
      );
      ctx.fillText(
        Math.round(_square.calcVoltage({concentrations: [1, 1, 1]}) * 1000) / 1000 + 'V', 
        _square.x * squareWidth, 
        _square.y * squareHeight + squareHeight * .75
      );

      
    } else {
      if (_square.closed) ctx.fillStyle = ctx.strokeStyle;
      ctx.rect(_square.x * squareWidth, _square.y * squareHeight, squareWidth, squareHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
