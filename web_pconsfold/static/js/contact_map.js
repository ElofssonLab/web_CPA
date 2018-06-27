//read in DCA cmap to datastructure
//Q: residue index needs renumber?
// in template

// var DI_FILENAMES = ["http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/plik.hh0.l3","http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/plik.hh4.l3","http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/plik.jh0.l3","http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/plik.jh4.l3"];
// var DI_FILENAME = "http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/plik.l3";//{};//to be filled in by django
// var DMAP_FILENAME = "http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/model.pdb.dmap";//{};//to be filled in by django
// var FASTA_FILENAME = "http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/model.fasta";//{};//to be filled in by django
// var PROTEIN_LEN = 230;
var PX_MAP_SIZE = 460; //Q: in relation to window size?
var TIME_SKIP = 5; //distance between valid index pair
var VIEWER_FINISHED = 0;

//
var CANVAS = document.getElementById('plot_canvas');
var CANVAS_LA = document.getElementById('plot_canvas_LA');
var CANVAS_BA = document.getElementById('plot_canvas_BA');
var CANVAS_SEQ = document.getElementById('sequence_canvas');

var CTX = CANVAS.getContext("2d");
var SCTX = CANVAS_SEQ.getContext("2d");

var CURRENT_MAP_MODE = 0;
//0 - just DI
//1 - top DI, bottm CMAP
//2 - overlay
//3 - just CMAP?
var DMAP_DISTANCE = 8.0;
var MIN_DMAP_DISTANCE = 1.0;
var MAX_DMAP_DISTANCE = 8.0;
var DMAP_DISTANCE_RAINBOW = 0;
var DI_LOWER_BOUND = 0.5;
var TOP_DI_CNT = 0;
var DI_RESTRICT_MODE = 0;
var ORG_DISTANCE_MAP = 0;
var ACTIVE_DISTANCE_MAP = 0;
//0-restricted by score - above lower_bound
//1-show top cnt contacts
//var CURRENT_COLORMAP = 0;
////index amongst colormap array?
//
var COLORING_MODE = 0;
//0 - simple
//1 - rainbow
var PATYCZKI_MODE = 0;
//0 - simple
//1 - rainbow

AXIS_CANVAS_WIDTH = 40;
// var POINT_SIZE = Math.max(1,Math.floor(PX_MAP_SIZE/PROTEIN_LEN)); //at least one px per dot?
var POINT_SIZE = PX_MAP_SIZE/PROTEIN_LEN//Math.max(1,PX_MAP_SIZE/PROTEIN_LEN); //at least one px per dot?
CANVAS.height = POINT_SIZE*PROTEIN_LEN;
CANVAS_LA.height = POINT_SIZE*PROTEIN_LEN;
CANVAS.width = POINT_SIZE*PROTEIN_LEN;
CANVAS_BA.width = POINT_SIZE*PROTEIN_LEN;
var SFAC = 1;

//console.log("Protein length is",PROTEIN_LEN)

if (0 && PROTEIN_LEN>PX_MAP_SIZE){
	SFAC = Math.ceil((PX_MAP_SIZE/PROTEIN_LEN)*100)/100;
	console.log("scaling by",SFAC)
	CANVAS.getContext('2d').scale(SFAC,SFAC);
	CANVAS_LA.getContext('2d').scale(1,SFAC);
	CANVAS_BA.getContext('2d').scale(SFAC,1);

}

CANVAS_BA.height = AXIS_CANVAS_WIDTH;
CANVAS_LA.width = AXIS_CANVAS_WIDTH;

document.getElementById('dmap_cutoff').value = DMAP_DISTANCE;
document.getElementById('di_lower_bound').value = DI_LOWER_BOUND;

var DI_SCORES = [];
var DI_SCORES_SORTED = []
var DISTANCE_MAP = [];
var SELECTED = [];
var CURRENT_MOVEMENT = 0;
var STRUCTURE_SELECTED = [];
var SEQUENCE = '';
var PPV = 0;

var SEL_LINE_WIDTH = POINT_SIZE;
var SEL_DASH_LEN = 2*SEL_LINE_WIDTH;
var SEL_DASH_SKIP = SEL_DASH_LEN;
//var RAINBOW_DASH = ["blue","red","green","brown","magenta","cyan","orange","purple"];
var RAINBOW_DASH = ["#d4b9da","blue","cyan","green"];
var FREE_RAINBOW_DASH = ["magenta","red","orange","#fdbb84"];

var BOND_TUBE_RADIUS = 0.3;


var LMBPressedOnCanvas = 0;
var RMBPressedOnCanvas = 0;

if(PROTEIN_STRUCTURE_FILES[0]){
	document.getElementById("original_file_boxes").style.display ="block";
}

for(var i=2; i<PROTEIN_STRUCTURE_FILES.length; i++){
	string = '<input type="radio" id="model' + (i+1) + '" name="mselector" onchange="change_model_file('+i+')"><label for="model'+(i+1)+'">Model'+(i+1)+"</label>";
	document.getElementById("model_radios").insertAdjacentHTML('beforeend',string)
	
	console.log(PROTEIN_STRUCTURE_FILES[i]);
}


function createArray(length) {
    // (c) Matthew Crumley on https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function change_map_mode(mode){
	if ([0,1,2].indexOf(mode)>=0){
		CURRENT_MAP_MODE = mode;
	}
	addBonds();
}

function change_colouring_mode(){
	cform = document.getElementById('cmap_mode').checked;
	COLORING_MODE = +cform;
	if(COLORING_MODE){
    	document.getElementById('patyczek_div').style.display ="none";
    	document.getElementById('patyczek_mode').checked = 0;
        PATYCZKI_MODE = 0;
	}else{
       	document.getElementById('patyczek_div').style.display = "block";
	}
	addBonds();
}

function change_patyczek_mode(){
	cform = document.getElementById('patyczek_mode').checked;
	PATYCZKI_MODE = +cform;
	addBonds();
}

function change_structure_colouring_mode(){
	cform = document.getElementById('structure_color_mode').checked;
//	COLORING_MODE = +cform;
//	addBonds();
	if(!cform){
		recolorRainbow();
	}else{
		recolorBFactor();
	}
}
/*function recolorRainbow_pch(){
        VIEWER.clear();
        VIEWER.cartoon('structure.protein',STRUCTURE,{ boundingSpheres: false , color: pv.color.rainbow()});
	addSelectionToStructure(STRUCTURE_SELECTED);
//      VIEWER.autoZoom();
}
function recolorBFactor_pch(){
        VIEWER.clear();
        VIEWER.cartoon('structure.protein',STRUCTURE,{ boundingSpheres: false , color: pv.color.byResidueProp('tempFactor')});
	addSelectionToStructure(STRUCTURE_SELECTED);
//      VIEWER.autoZoom();

}*/

function getCB(res){
    var aname = "CB";
//    if(res._name === "GLY"){
//        aname = "CA";
//    }
    for(var i=0; i<res._atoms.length; i++){
        if(res._atoms[i]._name == aname){
            return res._atoms[i];
        }
    }
    aname = "CA";
    for(var i=0; i<res._atoms.length; i++){
        if(res._atoms[i]._name == aname){
            return res._atoms[i];
        }
    }
    return 0;
}

function calculate_dmap(structure){
//TODO fix alignement between PDB structure and model - may not be same
    residues = structure._chains[0]._residues;
    dmap = createArray(residues.length,residues.length);
    console.log("dlugosc to",residues.length)
    for(var i=0; i<residues.length-1; i++){
        dmap[i][i]=0;
        var a1 = getCB(residues[i]);
        if(!residues[i]._isAminoacid){
            continue;
        }
        for(var j=i+1; j<residues.length; j++){
            if(!residues[j]._isAminoacid){
                continue;
            }
            var a2 = getCB(residues[j]);
            if(a2==0){
                console.log(a2);
                console.log(residues[j]);
            }
            var d = pv.vec3.distance(a1.pos(),a2.pos());
            dmap[i][j] = d;
            dmap[j][i] = d;
        }
    }
    return dmap;
}

function change_dmap_cutoff(){
	cform = document.getElementById('dmap_cutoff');
	DMAP_DISTANCE = cform.value;
	addBonds();

}

function change_di_lower_bound(){
	cform = document.getElementById('di_lower_bound');
	DI_LOWER_BOUND = cform.value;
	addBonds();
	for(var i =0; i<DI_SCORES_SORTED.length; i++){
		if(DI_SCORES_SORTED[i]<cform.value){ break;}
	}
	TOP_DI_CNT = i;
//	console.log(i)
//	slider.value = i;
//	slider.oninput()
	refresh_info()

}

function change_di_file(file_idx){
	read_in_di(DI_FILENAMES[file_idx]);
	addBonds();
}


function change_model_file(file_idx){
    //TODO should I clear the viewer?
	read_in_dmap(DMAP_FILENAMES[file_idx]);
	loadServerPDB(file_idx);
	if (PROTEIN_STRUCTURE_FILES[0]){
    loadServerPDB(0,1);
	}
	addBonds();
}

function activate_original_model(){
	act = document.getElementById('org_model').checked;
	if (act){
		var to_original = 1;

		//STRUCTURE.colorBy(pv.color.uniform("grey");
		//preset(STRUCTURE,1);
		//preset(ORG_STRUCTURE,0);
	}else{
		var to_original = 0;
		//preset(STRUCTURE,0);
		//preset(ORG_STRUCTURE,1);
	}
	change_active_model(to_original);
	    MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP)); 
	        DMAP_DISTANCE_RAINBOW = new Rainbow();
	            if (MAX_DMAP_DISTANCE<100){
	                    rainbow.setNumberRange(0,MAX_DMAP_DISTANCE+1);
	                        }else{
	                             //   one_color_step = Math.floor(PROTEIN_LEN/100);    
	                                  1;
	                                      }
	addSelectionToStructure(STRUCTURE_SELECTED);
	document.getElementById('org_model_hide').checked = 0;
}

function read_in_array_old(filename,array_var){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filename, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var min_index = 10000;
                var max_index = 0;
                var allText = rawFile.responseText.split('\n');
                for(var line = 0; line < lines.length; line++){
                      a,b,c = line.split();
                      a = parseInt(a);
                      b = parseInt(b);
//                      c = parseFloat(c);
                      if (min_index > a) min_index = a;
                      if (max_index < b) max_index = b;
//                      console.log(lines[line]);
                    } // TODO - can be repalced by reading length from .fa or .pdb??


                array_var = createArray(max_index,max_index);
                for(var line = 0; line < lines.length; line++){
                      a,b,c = line.split();
                      a = parseInt(a);
                      b = parseInt(b);
                      c = parseFloat(c);
                      array_var[a][b] = c;
                      array_var[b][a] = c;
                    }
            }
        }
    }
    rawFile.send(null);
}

function read_in_array(filename,array_var,di){ //TODO won't work for chrome !!!
$.ajax({ url: filename,
    success: function(file_content) {
    var all_lines = file_content.split('\n');
for(var line = 0; line < all_lines.length; line++){
    l = all_lines[line].split(" ");
	if (l.length <3) continue;
    a = parseInt(l[0])-1;
    b = parseInt(l[1])-1;
//	console.log(l)
    c = parseFloat(l[2]);
   //console.log(c)
    array_var[a][b] = c;
    array_var[b][a] = c;
//   console.log(a,b,array_var[a][b]);

}
//console.log(DI_SCORES[2][218]);
if(di){sort_di_scores();}
else{
	change_di_lower_bound();
}
  }
});

}

function read_in_sequence(filename){ //TODO won't work for chrome !!!
	$.ajax({ url: filename,
    	success: function(file_content) {
    	var all_lines = file_content.split('\n');
		var seq='';
		for(var line = 0; line < all_lines.length; line++){
			if(all_lines[line][0]!=">"){
				seq+=all_lines[line];
			}
		}
		SEQUENCE = seq;
		console.log(SEQUENCE);
    	}
	});
}

var slider = document.getElementById("di_scores_cnt");

// Update the current slider value (each time you drag the slider handle)

slider.oninput = function() {
    var val = DI_SCORES_SORTED[this.value];
	console.log(val);
    DI_LOWER_BOUND = val;
//	console.log(DI_SCORES_SORTED[val])//,DI_SCORES[DI_SCORES_SORTED[x][0]][DI_SCORES_SORTED[x][1]]);
    for(var x =this.value;x<this.max;x++){
	if(DI_SCORES_SORTED[x]<val) break;
    }
//    this.value = x;
    TOP_DI_CNT = x;
//	console.log(DI_SCORES_SORTED[x]);
	refresh_info()
}

function refresh_info(){
	var output = document.getElementById("di_scores_cnt_display");
    	output.innerHTML = "(~"+parseInt(TOP_DI_CNT*100/DI_SCORES_SORTED.length)+"%)";//this.value+
    	document.getElementById("di_lower_bound").value = DI_LOWER_BOUND;
	var ppv = document.getElementById("ppv_display");
    	ppv.innerHTML = PPV +"/" +TOP_DI_CNT;
    	document.getElementById('di_scores_cnt_num').value = TOP_DI_CNT;
	slider.value = TOP_DI_CNT;
}

function change_dsc_num(){
    cform = document.getElementById('di_scores_cnt_num');
    TOP_DI_CNT = cform.value;
    DI_LOWER_BOUND = DI_SCORES_SORTED[cform.value];
	refresh_info()

//    slider.value = val;
//    slider.oninput()
}


function read_in_di(filename){
    DI_SCORES = createArray(PROTEIN_LEN,PROTEIN_LEN);
    read_in_array(filename,DI_SCORES,1);
//    sort_di_scores();

}
function read_in_dmap(filename){
//Q: just one distance criterion?
    DISTANCE_MAP = createArray(PROTEIN_LEN,PROTEIN_LEN);
    read_in_array(filename,DISTANCE_MAP,0);
    ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
    //DISTANCE_MAP = calculate_dmap(STRUCTURE);
    
    MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP)); 
    DMAP_DISTANCE_RAINBOW = new Rainbow();
    if (MAX_DMAP_DISTANCE<100){
        rainbow.setNumberRange(0,MAX_DMAP_DISTANCE+1);
    }else{
     //   one_color_step = Math.floor(PROTEIN_LEN/100);    
     1;
    }
}

function sort_di_scores(){
	for(var x=0; x<DI_SCORES.length-1; x++){
		for(var y=x+TIME_SKIP; y<DI_SCORES.length; y++){
				//console.log(x,y,DI_SCORES[x][y]);
			if(DI_SCORES[x][y]){
				DI_SCORES_SORTED[DI_SCORES_SORTED.length] = DI_SCORES[x][y];
			}
		}
	}
	DI_SCORES_SORTED.sort(function(a, b){return b-a});
	var slider = document.getElementById("di_scores_cnt");
	slider.max = DI_SCORES_SORTED.length;
        document.getElementById('di_scores_cnt_num').max = DI_SCORES_SORTED.length;
	slider.value = 300;

}


//COLORMAPS
//needs rainbowvis.js
var rainbow = new Rainbow();
if (PROTEIN_LEN<100){
        rainbow.setNumberRange(0,PROTEIN_LEN);
        one_color_step = 1;
    }
else{
        one_color_step = Math.floor(PROTEIN_LEN/100);    
    }

//Usage:
//cm.addTube(structure._chains[0]._residues[ind-1]._atoms[0]._pos,
//        structure._chains[0]._residues[ind]._atoms[0]._pos,
//          0.1,
//          { cap : true, color : ("#"+rainbow.colourAt(curcol)) });
//END

function addBonds(){
	if (typeof (VIEWER) !== 'object') {
		return;
	}
	VIEWER.rm('cross');
	CM = VIEWER.customMesh('cross');
//	console.log(SELECTED);
	for(var i=0; i<SELECTED.length; i++){
		j = i%RAINBOW_DASH.length;
		sel = SELECTED[i];
		sel = [sel[0],sel[1],sel[0]+sel[2],sel[1]+sel[3]];
		ix = parseInt(Math.min(sel[0],sel[2])/POINT_SIZE);
		ax = parseInt(Math.max(sel[0],sel[2])/POINT_SIZE);
		iy = parseInt(Math.min(sel[1],sel[3])/POINT_SIZE);
		ay = parseInt(Math.max(sel[1],sel[3])/POINT_SIZE);
//		console.log("sel",sel,ix,iy,ax,ay);
		for(var x=ix; x<=ax; x++){
			for(var y=iy; y<=ay; y++){
				if (x!=y){
//					console.log(ix,ax,x,iy,ay,y,validPoint(x,y))
					if (validPoint(x,y)){
                        if(PATYCZKI_MODE){
                            color = "#"+DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(ACTIVE_DISTANCE_MAP[x][y]));
                            // /console.log(Math.ceil(DISTANCE_MAP[x][y])," ",DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(DISTANCE_MAP[x][y])))
                        }else{
    						switch(COLORING_MODE){
	    						case 0:
		    						color = RAINBOW_DASH[j];
			    					break;
				    			case 1:
					    			color = "#"+pointColor(x,y);
						    		break;
	    						default:
		    						color = "black";
			    					break;
    						}
                        }
						CM.addTube(ACTIVE_STRUCTURE._chains[0]._residues[x-1]._atoms[0]._pos, ACTIVE_STRUCTURE._chains[0]._residues[y-1]._atoms[0]._pos,BOND_TUBE_RADIUS,{cap: true, color: color});
					}
				}
			}
		}
	}
//	console.log(FREEHAND_DONE_BONDS);
        for(var f=0; f<FREEHAND_DONE_BONDS.length; f++){
                b = FREEHAND_DONE_BONDS[f];
//                console.log(FREEHAND_DONE_BONDS);
//                CM.addTube(STRUCTURE._chains[0]._residues[b[0]-1]._atoms[0]._pos, STRUCTURE._chains[0]._residues[b[1]-1]._atoms[0]._pos,BOND_TUBE_RADIUS,{cap: true, color: b[2]});
		x = b[0];
		y = b[1];
		if (validPoint(x,y)){
			if(PATYCZKI_MODE){
                            color = "#"+DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(ACTIVE_DISTANCE_MAP[x][y]));
                            // /console.log(Math.ceil(DISTANCE_MAP[x][y])," ",DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(DISTANCE_MAP[x][y])))
			}else{
				switch(COLORING_MODE){
                    case 0:
                        color = FREE_RAINBOW_DASH[b[2]];//%RAINBOW_DASH.length];
                        break;
                    case 1:
                        color = "#"+pointColor(x,y);
                        break;
                    default:
                        color = "black";
                        break;
                }
            }
			CM.addTube(ACTIVE_STRUCTURE._chains[0]._residues[x-1]._atoms[0]._pos, ACTIVE_STRUCTURE._chains[0]._residues[y-1]._atoms[0]._pos,BOND_TUBE_RADIUS,{cap: true, color: color});
		}
        }

}

function bondsInFreehand(fhand){
	var j = FREEHAND_DONE.indexOf(fhand)%FREE_RAINBOW_DASH.length;
        all_x = [];
        all_y = [];
        for(var p=0; p<fhand.length; p++){
                all_x[all_x.length] = parseInt(fhand[p][0]/POINT_SIZE);
                all_y[all_y.length] = parseInt(fhand[p][1]/POINT_SIZE);
        }
        bboxx = [parseInt(Math.min.apply(Math,all_x)),parseInt(Math.max.apply(Math,all_x))]
        bboxy = [parseInt(Math.min.apply(Math,all_y)),parseInt(Math.max.apply(Math,all_y))]
        console.log("Daw in fhand",bboxx,bboxy);
	freehand_func(fhand,1);
	for(var x=bboxx[0]; x<=bboxx[1]; x++){
		for(var y=bboxy[0]; y<=bboxy[1]; y++){
			if (x!=y){
//					console.log(x,y,validPoint(x,y),inFreehand(x,y,fhand))
				if (validPoint(x,y)){
					a = (x-TRANSLATION[0])/ZOOM;
					b = (y-TRANSLATION[1])/ZOOM;
//console.log("could adding point",x,y,FREEHAND_DONE_BONDS.length,CTX.isPointInPath(x*POINT_SIZE,y*POINT_SIZE),a,b,CTX.isPointInPath(a,b));
//console.log(fhand);
                                        if (CTX.isPointInPath(x*POINT_SIZE,y*POINT_SIZE)){//inFreehand(x,y,fhand)){
//console.log("adding point",x,y,FREEHAND_DONE_BONDS.length);
/*					        switch(COLORING_MODE){
						        case 0:
							        color = RAINBOW_DASH[j];
							        break;
						        case 1:
							        color = "#"+pointColor(x,y);
							        break;
						        default:
							        color = "black";
							        break;
					        }*/
                                                FREEHAND_DONE_BONDS[FREEHAND_DONE_BONDS.length] = [x,y,j];
                                        }
				}
			}
		}
	}


}
//deprecated
function addBond(x,y){
	return;
	if (typeof (VIEWER) !== 'object') {
		return;
	}
	CM = VIEWER.customMesh('cross');
	if (x!=y){
		for (var i=0; i<SELECTED.length; i++){
			sel = SELECTED[i];
			
			if (sel[0] <= x*POINT_SIZE && x*POINT_SIZE <= sel[2] && i[1] <= y*POINT_SIZE && y*POINT_SIZE <= sel[3]){
				CM.addTube(ACTIVE_STRUCTURE._chains[0]._residues[x-1]._atoms[0]._pos, ACTIVE_STRUCTURE._chains[0]._residues[y-1]._atoms[0]._pos,0.1,{cap: true, color: RAINBOW_DASH[j]}) ;
				break ;
			}
		}
	}
}


//TODO draw axes
var TICK_SIZE = 10;
var FONT_SIZE = 15;

var AA_WIDTH = 20;
var AA_HEIGHT = 30;

var POTENTIAL_SSELECTED = [];

var read_map = 0;
function drawAA(aa,idx){
	SCTX.beginPath()
	if(STRUCTURE_SELECTED.indexOf(idx)>=0){
		if(POTENTIAL_SSELECTED.indexOf(idx)>=0){
			color = "blue";
		}else{
			color = "darkblue";
		}
		font_color = "white";
	}else if(POTENTIAL_SSELECTED.indexOf(idx)>=0){
		color = "blue";
		font_color="black";
	}else{
		color = "lightblue";
		font_color = "black";
	}
	SCTX.fillStyle = color;
	SCTX.fillRect((idx%50)*AA_WIDTH,AA_HEIGHT*(Math.floor(idx/50)),AA_WIDTH,AA_HEIGHT);
	//console.log(idx, (idx%50)*AA_WIDTH,AA_HEIGHT*(Math.floor(idx/50)),AA_WIDTH,AA_HEIGHT,aa)

	SCTX.font = FONT_SIZE + "px Arial";
	SCTX.fillStyle = font_color;
	SCTX.fillText(aa,(idx%50)*AA_WIDTH+5,AA_HEIGHT*(Math.floor(idx/50))+7+FONT_SIZE);
}

function drawSequence(){
	CANVAS_SEQ.width = AA_WIDTH*50;//SEQUENCE.length;
	CANVAS_SEQ.height = AA_HEIGHT*(Math.ceil(SEQUENCE.length/50));
	for(var s=0; s<SEQUENCE.length; s++){
		aa = SEQUENCE[s];
		drawAA(aa,s);
	}

}

function addOverlayToCanvas(resnum){
    	CTX.beginPath();
	CTX.fillStyle = "rgba(33, 150, 243, 0.1)";
	res = resnum*POINT_SIZE;
	CTX.fillRect(0,res,CANVAS.width, POINT_SIZE);
	CTX.fillRect(res,0, POINT_SIZE, CANVAS.height);


}
function addSSToAxes(){
	var ctx_ba = CANVAS_BA.getContext("2d");
	mid = 2;//CANVAS_BA.height/2;

	if(HELICES){
		ctx_ba.beginPath();
		ctx_ba.strokeStyle = SS_COLORS['H'];
		ctx_ba.lineWidth = POINT_SIZE;
		for(var h=0;h<HELICES.length;h++){
			hh = HELICES[h] * POINT_SIZE;
			ctx_ba.moveTo(hh,mid-TICK_SIZE/2);
			ctx_ba.lineTo(hh,mid+TICK_SIZE/2);
		}
		ctx_ba.stroke();
		ctx_ba.beginPath();
		ctx_ba.strokeStyle = SS_COLORS['E'];
		ctx_ba.lineWidth = POINT_SIZE;
		for(var h=0;h<SHEETS.length;h++){
			hh = SHEETS[h] *POINT_SIZE;
			ctx_ba.moveTo(hh,mid-TICK_SIZE/2);
			ctx_ba.lineTo(hh,mid+TICK_SIZE/2);
		}
		ctx_ba.stroke();
	}


	var ctx_ba = CANVAS_LA.getContext("2d");
	mid = CANVAS_LA.width-2;///2;
	if(HELICES || SHEETS){
		ctx_ba.beginPath();
		ctx_ba.strokeStyle = SS_COLORS['H'];
		ctx_ba.lineWidth = POINT_SIZE;
		for(var h=0;h<HELICES.length;h++){
			hh = HELICES[h] *POINT_SIZE;
		        ctx_ba.moveTo(mid-TICK_SIZE/2,hh);
        		ctx_ba.lineTo(mid+TICK_SIZE/2,hh);
		}
		ctx_ba.stroke();
		ctx_ba.beginPath();
		ctx_ba.strokeStyle = SS_COLORS['E'];
		ctx_ba.lineWidth = POINT_SIZE;
		for(var h=0;h<SHEETS.length;h++){
			hh = SHEETS[h]*POINT_SIZE;
		        ctx_ba.moveTo(mid-TICK_SIZE/2,hh);
        		ctx_ba.lineTo(mid+TICK_SIZE/2,hh);
		}
		ctx_ba.stroke();
	}
}

var SEL_COLOR = "green";
function addSelToAxes(resnum){
//	console.log("Drawing",resnum);
	var ctx_ba = CANVAS_BA.getContext("2d");
	mid = 2;//CANVAS_BA.height/2;
        
    	ctx_ba.beginPath();
	ctx_ba.strokeStyle = SEL_COLOR;//"red";
	res = resnum*POINT_SIZE;
	if (HELICES.indexOf(res)>=0){
		ctx_ba.strokeStyle = "orange";
	}else if(SHEETS.indexOf(res)>=0){
		ctx_ba.strokeStyle = "cyan";
	}
	ctx_ba.lineWidth = POINT_SIZE;
	ctx_ba.moveTo(res,mid-TICK_SIZE/2);
	ctx_ba.lineTo(res,mid+TICK_SIZE/2);
	ctx_ba.stroke();

	var ctx_ba = CANVAS_LA.getContext("2d");
	mid = CANVAS_LA.width-2;///2;
//	res = resnum*POINT_SIZE;
    	ctx_ba.beginPath();
	ctx_ba.strokeStyle = SEL_COLOR;//"red";
	res = resnum*POINT_SIZE;
	if (HELICES.indexOf(res)>=0){
		ctx_ba.strokeStyle = "orange";
	}else if(SHEETS.indexOf(res)>=0){
		ctx_ba.strokeStyle = "cyan";
	}
	ctx_ba.lineWidth = POINT_SIZE;
	ctx_ba.moveTo(mid-TICK_SIZE/2,res);
	ctx_ba.lineTo(mid+TICK_SIZE/2,res);
	ctx_ba.stroke();
}

var 	SS_COLORS = {"H": "red","E":"blue"}
var HELICES = [];
var SHEETS = [];

function drawAxes(){
//	CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
	var ctx_ba = CANVAS_BA.getContext("2d");
	ctx_ba.clearRect(0,0,CANVAS_BA.width,CANVAS_BA.height);
	mid = 2//CANVAS_BA.height/2;
    	ctx_ba.beginPath();
	ctx_ba.moveTo(0,mid);
	ctx_ba.lineTo(CANVAS_BA.width, mid);
	ctx_ba.strokeStyle = "black";
    	ctx_ba.lineWidth=4;

	for (var i=0; i<10; i++){
		p = parseInt(CANVAS_BA.width/10)*i+1;
		ctx_ba.moveTo(p,mid-TICK_SIZE/2);
		ctx_ba.lineTo(p,mid+TICK_SIZE/2);
		ctx_ba.font = FONT_SIZE/ZOOM + "px Arial";
		val = parseInt(p/POINT_SIZE)+1
		ctx_ba.fillText(val,p,mid+TICK_SIZE/2-1+FONT_SIZE/ZOOM);
	}
	ctx_ba.stroke();
	
	var ctx_ba = CANVAS_LA.getContext("2d");
	ctx_ba.clearRect(0,0,CANVAS_LA.width,CANVAS_LA.height);
	mid = CANVAS_LA.width-2;///2;
    	ctx_ba.beginPath();
	ctx_ba.moveTo(mid,0);
	ctx_ba.lineTo(mid, CANVAS_LA.height);
    	ctx_ba.lineWidth=4;
	ctx_ba.strokeStyle = "black";

	for (var i=0; i<10; i++){
		p = parseInt(CANVAS_LA.height/10)*i+1;
		ctx_ba.moveTo(mid-TICK_SIZE/2,p);
		ctx_ba.lineTo(mid+TICK_SIZE/2,p);
		ctx_ba.font = FONT_SIZE/ZOOM + "px Arial";
		val = parseInt(p/POINT_SIZE)+1
		val = ("    " + val).slice(-4);
//		ctx_ba.fillText(val,mid-TICK_SIZE/2+1-FONT_SIZE,p+FONT_SIZE/ZOOM);
		ctx_ba.fillText(val,0+20*(ZOOM-1),p+FONT_SIZE/ZOOM);
	}
	ctx_ba.stroke();
	addSSToAxes();
	for(var s=0; s<STRUCTURE_SELECTED.length; s++){
		addSelToAxes(STRUCTURE_SELECTED[s]);
		addOverlayToCanvas(STRUCTURE_SELECTED[s]);
	}

}
function add2SS(r){
	STRUCTURE_SELECTED[STRUCTURE_SELECTED.length] = r;
	console.log(STRUCTURE_SELECTED);
}
function delSS(){
	STRUCTURE_SELECTED = [];
}
function del4SS(r){
	for(var s=0; s<STRUCTURE_SELECTED.length; s++){
		if (STRUCTURE_SELECTED[s]==r){
//			for (;s<STRUCTURE_SELECTED.length-1;s++){
//				STRUCTURE_SELECTED[s]=STRUCTURE_SELECTED[s-1];
//			}
			STRUCTURE_SELECTED.splice(s,1);
			break;
		}
	}

}


function pointColor(x,y){
        mode = CURRENT_MAP_MODE;
        switch(mode){
                case 0:
                        val = DI_SCORES[x][y]; //TODO - assumes always 0-1
			val = parseInt(val*100);
                        return rainbow.colourAt(val);
                case 1:
//                        if(x<y){
				val = DI_SCORES[x][y]; //TODO - assumes always 0-1
	                        val = parseInt(val*100);
        	                return rainbow.colourAt(val);
//			}else{
//				return "FFFFFF";
//			}
                case 2:
            		val1 = DI_SCORES[x][y];
            		val2 = ACTIVE_DISTANCE_MAP[x][y];
            		if (val2<DMAP_DISTANCE && val1>DI_LOWER_BOUND){ //TODO odpowiednie przeliczanie TOP scores? Uwzglednic ten mod odciecia?
                		color = "0000ff";
            		}else if(val2<DMAP_DISTANCE){
                		color = "dddddd";
            		}else if(val1>DI_LOWER_BOUND){
                		color = "ff0000";
            		}else{
                		return;
            		}            
			return color;
            		break;
                default:
                        return 0;
        }
}

function validPoint(x,y){
//TODO - just checks if valid, no colour coding
	mode = CURRENT_MAP_MODE;
	if (Math.abs(y-x)<TIME_SKIP){
	    return 0;
	}
	try{
	switch(mode){
		case 0:
			val = DI_SCORES[x][y];
			return val > DI_LOWER_BOUND;
		case 1:
			return x<y && DI_SCORES[x][y]>DI_LOWER_BOUND;
		case 2:
			val1 = DI_SCORES[x][y];
	                val2 = ACTIVE_DISTANCE_MAP[x][y];
  	                return val1>DI_LOWER_BOUND;// val2<DMAP_DISTANCE && 
		default:
			return 0;
	}}
	catch(err){
//		console.log(err,"w valid point xym",x,y,mode);
		return 0;
	}


}

function drawPoint(x,y,mode){
//    console.log("Drawing",x,y,"mode",mode);
    var ppvi = 0;
    switch(mode){
        case 0: 
            val = DI_SCORES[x][y];
            if (val>DI_LOWER_BOUND){
		if (COLORING_MODE == 0){
	            	color = "blue";//TODOcmap[val]?
		}else if(COLORING_MODE == 1){
			color = "#"+pointColor(x,y);
		}
		ppvi = (ACTIVE_DISTANCE_MAP[x][y]<DMAP_DISTANCE);
	    }else{
		return ppvi;
		}
 		break;
        case 1:
            val = ACTIVE_DISTANCE_MAP[x][y];
            if (val<DMAP_DISTANCE){
//		if(COLORING_MODE == 0 ){
	                color = "black";
//		}else if(COLORING_MODE == 1){
//			color = "#"+pointColor(x,y);
//		}
            }else{
                return ppvi;
            }
            break;
        case 2:
            val1 = DI_SCORES[x][y];
            val2 = ACTIVE_DISTANCE_MAP[x][y];
//	   if (COLORING_MODE == 0){
            		if (val2<DMAP_DISTANCE && val1>DI_LOWER_BOUND){ //TODO odpowiednie przeliczanie TOP scores? Uwzglednic ten mod odciecia?
                		color = "blue";
				ppvi = 1;
            		}else if(val2<DMAP_DISTANCE){
                		color = "gray";
            		}else if(val1>DI_LOWER_BOUND){
                		color = "red";
            		}else{
                		return ppvi;
            		}
 //       	}else if(COLORING_MODE == 1){
//			color = "#"+pointColor(x,y);
//		}

            break;
        default:
            break;
    }
    CTX.beginPath()
    CTX.fillStyle = color;
    CTX.rect(x*POINT_SIZE,y*POINT_SIZE,POINT_SIZE,POINT_SIZE);
    CTX.fill();
	if (mode != 1){
		addBond(x,y);
	}
    return ppvi;
}

function drawMap(){
    if (CURRENT_MAP_MODE == 0){
        drawMapUT(0);
        drawMapLT(0);
    }else if (CURRENT_MAP_MODE == 1){
        drawMapUT(1);
        drawMapLT(0);
    }else if (CURRENT_MAP_MODE == 2){
        drawMapUT(2);
        drawMapLT(2);
    }
var ppv = document.getElementById("ppv_display");
ppv.innerHTML = PPV +"/" +TOP_DI_CNT;

}
function drawMapLT(mode){
    //mode: 0-di,1-dmap,2-overlay
    PPV = 0;
    for (var x=0; x<PROTEIN_LEN; x++){
        for (var y=x+TIME_SKIP; y<PROTEIN_LEN; y++){
            PPV += drawPoint(x,y,mode);
        }
    }
}
function drawMapUT(mode){
    //mode: 0-di,1-dmap,2-overlay
    for (var y=0; y<PROTEIN_LEN; y++){
        for (var x=y+TIME_SKIP; x<PROTEIN_LEN; x++){
            drawPoint(x,y,mode);
        }
    }
}

//Q: zoom?


function drawSelected(){
    //draws previously selected regions
    for (var i=0; i<SELECTED.length; i++){
        sel = SELECTED[i];
        /*if (!sel[4]){
            color = "red";
        }else{
            color = "blue";
        }*/
	color = RAINBOW_DASH[i%RAINBOW_DASH.length];
        CTX.beginPath();
        CTX.lineWidth=SEL_LINE_WIDTH;
        CTX.strokeStyle=color;
//        X = MOUSE_PRESSED_X;
//        Y = MOUSE_PRESSED_Y;

//        tmp = mousePosOnCanvas(CURRENT_MOVEMENT);
//        cx = tmp.x;
//        cy = tmp.y;

        CTX.rect(sel[0],sel[1],sel[2],sel[3]); 
	if(CURRENT_MAP_MODE == 1){
	        CTX.rect(sel[1],sel[0],sel[3],sel[2]); 
	}
//	CTX.setLineDash([SEL_DASH_LEN,SEL_DASH_SKIP]);
	CTX.setLineDash([]);
        CTX.stroke();
	
    
    }

}

var HELD_CTRL = 0;
function drawSelection(rmb){
    //draws currently happening selection
    if(HELD_CTRL){
        drawSelected();
    }else{
        SELECTED = [];
        FREEHAND_DONE = [];
        FREEHAND_DONE_BONDS = [];

	if (typeof VIEWER === "object"){
		VIEWER.rm('cross');
	}
    }
    if (!rmb){
        color = "grey";
    }else{
        color = "grey";
    }
//	console.log("draw selection")
    CTX.beginPath();
    CTX.lineWidth=SEL_LINE_WIDTH;
    CTX.strokeStyle=color;
    X = MOUSE_PRESSED_X;
    Y = MOUSE_PRESSED_Y;
  
    tmp = mousePosOnCanvas(CURRENT_MOVEMENT);
    cx = tmp.x;
    cy = tmp.y;

    CTX.rect(X,Y,(cx-X),(cy-Y)); 
	//console.log(X,Y,cx,cy);
    CTX.setLineDash([SEL_DASH_LEN,SEL_DASH_SKIP]);
    CTX.stroke();
}

function drawLMBSelection(){
    drawSelection(0);
}

function drawRMBSelection(){
    drawLMBSelection();
}


//HELPER FUNCTIONS
function mousePosOnCanvas(evt){
    var rect = CANVAS.getBoundingClientRect();
//	console.log(rect.left+TRANSLATION[0],rect.top-TRANSLATION[1]);
    var x = evt.clientX - rect.left;// -TRANSLATION[0];
    var y = evt.clientY - rect.top;// -TRANSLATION[1];
//	p = ZOOM_POINT
//	console.log(x,y,p)
//	x = -p[0] + (-p[0]+x)/ZOOM;
//	y = -p[1] + (-p[1]+y)/ZOOM;
	x= (x-TRANSLATION[0])/ZOOM;
	y= (y-TRANSLATION[1])/ZOOM;
//	console.log(x,y,TRANSLATION, (x-TRANSLATION[0])w/ZOOM)

//	x = x/ZOOM + TRANSLATION[0]/ZOOM;
//	y = y/ZOOM + TRANSLATION[1]/ZOOM;
	x = Math.min(Math.max(0,x),PROTEIN_LEN*POINT_SIZE)//*ZOOM)
	y = Math.min(Math.max(0,y),PROTEIN_LEN*POINT_SIZE)//*ZOOM)

//CANVAS.offsetLeft
//    originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
//    originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
//    TRANSLATION = [-(p.x*(-ZOOM+ZOOM*ZOOM_IN)), -(p.y*(-ZOOM+ZOOM_IN*ZOOM))];

    return {x:x,y:y};
}

var FREEHAND = 0;
var FREEHAND_FIRST_POS = 0;
var FREEHAND_ALL_POS = [];
var FREEHAND_DONE = [];
var FREEHAND_DONE_BONDS = [];
function freehand_func(poss,close){
        if(!poss){
                return;
        }
        CTX.beginPath();
        CTX.strokeStyle = "black";
        CTX.lineWidth = 1;
        CTX.setLineDash([]);
        CTX.moveTo(poss[0][0], poss[0][1]);
        for (var i=0; i<poss.length; i++){
                p = poss[i];
                CTX.lineTo(p[0],p[1]);
        }
        if(close){
		CTX.strokeStyle = FREE_RAINBOW_DASH[FREEHAND_DONE.indexOf(poss)%FREE_RAINBOW_DASH.length];
                CTX.lineTo(poss[0][0],poss[0][1]);
        }
        CTX.stroke();
}
function draw_freehand(){
//        if(!CURRENT_MOVEMENT.ctrlKey){
//        }
        for(var i =0; i<FREEHAND_DONE.length;i++){
                freehand_func(FREEHAND_DONE[i],1);
        }
        if(FREEHAND){
                freehand_func(FREEHAND_ALL_POS,0);
        }
}

function mouseDownHandler(e){
    p = mousePosOnCanvas(e);
    console.log(e.clientX+" "+e.clientY,p.x,p.y);
    if(e.target == CANVAS && e.shiftKey){
        if(!e.ctrlKey){
                FREEHAND_DONE = [];
                FREEHAND_DONE_BONDS = [];
		SELECTED = [];
        }
        FREEHAND = 1;
        mouseMoving = true;
	p = mousePosOnCanvas(e);
//        FREEHAND_LAST_POS = [p.x,p.y];
//        FREEHAND_FIRST_POS = [p.x,p.y];
        FREEHAND_ALL_POS = [[p.x,p.y]];
        return;
        }
    if(e.target == CANVAS){
        //TODO cross browser upport for detection of button
        LMBPressedOnCanvas = 1;
        RMBPressedOnCanvas = 1;
    }
//        alert(e.target.id);
    mouseMoving = true;
    if (e.ctrlKey){
        HELD_CTRL = true;
    }
//    justClicked = false;
	p = mousePosOnCanvas(e);
    MOUSE_PRESSED_X = p.x;//e.pageX;
    MOUSE_PRESSED_Y = p.y;//e.pageY;
	console.log(p.x,p.y);
}

function mouseUpHandler(e){
        if(FREEHAND){
                FREEHAND = 0;
                FREEHAND_DONE[FREEHAND_DONE.length] = FREEHAND_ALL_POS;
//		console.log("Addind to freehand",FREEHAND_DONE.length);


		if(ZOOM!=1){
			CTX.scale(ZOOM_OUT,ZOOM_OUT);
			T = [-(ZOOM_POINT[0]*(ZOOM*ZOOM_OUT-ZOOM)), -(ZOOM_POINT[1]*(ZOOM*ZOOM_OUT-ZOOM))];
			CTX.translate(T[0],T[1]);
	                bondsInFreehand(FREEHAND_ALL_POS);
		//for(var f=0;f<FREEHAND_DONE.length; f++){
	        //        bondsInFreehand(FREEHAND_DONE[f]);
		//}
			CTX.translate(TRANSLATION[0],TRANSLATION[1]);
			CTX.scale(ZOOM_IN,ZOOM_IN);
		}else{
	                bondsInFreehand(FREEHAND_ALL_POS);
		}
            mouseMoving = false;
                return;
        }

    if (!LMBPressedOnCanvas){
	return;
	}
    mouseMoving = false;
    LMBPressedOnCanvas = false;
//    if (e.target == CANVAS){
        X = MOUSE_PRESSED_X;
        Y = MOUSE_PRESSED_Y;
        tmp = mousePosOnCanvas(e);
        cx = tmp.x;
        cy = tmp.y;
        rmb = 1;
        SELECTED[SELECTED.length] = [X,Y,cx-X,cy-Y,rmb];            
	///console.log("Added to selected, length:",SELECTED.length);
//    }
    CURRENT_MOVEMENT = 0;
    HELD_CTRL = false;
        LMBPressedOnCanvas = 0;
        RMBPressedOnCanvas = 0;
}

function mouseMoveHandler(e){
    CURRENT_MOVEMENT = e;
//lastX = e.offsetX || (e.pageX - CANVAS.offsetLeft);
 //         lastY = e.offsetY || (e.pageY - CANVAS.offsetTop);
                p = mousePosOnCanvas(e);

//	console.log(p)
        if(FREEHAND || e.freehand){
                p = mousePosOnCanvas(e);
                FREEHAND_ALL_POS[FREEHAND_ALL_POS.length] = [p.x,p.y];
        }
}

//MAINLOOP

function draw(){
    //if(!read_map){
    //    if(VIEWER_FINISHED && STRUCTURE){
    //        read_in_dmap(0);
    //        read_map = 1;
    //    }
    //    requestAnimationFrame(draw);
    //}
    CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
    drawAxes();
    drawMap();
        draw_freehand();
    if(LMBPressedOnCanvas){
	//console.log("LB pressed");
        drawLMBSelection();
    }else if(RMBPressedOnCanvas){
        drawRMBSelection();
    }else{
        drawSelected();
    }
    addBonds();
    drawSequence();
    // selected -> run adding bonds to structure

    //things happen
    //console.log(ZOOM);
    requestAnimationFrame(draw);
//  setInterval(draw,10);
}
//document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);


var ZOOM = 1;
var DEF_POINT = [Math.floor(CANVAS.width/2),Math.floor(CANVAS.height/2)]
var ZOOM_POINT = [Math.floor(CANVAS.width/2),Math.floor(CANVAS.height/2)]
var ZOOM_IN= 2;
var ZOOM_OUT = 0.5;
var SCALE_FACTOR = 1.1;
var lastX=0;
var lastY=0;
var TRANSLATION = [0,0];

function zoom(clicks){
  	ZOOM+=clicks;
	console.log("clicks",clicks,ZOOM);
          var pt = CTX.transformedPoint(lastX,lastY);
          CTX.translate(pt.x,pt.y);
          var factor = Math.pow(SCALE_FACTOR,clicks);
          CTX.scale(factor,factor);
          CTX.translate(-pt.x,-pt.y);
//          redraw();
      }
var handleScroll_new = function(evt){
          var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
//	if(delta<0 && ZOOM<=0){return evt.preventDefault() && false;}
          if (delta) zoom(delta);
          return evt.preventDefault() && false;
      };

function handleScroll(e){
        if(e.wheelDelta == 0)return;
//		console.log(e.wheelDelta,ZOOM);
	if(e.wheelDelta>0 && ZOOM<2){
		p = mousePosOnCanvas(e);
		ZOOM_POINT = [p.x,p.y];
//		console.log(p.x-DEF_POINT[0],p.y-DEF_POINT[1]);
//		CTX.translate((p.x-DEF_POINT[0])*-ZOOM_IN,(p.y-DEF_POINT[1])*-ZOOM_IN);
		TRANSLATION = [-(p.x*(-ZOOM+ZOOM*ZOOM_IN)), -(p.y*(-ZOOM+ZOOM_IN*ZOOM))];
		CTX.translate(TRANSLATION[0],TRANSLATION[1]);
		CANVAS_BA.getContext('2d').translate(TRANSLATION[0],0);
		CANVAS_BA.getContext('2d').scale(ZOOM_IN,ZOOM_IN);
		CANVAS_LA.getContext('2d').translate(-40,TRANSLATION[1]);
		CANVAS_LA.getContext('2d').scale(ZOOM_IN,ZOOM_IN);
		CTX.scale(ZOOM_IN,ZOOM_IN);
		ZOOM*=ZOOM_IN;
	}
	else if(e.wheelDelta<0 && ZOOM>1){
		console.log("zoom>1");
		CTX.scale(ZOOM_OUT,ZOOM_OUT);
		CANVAS_LA.getContext('2d').scale(ZOOM_OUT,ZOOM_OUT);
		CANVAS_BA.getContext('2d').scale(ZOOM_OUT,ZOOM_OUT);
		TRANSLATION = [-(ZOOM_POINT[0]*(ZOOM*ZOOM_OUT-ZOOM)), -(ZOOM_POINT[1]*(ZOOM*ZOOM_OUT-ZOOM))];
		CTX.translate(TRANSLATION[0],TRANSLATION[1]);
		CANVAS_LA.getContext('2d').translate(40,TRANSLATION[1]);
		CANVAS_BA.getContext('2d').translate(TRANSLATION[0],0);
		TRANSLATION = [0,0];
//		ZOOM_POINT.splice(ZOOM_POINT.length-1,1);
		ZOOM_POINT = [Math.floor(CANVAS.width/2),Math.floor(CANVAS.height/2)]

		ZOOM*=ZOOM_OUT;
//		console.log(DEF_POINT[0]-ZOOM_POINT[0],DEF_POINT[1]-ZOOM_POINT[1]);
//		CTX.translate((DEF_POINT[0]-ZOOM_POINT[0])*-ZOOM_IN,(DEF_POINT[1]-ZOOM_POINT[1])*-ZOOM_IN);
		};
	return e.preventDefault() && false;
}
function retry_bonds(){
		CTX.scale(ZOOM_OUT,ZOOM_OUT);
		T = [-(ZOOM_POINT[0]*(ZOOM*ZOOM_OUT-ZOOM)), -(ZOOM_POINT[1]*(ZOOM*ZOOM_OUT-ZOOM))];
		CTX.translate(T[0],T[1]);
		for(var f=0;f<FREEHAND_DONE.length; f++){
	                bondsInFreehand(FREEHAND_DONE[f]);
		}
		CTX.translate(TRANSLATION[0],TRANSLATION[1]);
		CTX.scale(ZOOM_IN,ZOOM_IN);

}


var SEQ_SEL_START = 0;
var seqPressed = 0;

function seqMousePos(evt){
    var rect = CANVAS_SEQ.getBoundingClientRect();
    var x = evt.clientX - rect.left;// -TRANSLATION[0];
    var y = evt.clientY - rect.top;// -TRANSLATION[1];
	x = Math.min(Math.max(0,x),CANVAS_SEQ.width)//*ZOOM)
	y = Math.min(Math.max(0,y),CANVAS_SEQ.height)//*ZOOM)
	return [x,y];
}
function seqMouseDown(evt){
	seqPressed =1;
	SEQ_SEL_START=pointedAtAA(seqMousePos(evt));
	console.log("start",SEQ_SEL_START);
}
function pointedAtAA(xy){
    x = xy[0];
    y = xy[1];
	for(var s=0; s<SEQUENCE.length; s++){
		if((s%50)*AA_WIDTH <= x && x <= ((s%50)+1)*AA_WIDTH){
		    if(Math.floor(s/50)*AA_HEIGHT<=y && y <= (Math.floor(s/50)+1)*AA_HEIGHT ){
		    	//console.log("pointed at",s,SEQUENCE[s])
    			return s;
    	    }
		}
	}

}
function seqMouseMove(evt){
	if(!seqPressed){
		return;
	}
	end = seqMousePos(evt);
	s = SEQ_SEL_START;
	e = pointedAtAA(end);
	POTENTIAL_SSELECTED = [];
//	sel = (POTENTIAL_SELECTED.indexOf(s)<0)
//	console.log("end",end,s,e,sel);
	if(e<s){
		t =s;
		s= e;
		e = t;
	}
//	if(sel){
		add2arr(POTENTIAL_SSELECTED,s,e);
//	}else{
//		del4arr(POTENTIAL_SSELECTED,s,e);
//	}
}
function seqMouseUp(evt){
	seqPressed = 0;
	POTENTIAL_SSELECTED = []
	end = seqMousePos(evt);
	s = SEQ_SEL_START;
	e = pointedAtAA(end);
	sel = (STRUCTURE_SELECTED.indexOf(s)<0)
//	console.log("end",end,s,e,sel,POTENTIAL_SELECTED);
	if(e<s){
		t =s;
		s= e;
		e = t;
	}
	console.log("seqmouseup",s,e)
	if(sel){
		add2arr(STRUCTURE_SELECTED,s,e);
	}else{
		del4arr(STRUCTURE_SELECTED,s,e);
	}
	addSelectionToStructure(STRUCTURE_SELECTED);
}
function add2arr(array,s,e){
	for(var i=s; i<=e; i++){
		if(array.indexOf(i)<0){
//			console.log("adding",i);
			array[array.length] = i;
		}
	}
}
function del4arr(array,s,e){
//	console.log("usuwam",s,e,array);
	for(var i=array.length-1; i>=0; i--){
		if(s<=array[i] && array[i]<=e){
//			console.log("usuwam",i,array);
			array.splice(i,1);
		}
	}
}

function addSelectionToStructure(array){
     //           console.log(STRUCTURE.select({rnum : 0}));
    //var sel = ACTIVE_STRUCTURE.createEmptyView();
    var residues = ACTIVE_STRUCTURE.select({rnums : array});
    //console.log(residues)
	if(ACTIVE_STRUCTURE===ORG_STRUCTURE) {
        VIEWER.get('org_structure.protein').setSelection(residues);
        VIEWER.get('structure.protein').setSelection(STRUCTURE.select({rnums:[]}));

    }else {
        VIEWER.get('structure.protein').setSelection(residues);
                VIEWER.get('org_structure.protein').setSelection(ORG_STRUCTURE.select({rnums:[]}));

    }
//        for(var i=0; i<array.length; i++){
//            STRUCTURE.select({rnum : array[i]});
//        }
//  STRUCTURE.setSelection(sel);
  VIEWER.requestRedraw();
}

function touchDownHandler(evt){
	alert(mousePosOnCanvas(evt).x);
}

function touch2Mouse(e)
{
  var theTouch = e.changedTouches[0];
  var mouseEv;
  switch(e.type)
  {
    case "touchstart": mouseEv="mousedown"; break;  
    case "touchend":   mouseEv="mouseup"; break;
    case "touchmove":  mouseEv="mousemove"; break;
    default: return;
  }

  var mouseEvent = CANVAS.createEvent("MouseEvent");
  mouseEvent.freehand = 1;
  mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
  theTouch.target.dispatchEvent(mouseEvent);

  e.preventDefault();
}

CANVAS_SEQ.addEventListener('mousedown',seqMouseDown,false);
CANVAS_SEQ.addEventListener('mouseup',seqMouseUp,false);
CANVAS_SEQ.addEventListener('mousemove',seqMouseMove,false);

CANVAS.addEventListener('mousedown',mouseDownHandler,false);
//document.addEventListener('dblclick', mouseDblHandler, false);
//document.getElementById("myCanvasA").addEventListener('mousedown',mouseDownHandler,false);
//document.getElementById("myCanvasA").addEventListener('dblclick', mouseDblHandler, false);
document.addEventListener('mousemove',mouseMoveHandler,false);
document.addEventListener('mouseup',mouseUpHandler,false);

//CANVAS.addEventListener('touchstart',touch2Mouse,false);
//document.addEventListener('touchmove',mouseMoveHandler,false);
//document.addEventListener('touchend',mouseUpHandler,false);

CANVAS.addEventListener('DOMMouseScroll',handleScroll,false);
CANVAS.addEventListener('mousewheel',handleScroll,false);

read_in_di(DI_FILENAME);
read_in_sequence(FASTA_FILENAME);
read_in_dmap(DMAP_FILENAME);

draw();



