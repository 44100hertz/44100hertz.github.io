// limits detail for printing
minLineW = 10; // [5:20]
// how much to scale on each iteration
scaleIter = 0.5; // [0.3:0.005:0.6]
// how many degrees to twist each iteration
twistIter = 30;  // [0:60] 
// when to run 3 rots instead of 6. Contains flags
skipPattern = 3; // [0:8]
lineThickness = 10; // [5:1:15]

color("#fff") linear_extrude(1) snowflake();

module snowflake(i=0, scaleTally=1) {
    w = 40;
    h = lineThickness;
    sym = bit(skipPattern,i) ? 6 : 3;
    
    for (j=[0:sym-1]) rz(j*360/sym) {
        translate([0,-h/2]) square([w,h]);
        if (i<4 && w*scaleTally > minLineW)
            translate([w,0])
            scale(scaleIter) // ← Param
            mirror([1,0])
            rz(twistIter)    // ← Param
            snowflake(i+1, scaleTally * scaleIter);
    }
}

module rz(z) { rotate([0,0,z]) children(); }

// No bitwise ops so we use FP math
// non math / CS nerds turn away here ¡¿¡¿
// floor( x / 2^n ) is the same as ( x >> n )
// therefore extract bit is:
// x >> n - (x >> (n+1)) << 1
// example
// x = 01100110
// n = 5
// ...substitute and solve
// 01100110 >> 5 - (01100110 >> 6) << 1
//    ↓ Cut 5          ↓ Cut 6
// 11 »00110     - ( 1 »100110 ) << 1
// 11 - 1 << 1
// 11 - 10
// 1
function bit (x,n) =
    1 ==
    (floor(x / 2^n) - 2*floor(x / 2^(n+1)));

