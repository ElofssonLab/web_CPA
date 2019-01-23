// (C) Aleksandra Jarmolińska 2018/2019 a.jarmolinska@mimuw.edu.pl

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
var DI_SCORES_RAINBOW = new Rainbow();

var DMAP_DISTANCE = 8.0;
var MIN_DMAP_DISTANCE = 1.0;
var MAX_DMAP_DISTANCE = 8.0;
var ORG_MAX_DMAP_DISTANCE = 8.0;
var ACTIVE_MAX_DMAP_DISTANCE = 8.0;
var DMAP_DISTANCE_RAINBOW = 0;
var ORG_DMAP_DISTANCE_RAINBOW = 0;
var ACTIVE_DMAP_DISTANCE_RAINBOW = 0;
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
//document.getElementById('distance_cutoff_value').innerHTML = DMAP_DISTANCE;
document.getElementsByName('distance_cutoff_value').forEach(function(elem){
	    elem.innerHTML = DMAP_DISTANCE;
	});
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

var mouseMoving=0

var LMBPressedOnCanvas = 0;
var RMBPressedOnCanvas = 0;

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

function show_plot_legend(){
    var show  = document.getElementById('show_plot_legend').checked;
    if(show){
        document.getElementById('plot_help').style.display = "block";
    }else{
        document.getElementById('plot_help').style.display = "none";
    }
}

function change_map_mode(mode){

	if ([0,1,2,3,4].indexOf(mode)>=0){
		CURRENT_MAP_MODE = mode;
	}
    var x = document.getElementsByClassName("legend_plot");
    for(var i =0; i<x.length; i++){
       x[i].style.display = "none";
    }
    document.getElementById('legend_contact_map').style.display ="none";
    
    if(mode>2){
        document.getElementsByName("slider_elements").forEach(function(elem){
            elem.style.display="none";
        });
        if(mode==3){
            document.getElementById('ppv_div').style.display ="inline";
        }
    }else{
            document.getElementsByName("slider_elements").forEach(function(elem){
            elem.style.display="inline";
        });

    }


    if(mode==2){
        document.getElementById('overlay_di').style.display ="block";
    }else if(mode==3){
        
        document.getElementById('overlay_cmap').style.display ="block";
    }else if(mode==4){
        document.getElementById('distance_cmap').style.display ="block";
    }else{ 
        if(mode==1){
            document.getElementById('legend_contact_map').style.display ="block";
        }
        if(COLORING_MODE){
            document.getElementById('complex_just_di').style.display ="block";
        }else{
            document.getElementById('simple_just_di').style.display ="block";
        }
    }
    if(PATYCZKI_MODE){
            document.getElementById('bonds_complex').style.display ="block";
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
       	document.getElementById('patyczek_div').style.display = "flex";
	}
	if(CURRENT_MAP_MODE<2){
	    if(COLORING_MODE){
            document.getElementById('complex_just_di').style.display ="block";
            document.getElementById('simple_just_di').style.display ="none";
            document.getElementById('bonds_complex').style.display ="none";
        }else{
            document.getElementById('complex_just_di').style.display ="none";
            document.getElementById('simple_just_di').style.display ="block";
        }
	}
	addBonds();
}

function change_patyczek_mode(){
	cform = document.getElementById('patyczek_mode').checked;
	PATYCZKI_MODE = +cform;
    if(PATYCZKI_MODE){
            document.getElementById('bonds_complex').style.display ="block";
        }else{
            document.getElementById('bonds_complex').style.display ="none";
    }
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
	document.getElementsByName('distance_cutoff_value').forEach(function(elem){
	    elem.innerHTML = cform.value;
	});
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
	refresh_info()

}

function change_di_file(file_idx){
	read_in_di(DI_FILENAMES[file_idx]);
	addBonds();
}


function change_model_file(file_idx){
	document.getElementById('org_model_hide').checked = 0;
        VIEWER.clear();
	loadServerPDB(file_idx);
	addBonds();
	document.getElementById('our_model_topology').innerHTML = topo_other_descs[file_idx-1];
	document.getElementById('our_model_topology_img').src = document.getElementById('our_model_topology_img').getAttribute('im_src') + topo_other_imgs[file_idx-1] + ".png";
	try {
        document.getElementById('expert_thinks').setAttribute('text',topo_other_comms[file_idx - 1]);
    }catch (e) {
		document.getElementById('expert_says').innerHTML = topo_other_comms[file_idx - 1];
    }
}

function activate_original_model(act){
	if (act){
		var to_original = 1;
	    ACTIVE_MAX_DMAP_DISTANCE = ORG_MAX_DMAP_DISTANCE;
    	ACTIVE_DMAP_DISTANCE_RAINBOW = ORG_DMAP_DISTANCE_RAINBOW;
    	document.getElementById("org_model_1").classList.add("btn-primary");
    	document.getElementById("org_model_1").classList.remove("btn-outline-primary");
    	document.getElementById("org_model_0").classList.remove("btn-primary");
    	document.getElementById("org_model_0").classList.add("btn-outline-primary");
	}else{
		var to_original = 0;
	    ACTIVE_MAX_DMAP_DISTANCE = MAX_DMAP_DISTANCE;
    	ACTIVE_DMAP_DISTANCE_RAINBOW = DMAP_DISTANCE_RAINBOW;
    	    	document.getElementById("org_model_0").classList.add("btn-primary");
    	document.getElementById("org_model_0").classList.remove("btn-outline-primary");
    	document.getElementById("org_model_1").classList.remove("btn-primary");
    	document.getElementById("org_model_1").classList.add("btn-outline-primary");
	}
	change_active_model(to_original);
    fth_mode_plot()
	addSelectionToStructure(STRUCTURE_SELECTED);
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
                      if (min_index > a) min_index = a;
                      if (max_index < b) max_index = b;
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
    c = parseFloat(l[2]);
    array_var[a][b] = c;
    array_var[b][a] = c;

}
if(di){
	sort_di_scores();}
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
    DI_LOWER_BOUND = val;
    for(var x =this.value;x<this.max;x++){
	if(DI_SCORES_SORTED[x]<val) break;
    }
    TOP_DI_CNT = x;
    refresh_info()
}

function refresh_info(){
	DI_LOWER_BOUND = DI_SCORES_SORTED[TOP_DI_CNT];
	var output = document.getElementById("di_scores_cnt_display");
    	output.innerHTML = "(~"+parseInt(TOP_DI_CNT*100/DI_SCORES_SORTED.length)+"%)";//this.value+
    	document.getElementById("di_lower_bound").value = DI_LOWER_BOUND;
	var ppv = document.getElementById("ppv_display");
    	ppv.innerHTML = PPV +"/" +TOP_DI_CNT;
    	document.getElementById('di_scores_cnt_num').value = TOP_DI_CNT;
	slider.value = TOP_DI_CNT;
        document.getElementsByName('di_cutoff_value').forEach(function(elem){
	elem.innerHTML = DI_LOWER_BOUND;
	});
	
}

function change_dsc_num(){
    cform = document.getElementById('di_scores_cnt_num');
    TOP_DI_CNT = cform.value;
    DI_LOWER_BOUND = DI_SCORES_SORTED[cform.value];
    refresh_info()
}

function expert_says(){
	var ours = document.getElementById("expert_thinks").getAttribute("text");
	var expert = document.getElementById("expert_says").innerHTML = ours;
}


function read_in_di(filename){
    DI_SCORES = createArray(PROTEIN_LEN,PROTEIN_LEN);
    read_in_array(filename,DI_SCORES,1);
    refresh_info()
}
function read_in_dmap(filename){
//Q: just one distance criterion?
    DISTANCE_MAP = createArray(PROTEIN_LEN,PROTEIN_LEN);
    ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
}

function sort_di_scores(){
	DI_SCORES_SORTED = [];
	for(var x=0; x<DI_SCORES.length-1; x++){
		for(var y=x+TIME_SKIP; y<DI_SCORES.length; y++){
			if(DI_SCORES[x][y]){
				DI_SCORES_SORTED[DI_SCORES_SORTED.length] = DI_SCORES[x][y];
			}
		}
	}
	DI_SCORES_SORTED.sort(function(a, b){return b-a});
	var slider = document.getElementById("di_scores_cnt");
	slider.max = DI_SCORES_SORTED.length;
	document.getElementById('di_scores_cnt_num').max = DI_SCORES_SORTED.length;
	if (TOP_DI_CNT){
		slider.value = TOP_DI_CNT;//PROTEIN_LEN;
	}else{
	   slider.value = PROTEIN_LEN;
	   TOP_DI_CNT = PROTEIN_LEN;
	}
	DI_LOWER_BOUND = DI_SCORES_SORTED[TOP_DI_CNT];
	DI_SCORES_RAINBOW.setNumberRange(0,100*DI_SCORES_SORTED[0]+1);
	document.getElementById('max_di_score').innerHTML = DI_SCORES_SORTED[0];
	refresh_info()
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

function addBonds(){
	if (typeof (VIEWER) !== 'object') {
		return;
	}
	VIEWER.rm('cross');
	CM = VIEWER.customMesh('cross');
	for(var i=0; i<SELECTED.length; i++){
		j = i%RAINBOW_DASH.length;
		sel = SELECTED[i];
		sel = [sel[0],sel[1],sel[0]+sel[2],sel[1]+sel[3]];
		ix = parseInt(Math.min(sel[0],sel[2])/POINT_SIZE);
		ax = parseInt(Math.max(sel[0],sel[2])/POINT_SIZE);
		iy = parseInt(Math.min(sel[1],sel[3])/POINT_SIZE);
		ay = parseInt(Math.max(sel[1],sel[3])/POINT_SIZE);
		for(var x=ix; x<=ax; x++){
			for(var y=iy; y<=ay; y++){
				if (x!=y){
					if (validPoint(x,y)){
                        if(PATYCZKI_MODE){
                            color = "#"+ACTIVE_DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(ACTIVE_DISTANCE_MAP[x][y]));
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
                        try{
				CM.addTube(ACTIVE_STRUCTURE._chains[0]._residues[x-1]._atoms[0]._pos, ACTIVE_STRUCTURE._chains[0]._residues[y-1]._atoms[0]._pos,BOND_TUBE_RADIUS,{cap: true, color: color});
                        }catch(err){
                            console.log(err)
                        }
					}
				}
			}
		}
	}
        for(var f=0; f<FREEHAND_DONE_BONDS.length; f++){
                b = FREEHAND_DONE_BONDS[f];
		x = b[0];
		y = b[1];
		if (validPoint(x,y)){
			if(PATYCZKI_MODE){
                            color = "#"+ACTIVE_DMAP_DISTANCE_RAINBOW.colourAt(Math.ceil(ACTIVE_DISTANCE_MAP[x][y]));
			}else{
				switch(COLORING_MODE){
                    case 0:
                        color = FREE_RAINBOW_DASH[b[2]];
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
				if (validPoint(x,y)){
					a = (x-TRANSLATION[0])/ZOOM;
					b = (y-TRANSLATION[1])/ZOOM;
                                        if (CTX.isPointInPath(x*POINT_SIZE,y*POINT_SIZE)){
                                                FREEHAND_DONE_BONDS[FREEHAND_DONE_BONDS.length] = [x,y,j];
                                        }
				}
			}
		}
	}


}
//deprecated?
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

var TICK_SIZE = 10;
var FONT_SIZE = 15;

var AA_WIDTH = 20;
var AA_HEIGHT = 30;

var NUM_AAS_IN_LINE = 50;

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
	SCTX.fillRect((idx%NUM_AAS_IN_LINE)*AA_WIDTH,AA_HEIGHT*(Math.floor(idx/NUM_AAS_IN_LINE)),AA_WIDTH,AA_HEIGHT);
	SCTX.font = FONT_SIZE + "px Arial";
	SCTX.fillStyle = font_color;
	SCTX.fillText(aa,(idx%NUM_AAS_IN_LINE)*AA_WIDTH+5,AA_HEIGHT*(Math.floor(idx/NUM_AAS_IN_LINE))+7+FONT_SIZE);
}

function drawSequence(){
	NUM_AAS_IN_LINE = Math.floor(document.getElementById("di_scores_cnt").offsetWidth/AA_WIDTH);
	CANVAS_SEQ.width = AA_WIDTH*NUM_AAS_IN_LINE;//SEQUENCE.length;
	CANVAS_SEQ.height = AA_HEIGHT*(Math.ceil(SEQUENCE.length/NUM_AAS_IN_LINE));
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

var 	SS_COLORS = {"H": "magenta","E":"cyan"}
var HELICES = [];
var SHEETS = [];

function drawAxes(){
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
			STRUCTURE_SELECTED.splice(s,1);
			break;
		}
	}

}


function pointColor(x,y,distance_map=0,distance_rainbow=0){
        mode = CURRENT_MAP_MODE;
        switch(mode){
                case 0:
                        val = DI_SCORES[x][y]; //TODO - assumes always 0-1
			val = parseInt(val*100);
                        return DI_SCORES_RAINBOW.colourAt(val);
                case 1:
    				val = DI_SCORES[x][y]; //TODO - assumes always 0-1
	                        val = parseInt(val*100);
        	                return DI_SCORES_RAINBOW.colourAt(val);

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
                case 3:
            		val1 = DISTANCE_MAP[x][y];
            		val2 = ORG_DISTANCE_MAP[x][y];
            		if (val2<DMAP_DISTANCE && val1<DMAP_DISTANCE){ //TODO odpowiednie przeliczanie TOP scores? Uwzglednic ten mod odciecia?
                		color = "800080";
            		}else if(val2<DMAP_DISTANCE){
                		color = "B4DBE7" ;//"0000ff";
            		}else if(val1<DMAP_DISTANCE){
                		color = "ffbbc6";//"ff0000";
            		}else{
                		return;
            		}            
			        return color;
            		break;
                case 4:
                    val = distance_map[x][y];
                    return distance_rainbow.colourAt(val)
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
			return  DI_SCORES[x][y]>DI_LOWER_BOUND;
		case 2:
			val1 = DI_SCORES[x][y];
	                val2 = ACTIVE_DISTANCE_MAP[x][y];
  	                return val1>DI_LOWER_BOUND;// val2<DMAP_DISTANCE && 
		case 3:
			val1 = DISTANCE_MAP[x][y];
	        val2 = ORG_DISTANCE_MAP[x][y];
  	                return (!isNaN(val1) && !isNaN(val2)) && (val2<DMAP_DISTANCE || val1<DMAP_DISTANCE);// val2<DMAP_DISTANCE &&   	    
  	    case 4:
  	        return 0;
		default:
			return 0;
	}}
	catch(err){
		return 0;
	}


}

function drawPoint(x,y,mode,distance_map=0,distance_rainbow=0,count_shown=0){
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
		//TODO: If the residues are missing, we assume wrong distance
		ppvi = (ACTIVE_DISTANCE_MAP[x] && ACTIVE_DISTANCE_MAP[x][y] && ACTIVE_DISTANCE_MAP[x][y]<DMAP_DISTANCE);
	    }else{
		return ppvi;
		}
 		break;
        case 1:
            val = ACTIVE_DISTANCE_MAP[x][y];
            if (val<DMAP_DISTANCE){
	                color = "black";
            }else{
                return ppvi;
            }
            break;
        case 2:
            val1 = DI_SCORES[x][y];
            val2 = ACTIVE_DISTANCE_MAP[x][y];
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
            break;
        case 3:
            val1 = DISTANCE_MAP[x][y];
	    if ((x>=ORG_DISTANCE_MAP.length) || (y>=ORG_DISTANCE_MAP.length)){
		    // if no reference structure for part of a model
                        color = "white"
                        if(val1<DMAP_DISTANCE){
                                color = "lightpink";
                        }else{
                                return ppvi;
                        }
                        break;
            }
            val2 = ORG_DISTANCE_MAP[x][y];
            		if (val2<DMAP_DISTANCE && val1<DMAP_DISTANCE){ //TODO odpowiednie przeliczanie TOP scores? Uwzglednic ten mod odciecia?
                		color = "purple";
				ppvi = 1;
            		}else if(val2<DMAP_DISTANCE){
                		color = "lightblue";
            		}else if(val1<DMAP_DISTANCE){
                		color = "lightpink";
            		}else{
                		return ppvi;
            		}
            if(count_shown){
                SHOWN_CONTACTS_CNT +=1;
            }
            break;
        case 4:
	    if ((x>=distance_map.length) || (y>=distance_map.length)){
                        color = "white"
                        break;
            }
            val = distance_map[x][y];
            color= "#"+distance_rainbow.colourAt(val)
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

function drawMap(ctx=0){
    if(ctx){
        BKP = CTX;
        CTX = ctx;
    }
    if (CURRENT_MAP_MODE == 0){
        drawMapUT(0);
        drawMapLT(0);
    }else if (CURRENT_MAP_MODE == 1){
        drawMapUT(1);
        drawMapLT(0);
    }else if (CURRENT_MAP_MODE == 2){
        drawMapUT(2);
        drawMapLT(2);
    }else if (CURRENT_MAP_MODE == 3){
        drawMapUT(3);
        drawMapLT(3);
    }else if (CURRENT_MAP_MODE == 4){
        drawMapUT(4,ORG_DISTANCE_MAP,ACTIVE_DMAP_DISTANCE_RAINBOW);
        drawMapLT(4,DISTANCE_MAP,ACTIVE_DMAP_DISTANCE_RAINBOW);
    }
    if(ctx){
        CTX=BKP;
    }
    var ppv = document.getElementById("ppv_display");
    if(CURRENT_MAP_MODE==3){
        ppv.innerHTML = PPV +"/" +SHOWN_CONTACTS_CNT;
    }else{
        ppv.innerHTML = PPV +"/" +TOP_DI_CNT;
    }

}
function drawMapLT(mode,distance_map=0,distance_rainbow=0){
    //mode: 0-di,1-dmap,2-overlay
    SHOWN_CONTACTS_CNT = 0;
    PPV = 0;
    for (var x=0; x<PROTEIN_LEN; x++){
        for (var y=x+TIME_SKIP; y<PROTEIN_LEN; y++){
            PPV += drawPoint(x,y,mode,distance_map,distance_rainbow,1);
        }
    }
    if(distance_map){PPV="-";}
}
function drawMapUT(mode,distance_map=0, distance_rainbow=0){
    //mode: 0-di,1-dmap,2-overlay
    for (var y=0; y<PROTEIN_LEN; y++){
        for (var x=y+TIME_SKIP; x<PROTEIN_LEN; x++){
            drawPoint(x,y,mode,distance_map,distance_rainbow);
        }
    }
}

function drawSelected(){
    //draws previously selected regions
    for (var i=0; i<SELECTED.length; i++){
        sel = SELECTED[i];
	color = RAINBOW_DASH[i%RAINBOW_DASH.length];
        CTX.beginPath();
        CTX.lineWidth=SEL_LINE_WIDTH;
        CTX.strokeStyle=color;
        CTX.rect(sel[0],sel[1],sel[2],sel[3]); 
	if(CURRENT_MAP_MODE == 1){
	        CTX.rect(sel[1],sel[0],sel[3],sel[2]); 
	}
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
    var x = evt.clientX - rect.left;// -TRANSLATION[0];
    var y = evt.clientY - rect.top;// -TRANSLATION[1];
	x= (x-TRANSLATION[0])/ZOOM;
	y= (y-TRANSLATION[1])/ZOOM;
	x = Math.min(Math.max(0,x),PROTEIN_LEN*POINT_SIZE)//*ZOOM)
	y = Math.min(Math.max(0,y),PROTEIN_LEN*POINT_SIZE)//*ZOOM)
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
        for(var i =0; i<FREEHAND_DONE.length;i++){
                freehand_func(FREEHAND_DONE[i],1);
        }
        if(FREEHAND){
                freehand_func(FREEHAND_ALL_POS,0);
        }
}

function mouseDownHandler(e){
    INTERACTED=1
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
        FREEHAND_ALL_POS = [[p.x,p.y]];
        return;
        }
    if(e.target == CANVAS){
        //TODO cross browser upport for detection of button
        LMBPressedOnCanvas = 1;
        RMBPressedOnCanvas = 1;
    }
    mouseMoving = true;
    if (e.ctrlKey){
        HELD_CTRL = true;
    }
	p = mousePosOnCanvas(e);
    MOUSE_PRESSED_X = p.x;//e.pageX;
    MOUSE_PRESSED_Y = p.y;//e.pageY;
	console.log(p.x,p.y);
}

function mouseUpHandler(e){
        if(FREEHAND){
                FREEHAND = 0;
                FREEHAND_DONE[FREEHAND_DONE.length] = FREEHAND_ALL_POS;
		if(ZOOM!=1){
			CTX.scale(ZOOM_OUT,ZOOM_OUT);
			T = [-(ZOOM_POINT[0]*(ZOOM*ZOOM_OUT-ZOOM)), -(ZOOM_POINT[1]*(ZOOM*ZOOM_OUT-ZOOM))];
			CTX.translate(T[0],T[1]);
	                bondsInFreehand(FREEHAND_ALL_POS);
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
        X = MOUSE_PRESSED_X;
        Y = MOUSE_PRESSED_Y;
        tmp = mousePosOnCanvas(e);
        cx = tmp.x;
        cy = tmp.y;
        rmb = 1;
        SELECTED[SELECTED.length] = [X,Y,cx-X,cy-Y,rmb];            
    CURRENT_MOVEMENT = 0;
    HELD_CTRL = false;
        LMBPressedOnCanvas = 0;
        RMBPressedOnCanvas = 0;
}

function mouseMoveHandler(e){
    CURRENT_MOVEMENT = e;
                p = mousePosOnCanvas(e);
        if(FREEHAND || e.freehand){
                p = mousePosOnCanvas(e);
                FREEHAND_ALL_POS[FREEHAND_ALL_POS.length] = [p.x,p.y];
        }
}

//MAINLOOP
var INTERACTED=0;
var FTH_MODE_PLOT_CANVAS = 0;

function fth_mode_plot(){
    FTH_MODE_PLOT_CANVAS = document.createElement('canvas');
    FTH_MODE_PLOT_CANVAS.width = CANVAS.width;
    FTH_MODE_PLOT_CANVAS.height = CANVAS.height;
    var FTH_MODE_PLOT_CTX = FTH_MODE_PLOT_CANVAS.getContext('2d');
    drawMap(FTH_MODE_PLOT_CTX);

}
function draw(){
    if(ORG_DISTANCE_MAP && CURRENT_MAP_MODE==4){
        if(!FTH_MODE_PLOT_CANVAS){
            fth_mode_plot();
        }
        CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
        CTX.drawImage(FTH_MODE_PLOT_CANVAS,0,0);
    }else{
        CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
        drawMap();
    }
    INTERACTED=mouseMoving
    drawAxes();
        draw_freehand();
    if(LMBPressedOnCanvas){
        drawLMBSelection();
    }else if(RMBPressedOnCanvas){
        drawRMBSelection();
    }else{
        drawSelected();
    }
    addBonds();
    drawSequence();
    PLOT = CTX.getImageData(0, 0, CANVAS.width, CANVAS.height);
    requestAnimationFrame(draw);
}


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
    INTERACTED=1
          var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
          if (delta) zoom(delta);
          return evt.preventDefault() && false;
      };

function handleScroll(e){
    INTERACTED=1
        if(e.wheelDelta == 0)return;
	if(e.wheelDelta>0 && ZOOM<2){
		p = mousePosOnCanvas(e);
		ZOOM_POINT = [p.x,p.y];
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
		ZOOM_POINT = [Math.floor(CANVAS.width/2),Math.floor(CANVAS.height/2)]

		ZOOM*=ZOOM_OUT;
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
		if((s%NUM_AAS_IN_LINE)*AA_WIDTH <= x && x <= ((s%NUM_AAS_IN_LINE)+1)*AA_WIDTH){
		    if(Math.floor(s/NUM_AAS_IN_LINE)*AA_HEIGHT<=y && y <= (Math.floor(s/NUM_AAS_IN_LINE)+1)*AA_HEIGHT ){
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
	if(e<s){
		t =s;
		s= e;
		e = t;
	}
		add2arr(POTENTIAL_SSELECTED,s,e);
}
function seqMouseUp(evt){
    INTERACTED=1
	seqPressed = 0;
	POTENTIAL_SSELECTED = []
	end = seqMousePos(evt);
	s = SEQ_SEL_START;
	e = pointedAtAA(end);
	sel = (STRUCTURE_SELECTED.indexOf(s)<0)
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
			array[array.length] = i;
		}
	}
}
function del4arr(array,s,e){
	for(var i=array.length-1; i>=0; i--){
		if(s<=array[i] && array[i]<=e){
			array.splice(i,1);
		}
	}
}

function addSelectionToStructure(array){
    var residues = ACTIVE_STRUCTURE.select({rnums : array});
	if(ACTIVE_STRUCTURE===ORG_STRUCTURE) {
        ACTIVE_STRUCTURE_OBJ.setSelection(residues);
        STRUCTURE_OBJ.setSelection(STRUCTURE.select({rnums:[]}));

    }else {
        ACTIVE_STRUCTURE_OBJ.setSelection(residues);
                if(ORG_STRUCTURE){
                   ORG_STRUCTURE_OBJ.setSelection(ORG_STRUCTURE.select({rnums:[]}));
                }
    }
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
document.addEventListener('mousemove',mouseMoveHandler,false);
document.addEventListener('mouseup',mouseUpHandler,false);

CANVAS.addEventListener('DOMMouseScroll',handleScroll,false);
CANVAS.addEventListener('mousewheel',handleScroll,false);

read_in_di(DI_FILENAME);
read_in_sequence(FASTA_FILENAME);
read_in_dmap();

change_map_mode(0);
draw();



