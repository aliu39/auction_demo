import React from "react";

/* HELPERS: CREDIT TO */
/* http://matt.might.net/articles/rendering-mathematical-functions-in-javascript-with-canvas-html/ */

/* EDITS TO HELPERS: 
    -added Shade function to shade in appropriate areas of graph for visualization
    -added DrawPayment + integral / derivative functions to calculate Myerson's
     payment formula
    -added label axes and axes resizing for clarity
    -changed Min/Max X/Y to global vars rather than functions
    -Canvas set by forms, with React refs to rendered Canvas element(s)
*/

/* Canvas and context objects */

var Canvas;
var Ctx;

var Width;
var Height;

// Returns the right boundary of the logical viewport:
var MaxX = 10;

// Returns the left boundary of the logical viewport:
var MinX = 0;

// Returns the top boundary of the logical viewport:
var MaxY = 10;

// Returns the bottom boundary of the logical viewport:
var MinY = 0;

// Returns the physical x-coordinate of a logical x-coordinate:
function XC(x) {
  return ((x - MinX) / (MaxX - MinX)) * Width;
}

// Returns the physical y-coordinate of a logical y-coordinate:
function YC(y) {
  return Height - ((y - MinY) / (MaxY - MinY)) * Height;
}

/* Rendering functions */

// Clears the canvas, draws the axes.
function Draw(F, v, i) {
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext("2d");
    Ctx.clearRect(0, 0, Width, Height);

    // Adjust MaxY
    MaxY = F(MaxX);

    // Draw:
    DrawAxes();
    RenderFunction(F);
    Shade(F, v, i);
    LabelAxes();
  } else {
    console.log("ERROR NO CONTEXT");
    // Do nothing.
  }
}

// Returns the distance between ticks on the X axis:
function XTickDelta() {
  return 1;
}

// Returns the distance between ticks on the Y axis:
function YTickDelta() {
  return 1;
}

// DrawAxes draws the X ad Y axes, with tick marks.
function DrawAxes() {
  Ctx.save();
  Ctx.lineWidth = 2;
  // +Y axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(0), YC(MaxY));
  Ctx.stroke();

  // -Y axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(0), YC(MinY));
  Ctx.stroke();

  // Y axis tick marks
  var delta = YTickDelta();
  for (var i = 1; i * delta < MaxY; ++i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(0) - 5, YC(i * delta));
    Ctx.lineTo(XC(0) + 5, YC(i * delta));
    Ctx.stroke();
  }

  var delta = YTickDelta();
  for (var i = 1; i * delta > MinY; --i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(0) - 5, YC(i * delta));
    Ctx.lineTo(XC(0) + 5, YC(i * delta));
    Ctx.stroke();
  }

  // +X axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(MaxX), YC(0));
  Ctx.stroke();

  // -X axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(MinX), YC(0));
  Ctx.stroke();

  // X tick marks
  var delta = XTickDelta();
  for (var i = 1; i * delta < MaxX; ++i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(i * delta), YC(0) - 5);
    Ctx.lineTo(XC(i * delta), YC(0) + 5);
    Ctx.stroke();
  }

  var delta = XTickDelta();
  for (var i = 1; i * delta > MinX; --i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(i * delta), YC(0) - 5);
    Ctx.lineTo(XC(i * delta), YC(0) + 5);
    Ctx.stroke();
  }
  Ctx.restore();
}

function LabelAxes() {
  Ctx.font = "15px Arial";
  Ctx.fillStyle = "black";
  Ctx.textAlign = "start";
  Ctx.fillText(Math.floor(MaxY).toString(), XC(0) + 5, YC(MaxY) + 12);
  Ctx.textAlign = "center";
  Ctx.fillText(Math.floor(MaxX).toString(), XC(MaxX) - 10, YC(0) - 5);
}

// RenderFunction(f) renders the input funtion f on the canvas.
function RenderFunction(f) {
  // When rendering, XSTEP determines the horizontal distance between points:
  var XSTEP = (MaxX - MinX) / Width;

  var first = true;

  Ctx.beginPath();
  var y = 0;
  for (var x = MinX; x <= MaxX; x += XSTEP) {
    y = f(x);
    if (first) {
      Ctx.moveTo(XC(x), YC(y));
      first = false;
    } else {
      Ctx.lineTo(XC(x), YC(y));
    }
  }
  Ctx.stroke();
}

function Shade(f, v, i) {
  var row = Math.floor(i / 3);
  var col = i % 3;

  var b = 0;
  if (col == 0) {
    b = v;
  } else if (col == 1) {
    b = v + (MaxX - v) / 2;
  } else {
    b = v / 2;
  }

  if (row == 0) {
    // social surplus: v * x(b)
    var y = f(b);
    Ctx.beginPath();
    Ctx.moveTo(XC(0), YC(0));
    Ctx.lineTo(XC(v), YC(0));
    Ctx.lineTo(XC(v), YC(y));
    Ctx.lineTo(XC(0), YC(y));
    Ctx.lineTo(XC(0), YC(0));
    Ctx.fillStyle = "blue";
  } else if (row == 1) {
    // p(v) = area above curve, from 0 to b
    var XSTEP = (MaxX - MinX) / Width;
    var first = true;
    Ctx.beginPath();
    var y = 0;
    for (var x = MinX; x <= b; x += XSTEP) {
      y = f(x);
      if (first) {
        Ctx.moveTo(XC(x), YC(y));
        first = false;
      } else {
        Ctx.lineTo(XC(x), YC(y));
      }
    }
    Ctx.lineTo(XC(0), YC(y));
    Ctx.lineTo(XC(0), YC(0));
    Ctx.fillStyle = "red";
  } else {
    // utility = ss - p
    var limit = Math.min(b, v);

    // part of utility is area under curve up to min(b, v)
    var XSTEP = (MaxX - MinX) / Width;
    var first = true;
    Ctx.beginPath();
    var y = 0;
    for (var x = MinX; x <= limit; x += XSTEP) {
      y = f(x);
      if (first) {
        Ctx.moveTo(XC(x), YC(y));
        first = false;
      } else {
        Ctx.lineTo(XC(x), YC(y));
      }
    }
    Ctx.lineTo(XC(x), YC(0));
    Ctx.lineTo(XC(0), YC(0));
    Ctx.fillStyle = "green";
    Ctx.globalCompositeOperation = "destination-over";
    Ctx.fill();

    if (b < v) {
      Ctx.beginPath();
      Ctx.moveTo(XC(x), YC(0));
      Ctx.lineTo(XC(x), YC(y));
      Ctx.lineTo(XC(v), YC(y));
      Ctx.lineTo(XC(v), YC(0));
      Ctx.moveTo(XC(x), YC(0));
    } else if (b > v) {
      Ctx.beginPath();
      Ctx.moveTo(XC(x), YC(y));
      for (var x = x + XSTEP; x <= b; x += XSTEP) {
        y = f(x);
        Ctx.lineTo(XC(x), YC(y));
      }
      Ctx.lineTo(XC(v), YC(y));
      Ctx.lineTo(XC(v), YC(f(v)));
      Ctx.fillStyle = "red";
    }
  }
  Ctx.globalCompositeOperation = "destination-over";
  Ctx.fill();
}

function derivative(x) {
  return b => {
    var dz = (MaxX - MinX) / (Width * Width);
    if (b == 0) return 0;
    else return x(b) - x(b - dz);
  };
}

function P(x) {
  return b => {
    //computes integral as a discrete sum with small dz value
    var dz = (MaxX - MinX) / (Width * Width);
    var sum = 0;
    var dxdz = derivative(x);
    for (var z = 0; z <= b; z += dz) {
      sum += z * dxdz(z);
    }
    return sum;
  };
}

function DrawPayment(x) {
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext("2d");
    Ctx.clearRect(0, 0, Width, Height);

    // Get payment function from x
    var F = P(x);

    // Adjust MaxY
    MaxY = F(MaxX);

    // Draw:
    DrawAxes();
    RenderFunction(F);
    LabelAxes();
  } else {
    console.log("ERROR NO CONTEXT");
    // Do nothing.
  }
}

export default class Myerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      v: MaxX / 2, //valuation
      formValue: (MaxX / 2).toString(), //for text input 1
      maxX: "10", //for text input 2
      maxXval: 10 //copy of MaxX for React state use
    };
  }

  //store canvas refs after component first mounted
  componentDidMount() {
    this.canvases = [
      this.refs.canvas1,
      this.refs.canvas2,
      this.refs.canvas3,
      this.refs.canvas4,
      this.refs.canvas5,
      this.refs.canvas6,
      this.refs.canvas7,
      this.refs.canvas8,
      this.refs.canvas9
    ];
    this.plot = this.refs.plot;
  }

  handleChange = event => {
    //controlled text input 1
    this.setState({ formValue: event.target.value });
  };

  handleChange2 = event => {
    //controlled text input 2
    this.setState({ maxX: event.target.value });
  };

  handleSubmit = event => {
    //updates v and MaxX and calls this.draw()
    var n = Number(this.state.formValue);
    var x = Number(this.state.maxX);
    if (!isNaN(n) && !isNaN(x)) {
      this.setState(
        {
          v: n,
          maxXval: x
        },
        () => {
          MaxX = x;
          this.draw(n);
        }
      );
    }
    event.preventDefault();
  };

  draw = v => {
    //wrapper for Canvas Draw(): sets global Canvas to ref elements before calling

    //EVALUATE INPUT CODE (function of type number->number)
    var X = eval(this.refs.function_code.value);

    for (var i = 0; i < this.canvases.length; i++) {
      Canvas = this.canvases[i];
      Width = Canvas.width;
      Height = Canvas.height;
      Draw(X, v, i);
    }

    Canvas = this.plot;
    Width = Canvas.width;
    Height = Canvas.height;
    DrawPayment(X);
  };

  render() {
    return (
      <div>
        <p>
          Enter a monotone (non-decreasing!) allocation function using valid
          Javascript Syntax:
        </p>
        {/* text input for allocation rule code */}
        <textarea ref="function_code" rows="5" cols="40">
          {
            "(b) => { \n  //linear:\n  return b;\n  //single-item auction:\n  //var B = 4;\n  //return (b > B ? 1 : 0);\n};"
          }
        </textarea>

        {/* input forms for v and max bid (MaxX) */}
        <form onSubmit={this.handleSubmit}>
          <h2 style={{ margin: 0 }}>Maximum bid:</h2>
          <input
            type="text"
            style={{ marginLeft: 10, marginRight: 10 }}
            value={this.state.maxX}
            onChange={this.handleChange2}
          ></input>
          <br />
          <h2 style={{ margin: 0 }}>Valuation v:</h2>
          <input
            type="text"
            style={{ marginLeft: 10, marginRight: 10 }}
            value={this.state.formValue}
            onChange={this.handleChange}
          ></input>
          <br />
          <input type="submit" value="plot!"></input>
        </form>
        <p>
          <b>Plots of b vs x(b) (visual proof of Myerson's Lemma)</b>
        </p>

        {/* Labels for columns */}
        <div id="flex">
          <div id="column"></div>
          <div id="column">
            <h2>
              <b>{"b = v = " + this.state.v}</b>
            </h2>
          </div>
          <div id="column">
            <h2>
              <b>
                {"b = " +
                  (this.state.v + (this.state.maxXval - this.state.v) / 2) +
                  " > v"}
              </b>
            </h2>
          </div>
          <div id="column">
            <h2>
              <b>{"b = " + this.state.v / 2 + " < v"}</b>
            </h2>
          </div>
          <div id="column"></div>
        </div>

        {/* Row 1 */}
        <h2>Social Surplus = v * x(b)</h2>
        <div id="output">
          <canvas ref="canvas1">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>

          <canvas ref="canvas2">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>

          <canvas ref="canvas3">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>
        </div>
        {/* Row 2 */}
        <h2>Payment = p(b)</h2>
        <div id="output">
          <canvas ref="canvas4">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>
          <canvas ref="canvas5">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>
          <canvas ref="canvas6">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>
        </div>
        {/* Row 3 */}
        <h2>Utility = v * x(b) - p(b) = SS - P (red is negative utility)</h2>
        <div id="output">
          <canvas ref="canvas7">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>

          <canvas ref="canvas8">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>

          <canvas ref="canvas9">CANVAS NOT SUPPORTED IN THIS BROWSER!</canvas>
        </div>
        <br />

        <p>
          <b>Plot of Payment Function, b vs p(b)</b>
        </p>
        <canvas ref="plot" className="plot">
          CANVAS NOT SUPPORTED IN THIS BROWSER!
        </canvas>
      </div>
    );
  }
}
