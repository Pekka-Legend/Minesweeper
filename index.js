const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 600
canvas.height = 600
const gridButton = document.getElementById("GridChange") //set button
const gridChange = document.getElementById("text") //text input

var GRID_SIZE = 16
var TILE_SIZE = canvas.width / GRID_SIZE
var firstClick = true

var tiles = []
var bombs = 0
var win = false
class Tile
{
    constructor(x, y, isBomb, color)
    {
        this.x = x
        this.y = y
        this.isBomb = isBomb
        this.color = color
        this.number
        this.active = false
        this.flagged = false
    }
    draw()
    {
        if (this.active)
        {
            if (this.color == 'forestgreen') //keeps the checkerboard pattern for the open tiles
            {
                c.fillStyle = 'tan'
                
            }
            else
            {
                c.fillStyle ="rgb(184, 159, 127)"
            }
            
            c.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, Math.ceil(TILE_SIZE), Math.ceil(TILE_SIZE))

            if (this.isBomb)//draw a bomb if this is a bomb
            {
                c.beginPath()
                c.arc(this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / Math.PI, 0, 2 * Math.PI)
                c.fillStyle = "black"
                c.fill()
                c.stroke()
            }
            else if (this.number != 0) //draw the number of bombs nearby
            {
                c.fillStyle = 'black'
                c.font = (TILE_SIZE * .5).toString() + "px Arial"
                var measure = c.measureText(this.number.toString())
                c.fillText(this.number.toString(), (this.x * TILE_SIZE + TILE_SIZE / 2) - measure.width / 2, (this.y * TILE_SIZE + TILE_SIZE / 2) - (measure.actualBoundingBoxDescent - measure.actualBoundingBoxAscent) / 2)
            }
        }
        else //draw the grass color and a flag if needed
        {
            c.fillStyle = this.color
            c.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, Math.ceil(TILE_SIZE), Math.ceil(TILE_SIZE))
            if (this.flagged)
            {
                c.beginPath()
                c.arc(this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / Math.PI, 0, 2 * Math.PI)
                c.fillStyle = "red"
                c.fill()
                c.stroke()
            }
            
        }
        
    }
    update(mousex, mousey, button)
    {
        //check if the mouse is clicking this tile
        if (mousex >= this.x * TILE_SIZE && mousex <= this.x * TILE_SIZE + TILE_SIZE && mousey >= this.y * TILE_SIZE && mousey <= this.y * TILE_SIZE + TILE_SIZE)
        {
            if (button == 0) //left click
            {
                this.active = true
                if (firstClick && this.number != 0) //ensure the first click is a blank square (generate a new level until it is blank (recursive))
                {
                    ResetGame(mousex, mousey, 0)
                }
                else if (this.isBomb)
                {
                    ResetGame()
                    firstClick = true
                }
                else
                {
                    firstClick = false
                }
                
            }
            if (button == 2) //right click
            {
                this.flagged = !this.flagged
            }
            
        }
    }
}

function createLevel()
{
    tiles = [[]]
    bombs = 0
    for(var i = 0; i < GRID_SIZE; i++)
    {
        for (var j = 0; j < GRID_SIZE; j++)
        {
            isBomb = false
            if (Math.random() * 100 <= 15.6) //make a bomb on about 15% of the tiles
            {
                isBomb = true
                bombs++
            }

            //creates the checkerboard pattern
            tiles[i].push(new Tile(j, i, isBomb, "forestgreen"))
            if (i % 2 == 0 && j % 2 == 0)
            {
                tiles[i][j].color = 'green'
            }
            else if (i % 2 == 1 && j % 2 == 1)
            {
                tiles[i][j].color = 'green'
            }
        }
        //adds a new empty list to the end of the list
        tiles.push([])
    }

    //after the tiles are generated find how many bombs border each tile
    var borderBombs = 0
    for (var i = 0; i < GRID_SIZE; i++)
    {
        for (var j = 0; j < GRID_SIZE; j++)//for all tiles check if there is a bomb in each bordering tile and if there is increment the border bombs counter
        {

            //top
            if (j > 0 && i > 0 && tiles[i - 1][j - 1].isBomb) //check bomb to the top left
            {
                borderBombs++;
            }
            if (i > 0 && tiles[i - 1][j].isBomb) //check bomb to the top center
            {
                borderBombs++;
            }
            if (j < GRID_SIZE - 1 && i > 0 && tiles[i - 1][j + 1].isBomb) //check bomb to the top right
            {
                borderBombs++;
            }

            //middle
            if (j > 0 && tiles[i][j - 1].isBomb) //check bomb to the middle left
            {
                borderBombs++;
            }
            if (j < GRID_SIZE - 1 && tiles[i][j + 1].isBomb) //check bomb to the middle right
            {
                borderBombs++;
            }

            //bottom
            if (j > 0 && i < GRID_SIZE - 1 && tiles[i + 1][j - 1].isBomb) //check bomb to the top left
            {
                borderBombs++;
            }
            if (i < GRID_SIZE - 1 && tiles[i + 1][j].isBomb) //check bomb to the top center
            {
                borderBombs++;
            }
            if (j < GRID_SIZE - 1 && i < GRID_SIZE - 1 && tiles[i + 1][j + 1].isBomb) //check bomb to the top right
            {
                borderBombs++;
            }
            

            tiles[i][j].number = borderBombs
            borderBombs = 0
        }
    
    }
}

function ZeroSpreading() //fills in bordering 0s
{
    
    var repititions = 0
    for (var i = 0; i < GRID_SIZE; i++)
    {
        for (var j = 0; j < GRID_SIZE; j++)
        {
            //top
            if (j > 0 && i > 0 && tiles[i - 1][j - 1].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the top left
            {
                repititions++
                tiles[i - 1][j - 1].active = true
            }
            if (i > 0 && tiles[i - 1][j].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the top center
            {
                repititions++
                tiles[i - 1][j].active = true
            }
            if (j < GRID_SIZE - 1 && i > 0 && tiles[i - 1][j + 1].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the top right
            {
                repititions++
                tiles[i - 1][j + 1].active = true
            }
            
            //middle
            if (j > 0 && tiles[i][j - 1].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the middle left
            {
                repititions++
                tiles[i][j - 1].active = true
            }
            if (j < GRID_SIZE - 1 && tiles[i][j + 1].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the middle right
            {
                repititions++
                tiles[i][j + 1].active = true
            }
            
            //bottom
            if (j > 0 && i < GRID_SIZE - 1 && tiles[i + 1][j - 1].active == false && tiles[i ][j].number == 0 && tiles[i][j].active) //check tile to the top left
            {
                repititions++
                tiles[i + 1][j - 1].active = true
            }
            if (i < GRID_SIZE - 1 && tiles[i + 1][j].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the top center
            {
                repititions++
                tiles[i + 1][j].active = true
            }
            if (j < GRID_SIZE - 1 && i < GRID_SIZE - 1 && tiles[i + 1][j + 1].active == false && tiles[i][j].number == 0 && tiles[i][j].active) //check tile to the top right
            {
                repititions++
                tiles[i + 1][j + 1].active = true
            }
        }
    }
    if (repititions != 0) //recursion (repeat the loop until its done filling in all bordering 0 squares)
    {
        ZeroSpreading()
    }
}

function updateTiles(x, y, button)
{
    var activeTiles = 0
    requestAnimationFrame(updateTiles)
    c.clearRect(0, 0,  canvas.width, canvas.height)

    
    for (var i = 0; i < GRID_SIZE; i++)
    {
        for (var j = 0; j < GRID_SIZE; j++)
        {
            tiles[i][j].update(x, y, button)
            tiles[i][j].draw()
            if (tiles[i][j].active == false)
            {
                activeTiles++
            }
        }
    }
    if (button == 0) //if the tile is left clicked (opened) check all tiles to see if there are any blank open ones and open all neighbors
    {
        ZeroSpreading() //automatically fills in all bordering 0s
    }
    if (activeTiles == bombs)
    {
        c.clearRect(0, 0, canvas.width, canvas.height)
        c.fillStyle = 'darkgreen'
        c.fillRect(0, 0, canvas.width, canvas.height)

        c.fillStyle = 'black'
        c.font = "80px Arial"
        var w = c.measureText("You Win!").width
        c.fillText("You Win!", canvas.width / 2 - w / 2, 200)
        win = true
    }
    
}

function ResetGame(x = 0, y = 0, button = -1)
{
    GRID_SIZE = parseInt(gridChange.value)
    TILE_SIZE = canvas.width / GRID_SIZE
    createLevel()
    updateTiles(x, y, button) //-1 for the button so it doesn't register the click at 0, 0 (same as earlier)
}
ResetGame()
gridButton.onclick = function(e)
{
    firstClick = true
    ResetGame()
}
document.onmousedown = function(e)
{
    if (e.pageX > 470) //dont register clicks unless they are inside the canvas
    {
        updateTiles(e.offsetX, e.offsetY, e.button)
    }
    if (win == true)
    {
        win = false
        firstClick = true
        ResetGame()
    }
}
