
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
    requestAnimationFrame(Drawer.draw);
  }

  function drawGridSquare(_square) {
    ctx.fillStyle = 'rgba(' + _square.Cna * 255 + ', ' + _square.Ck * 255 + ', 255, .5)';
    if (_square.type == 1) ctx.fillStyle = '#aaa';
    if (_square.type == 2) ctx.strokeStyle = '#f00';
    if (_square.type == 3) ctx.strokeStyle = '#0f0';
    if (_square.type == 4) ctx.strokeStyle = '#00f';
    if (_square.closed) ctx.fillStyle = ctx.strokeStyle;

    ctx.beginPath();
    if (_square.type <= 1)
    {
      ctx.fillRect(_square.x * squareWidth, _square.y * squareHeight, squareWidth, squareHeight);
    } else {
      ctx.rect(_square.x * squareWidth, _square.y * squareHeight, squareWidth, squareHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
