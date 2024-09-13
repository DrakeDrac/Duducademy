// Are all of these used? I've honestly lost track of these lol,
// might convert everthing to objects later

let Lpage;
let height = 1080;
let width = 1920;
let Scale = 0.9;
let aspectratio = 1.78;
let slideList = [];

// data.json / Path2D array
let parsed_data = [];
let Paths = [];

// DrawingBoard variables
let color = "black";
let mode = "marker";
let shape_url = "";
let dash = [4, 4];
let eraserSize = 5;
let strokeSize = 0.5;
let strokeMultiplier = 2;

// temp variables
let seekC = 0;
let recX = 0;
let recY = 0;
let lineX = 0;
let lineY = 0;
let shapeX = 0;
let shapeY = 0;

let lastIndex = 0;

let data;
let tempId = "";
let pgId = 0;

let lastBg = -1;

let temp = new Path2D();
