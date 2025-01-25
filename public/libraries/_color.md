_color Documentation

    _color(color,opacity)
        color - Any Color String. EX: "red", "#524213", "cmyk(50,100,23,68)"
        opacity [optional] - Number 0-1 controlling opacity of color. 

    _color(colorType,colorArray,opacity)
        colorType - String name of color type. EX: "rgb", "hsl", "cmyk";
        colorArray - Array of Number Values within said colorType. EX: if colorType is 'rgb' then array will hold three values for r,g,b [160,200,50];
        opacity [optional] - Number 0-1 controlling opacity of color. 

    _color(colorType, ...colorValues, opacity)
        colorType - String name of color type. EX: "rgb", "hsl", "cmyk";
        colorValues - Extra Number Parameters for said Color Type. EX: _color("hsl",100,25,24), _color("rgba",255,0,152,0.5);
        opacity [optional] - Number 0-1 controlling opacity of color. 

    Notes:
        [opacity] is automatically given value 1;
        [color] can be any value including random words, it'll find the closest color to what it thinks you want. EX: _color("pizza") -> colorName: "purple pizzazz"


    Each will return a Color Object that looks like this:
    {
        color: Hex Value Of Whatever Color You Chose, Including Opacity,
        ogColor: Hex Value Of Whatever Color You Chose, Excluding Opacity,
        opacity: Hex Value Of Whatever Opacity Was Chosen,
        colorName: Color String Name Of CLosest Matching Hex Value,
        colorNameSimilarity: Number 0-100 representing the matching percentage of ColorName, 
    }

    Notes:
        To actually recieve the color hex you will need to write .color after your _color() function.


_color Conversion Functions

    .rgb(returnType)
    .rgba(returnType)
    .cmyk(returnType)
    .hsl(returnType)
    .hsla(returnType)
    .ryb(returnType)
    .hex(returnType)

    [returnType] Parameter [Optional]: 
        A String Value Of How You Want Your Color Returned
        ("string"/"str"/"s") - Return A String Value Of Your Color EX: "rgb(155,200,15)", "#551121";
        ("array"/"arr"/"a") - Return An Array Of Your Color EX: [255,100,62];
        ("object"/"obj"/"o") - Return An Object Of Your Color EX: {r: 255, g: 100, b: 96, a: 1}  

    Notes:
        [returnType] Is Auto Set To Object, Except For .hex in which it is auto set to String.


_color Functions

    After Recieving A Color Object You Can Perform Different Functions To Achieve Different Values.
    EX: _color("yellow").subtract("yellow").color return black;

    .complimentary()
        Returns a Color Object for the Complimentary

    .grayScale()
        Return a black and white Color Object of your Color;

    .saturation(Amount)
        Amount - Number -1 through 1 reperesenting the increase/decrease of saturation;
        Returns a Color Object with the Saturation Changed depending on the Amount;

    .add(color)
        color - Any Color String. EX: "red", "#524213", "cmyk(50,100,23,68)"
        Return A Color Object With The Two Colors Given RGB values Added Up;

    .subtract(color)
        color - Any Color String. EX: "red", "#524213", "cmyk(50,100,23,68)"
        Return A Color Object With The Two Colors Given RGB values Subtracted;

    .mix(color)
        color - Any Color String. EX: "red", "#524213", "cmyk(50,100,23,68)"
        Return A Color Object With The Two Colors Given RGB values Mixed;
