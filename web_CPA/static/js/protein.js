// (C) Aleksandra Jarmolinska 2018-2019 a.jarmolinska@mimuw.edu.pl

requirejs.config({
  'baseUrl' : '../../static/js/src' ,
  // uncomment the following commented-out block to test the contatenated, 
  // minified PV version. Grunt needs to be run before for this to work.
  /*
  paths : {
    pv : '/js/bio-pv.min'
  }
  */
});


// on purpose outside of the require block, so we can inspect the viewer object 
// from the JavaScript console.
//var viewer;
var VIEWER = 0;
var ORG_STRUCTURE = 0;
var ORG_STRUCTURE_OBJ = 0;
var ORG_STRUCTURE_FULL = 0;
var ORG_STRUCTURE_FULL_OBJ = 0;
var hadToCut = 0;
var STRUCTURE = 0;
var STRUCTUE_OBJ = 0;
var ACTIVE_STRUCTURE = 0;
var ACTIVE_STRUCTURE_OBJ = 0;
var READY = true;
var START_RESIDS = [0,0];

var pv;
require(['pv'], function(PV) {

pv = PV;
var io = pv.io;
var viewpoint = pv.viewpoint;
var color = pv.color;

var structure;

function dist(p1,p2){
    return Math.sqrt((p1[0]-p2[0])**2+(p1[1]-p2[1])**2+(p1[2]-p2[2])**2)
}
function vectorize(c,o){
    d = dist(c,o);
    s = d/0.976;
//    console.log([(c[0]-o[0])/s,(c[1]-o[1])/2,(c[2]-o[2])/s]);
    return [(c[0]-o[0])/s,(c[1]-o[1])/2,(c[2]-o[2])/s];
}

function add(a,b){
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
}

function calculateSS(structure){
    var residues = structure._chains[0]._residues;
    aas = [];
    for(var r=0; r<residues.length; r++){
        aas[r] = {};
        atoms = residues[r]._atoms;
        for(var a=0 ; a<atoms.length; a++){
            if(atoms[a]._name === "N"){
                aas[r]["N"] = atoms[a].pos();
            }
            if(atoms[a]._name === "C"){
                aas[r]["C"] = atoms[a].pos();
            }
            if(atoms[a]._name === "O"){
                aas[r]["O"] = atoms[a].pos();
            }
        }
    }
    for (var aa in aas) {
                aad = aas[aa];
                if(!aad.hasOwnProperty("N") || !aad.hasOwnProperty("C") || !aad.hasOwnProperty("O")){
                    continue;
                }
                if(aas[aa-1]){
                    var ndb = aas[aa-1];
                }else{
                    continue;
                }
                c = ndb["C"];
                o = ndb["O"];
                n = aad["N"];
                H = add(n, vectorize(c,o));

                aad["H"] = H;
    }
    var bonds = [];
    for(var aa1=0; aa1<aas.length; aa1++){
            var aad1 = aas[aa1];
            for(var aa2 =0; aa2<aas.length; aa2++){
                    var aad2 = aas[aa2];
                    if(!aad2.hasOwnProperty("H") || Math.abs(aa1-aa2)<=1){
                        continue;
                    }
                    var nawias= 1/dist(aad1["O"],aad2["N"]) + 1/dist(aad1["C"],aad2["H"]) - 1/dist(aad1["O"],aad2["H"]) - 1/dist(aad1["C"],aad2["N"]);
                    E  = nawias * 27.888 // 332 * 0.084
                    if(E < -.5){
                        if(!bonds[aa1]){
                            bonds[aa1] = [];
                        }
                        if(!bonds[aa2]){
                            bonds[aa2] = [];
                        }
                        bonds[aa1].push(aa2);
                        bonds[aa2].push(aa1);
                    }
            }
    }
    var assign = new Array(aas.length);
    for(var i =0; i<bonds.length; i++){
        bonds_i = bonds[i];
        if(!bonds_i){continue;}
        for(var j =0; j<bonds_i.length;j++){
            b=bonds_i[j];
            if(Math.abs(b-i)>5){
                cnt =2;
                l = i+cnt;
                p = b;
                k = 1;
                while(bonds[l] && bonds[l].indexOf(p)>=0){
                    if(k%2){
                        p+=cnt;
                    }else{
                        l+=cnt;
                    }
                    k+=1;
                }
                if(k>=3){
                    for(var tmp=0;tmp<k;tmp++){
                        assign[i+tmp] = "E";
                        assign[b+tmp] = "E";
                    }
                }
            
            }
            //antiparallel
            cnt = 2;
            l = i;
            p = b;
            k=1;
            while(Math.abs(l-p)>=3 && bonds[p-cnt] && bonds[p-cnt].indexOf(l+cnt)>=0){
                if(!(bonds[p-1]) || bonds[p-1].indexOf(l+1)<0){
                    l+=cnt;
                    p-=cnt;
                    k+=cnt;
                }else{
                    break;
                }

            }
            if(k>=3){
                   for(var tmp=0;tmp<k;tmp++){
                        assign[i+tmp] = "A";
                        assign[b-tmp] = "A";
                   }
            }
            //pi helix
            if (Math.abs(b-i) == 3){
                if(bonds[i+1] && bonds[i+1].indexOf(i+4)>=0){
                    for(var x=1;x<4;x++){
                        assign[i+x] = "P";
                    }
                }
            }
            if (Math.abs(b-i) == 5){
                if(bonds[i+1] && bonds[i+1].indexOf(i+6)>=0){
                    for(var x=1;x<6;x++){
                        assign[i+x] = "L";
                    }
                }
            }
            if (Math.abs(b-i) == 4){
                if(bonds[i+1] && bonds[i+1].indexOf(i+5)>=0){
                    for(var x=1;x<5;x++){
                        assign[i+x] = "H";
                    }
                }
            }
            
            
        }
    
    }
    for(var a=0;a<assign.length; a++){
        if(assign[a] === "H" || assign[a] === "L" || assign[a] === "P"){
            structure._chains[0]._residues[a]._ss = "H";
        }
        if(assign[a] === "E" || assign[a] === "A"){
            structure._chains[0]._residues[a]._ss = "E";
        }
    }

}

function recolorRainbow(){
    ACTIVE_STRUCTURE_OBJ.colorBy(color.rainbow());
}
function recolorBFactor(){
        ACTIVE_STRUCTURE_OBJ.colorBy(color.byResidueProp('tempFactor'));
}
window.recolorRainbow = recolorRainbow;
window.recolorBFactor = recolorBFactor;

function preset(structure,original=0) {
   col =  color.rainbow()
    if(original){
       col=color.uniform("grey");
    }
  viewer = VIEWER;
  if(original){
      var x = viewer.cartoon('org_structure.protein', structure, { boundingSpheres: false , color: col});

      ORG_STRUCTURE_OBJ = x;
  }else{
      var x = viewer.cartoon('structure.protein', structure, { boundingSpheres: false , color: col});
      console.log("preset",x);
      STRUCTURE_OBJ = x;
      ACTIVE_STRUCTURE_OBJ = STRUCTURE_OBJ;
  }
  addSelectionToStructure(STRUCTURE_SELECTED);
    if(!original) {
        showSS(STRUCTURE);
    }else{
        x.setOpacity(0.5);
    }
}

function showSS(structure){
    HELICES = [];
    SHEETS = [];
        try {
            var _H = Object.keys(structure.select({rtype: "H"})._chains[0]._residueMap);
            for (var i = 0; i < _H.length; i++) {
                HELICES.push(parseInt(_H[i]));
            }
        } catch (err) {
            console.log("No Alpha helices");
        }

        try {
            var _E = Object.keys(structure.select({rtype: "E"})._chains[0]._residueMap);
            for (var i = 0; i < _E.length; i++) {
                SHEETS.push(parseInt(_E[i]));
            }
        } catch (err) {
            console.log("No Beta sheets");
        }
        addSSToAxes()

}


function change_active_model(to_original){
    if(to_original){
        ACTIVE_STRUCTURE = ORG_STRUCTURE;
        ACTIVE_STRUCTURE_OBJ = ORG_STRUCTURE_OBJ;
        ORG_STRUCTURE_OBJ.colorBy(color.rainbow());
            ORG_STRUCTURE_OBJ.setOpacity(1);
        STRUCTURE_OBJ.colorBy(color.uniform("grey"))
            STRUCTURE_OBJ.setOpacity(0.5);
        ACTIVE_DISTANCE_MAP = ORG_DISTANCE_MAP;
        ACTIVE_MAX_DMAP_DISTANCE = ORG_MAX_DMAP_DISTANCE;
        ACTIVE_DMAP_DISTANCE_RAINBOW = ORG_DMAP_DISTANCE_RAINBOW;
    }else{
        ACTIVE_STRUCTURE = STRUCTURE;
        ACTIVE_STRUCTURE_OBJ = STRUCTURE_OBJ;
        STRUCTURE_OBJ.colorBy(color.rainbow())
            STRUCTURE_OBJ.setOpacity(1);
        ORG_STRUCTURE_OBJ.colorBy(color.uniform("grey"))
            ORG_STRUCTURE_OBJ.setOpacity(0.5);
        ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
        ACTIVE_MAX_DMAP_DISTANCE = MAX_DMAP_DISTANCE;
        ACTIVE_DMAP_DISTANCE_RAINBOW = DMAP_DISTANCE_RAINBOW;
    }
    document.getElementsByName('max_distance').forEach(function(elem){
        elem.innerHTML = ACTIVE_MAX_DMAP_DISTANCE;
    });
    showSS(ACTIVE_STRUCTURE);

}
function hide_background_model(){
    if(ACTIVE_STRUCTURE === ORG_STRUCTURE){
        var na = STRUCTURE_OBJ;
        var na2 = STRUCTURE_OBJ;
    }else{
        var na = ORG_STRUCTURE_OBJ;
        if(ORG_STRUCTURE_FULL_OBJ) {
            var na2 = ORG_STRUCTURE_FULL_OBJ;
        }
        else{
            var na2 = ORG_STRUCTURE_OBJ;
        }


    }
    if(document.getElementById('org_model_hide').checked){
        na.setOpacity(0);
        na2.setOpacity(0);
    }else{
        na2.setOpacity(0.3)
        na.setOpacity(0.5);
    }
}

window.hide_background_model = hide_background_model;

window.change_active_model = change_active_model;

var SHORT_NAMES = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H',
           'ILE':'I','LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W',
           'TYR':'Y','VAL':'V'};

function deleteOtherChains(structure,chain=""){//,start_resid,end_resid){
    chain = chain || PDB_CHAIN;
    if(!chain){return;}
    chain = chain.replace(/^\s+|\s+$/g, '');
    if(!structure.chain(chain)){
        console.log("No such structure/no such chain!");
        return;
    }
    var tmp_chain = structure.chain(chain);
    structure._chains = [tmp_chain];
}

function clone_structure(struct){
        var new_struct = new pv.mol.Mol()
        var chain = new_struct.addChain(struct._chains[0].name());
        var resids = struct._chains[0]._residues;
        for (var i = 0; i < resids.length; ++i) {
              var r = resids[i];
              if(!r._isAminoacid){//  && !r._name in SHORT_NAMES){
                continue;
              }
              var residue = chain.addResidue(r.name(), i);
              residue._isAminoacid = true;
              residue._ss = r._ss;
              for (var j=0 ; j<r.atoms().length; ++j){
                  var at = r.atoms()[j]
                  residue.addAtom(at.name(), at._pos, at._element);
              }
        }
        return new_struct
}

function superposition(url){
    if(!ORG_STRUCTURE){
        return
    }
    var org_length=0;
    for(var i=0; i<ORG_STRUCTURE._chains[0]._residues.length; i++){
                if(ORG_STRUCTURE._chains[0]._residues[i]._isAminoacid  /*|| ORG_STRUCTURE._chains[0]._residues[i]._name in SHORT_NAMES*/) org_length++;
    }
    if(org_length > SEQUENCE.length){
            hadToCut =1;
            var new_struct = clone_structure(ORG_STRUCTURE);
    }
    VIEWER.rm(ORG_STRUCTURE_OBJ.name())
    VIEWER.rm(STRUCTURE_OBJ.name())
    console.log(ORG_STRUCTURE)
    ORG_STRUCTURE._chains[0]._cachedTraces = [];
    var relevantIndices = getAlignedIndices(SEQUENCE,ORG_STRUCTURE);
    var sView = STRUCTURE.select({rindices:relevantIndices,aname:"CA"});
    var osView = ORG_STRUCTURE.select({aname:"CA"});
    ORG_DISTANCE_MAP = calculate_dmap(ORG_STRUCTURE);
    var maxRow = ORG_DISTANCE_MAP.map(function(row){ return Math.max.apply(Math, row.filter(Boolean)); });//.filter(Boolean);
    ORG_MAX_DMAP_DISTANCE = Math.ceil(Math.max( ...maxRow));
    ORG_DMAP_DISTANCE_RAINBOW = new Rainbow();
    if(ORG_MAX_DMAP_DISTANCE<=0){
        PROTEIN_STRUCTURE_FILES = "";
        ORG_STRUCTURE = 0;
        var x = document.getElementsByClassName("only_when_pdb");
        for(var i =0; i<x.length; i++){
            x[i].style.display = "none";
        }
        return;
    }
    if (ORG_MAX_DMAP_DISTANCE<100){
        ORG_DMAP_DISTANCE_RAINBOW.setNumberRange(0,ORG_MAX_DMAP_DISTANCE+1);
    }
    pv.mol.superpose(sView,osView)
	rms = rmsd(osView,sView);
	document.getElementById("rmsd").innerHTML = Math.round(rms[0] * 100) / 100;
	document.getElementById("residues_used").innerHTML = rms[1];
    preset(ORG_STRUCTURE,1)
    preset(STRUCTURE)
    VIEWER.autoZoom()
}

function rmsd(view1,view2){
        var res1 = view1._chains[0]._residues;
        var res2 = view2._chains[0]._residues;

        var num_matched = res1.length;

        var sum = 0;
        for(var i=0; i<num_matched; i++){
                p1 = res1[i]._atoms[0]._atom._pos;
                p2 = res2[i]._atoms[0]._atom._pos;
                sum += dist_sq(p1,p2);
        }
        return [Math.sqrt(sum/num_matched),num_matched];
}


function dist_sq(p1,p2){
        d = (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2;
        return d;
}



function loadServerPDB(idx,original=0) {
 //TODO needs some fixes for multichain structures
  var url = PROTEIN_STRUCTURE_FILES[idx];
  console.log(url)
  var iviewer = VIEWER;
  io.fetchPdb(url, function(s) {
        if(original){
            ORG_STRUCTURE =s;
            deleteOtherChains(ORG_STRUCTURE);
	    ORG_DISTANCE_MAP = calculate_dmap(ORG_STRUCTURE);
	    var maxRow = ORG_DISTANCE_MAP.map(function(row){ return Math.max.apply(Math, row.filter(Boolean)); });//.filter(Boolean);
	    ORG_MAX_DMAP_DISTANCE = Math.ceil(Math.max( ...maxRow));
	    ORG_DMAP_DISTANCE_RAINBOW = new Rainbow();
	    if(ORG_MAX_DMAP_DISTANCE<=0){
		PROTEIN_STRUCTURE_FILES = "";
		ORG_STRUCTURE = 0;
		var x = document.getElementsByClassName("only_when_pdb");
		for(var i =0; i<x.length; i++){
		    x[i].style.display = "none";
		}
		return;
	    }
	    if (ORG_MAX_DMAP_DISTANCE<100){
		ORG_DMAP_DISTANCE_RAINBOW.setNumberRange(0,ORG_MAX_DMAP_DISTANCE+1);
	    } 

        }else{
          STRUCTURE = s;
          ACTIVE_STRUCTURE = STRUCTURE;
          DISTANCE_MAP = calculate_dmap(STRUCTURE);
          ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
            var maxRow = ACTIVE_DISTANCE_MAP.map(function(row){ return Math.max.apply(Math, row); }).filter(Boolean);
            MAX_DMAP_DISTANCE = Math.ceil(Math.max( ...maxRow));
            DMAP_DISTANCE_RAINBOW = new Rainbow();
            if (MAX_DMAP_DISTANCE<100){
               DMAP_DISTANCE_RAINBOW.setNumberRange(0,MAX_DMAP_DISTANCE+1);
            }
            ACTIVE_MAX_DMAP_DISTANCE = MAX_DMAP_DISTANCE;
        document.getElementsByName('max_distance').forEach(function(elem){
            elem.innerHTML = ACTIVE_MAX_DMAP_DISTANCE;
        });
            ACTIVE_DMAP_DISTANCE_RAINBOW = DMAP_DISTANCE_RAINBOW;
            calculateSS(STRUCTURE);
        }
      preset(s,original);
      iviewer.autoZoom();
      superposition(url)


  });

};

window.loadServerPDB = loadServerPDB;
window.preset = preset;

VIEWER = pv.Viewer(document.getElementById('viewer1'), { 
	width : 'auto', height: '500', antialias : true, fog : true,
	outline : true, quality : 'high', style : 'phong',
	selectionColor : '#f088', transparency : 'screendoor', 
	background : '#ddd', animateTime: 500, doubleClick : null
    });

VIEWER.on('click', function(picked, ev) {
  if (picked === null || picked.target() === null || picked.target().structure() !== ACTIVE_STRUCTURE) {
    return;
  }
  // don't to anything if the clicked structure does not have an atom.
  if (picked.node().structure === undefined) {
    return;
  }
  var resnum=picked.target()._residue._num;
  // when the shift key is pressed, extend the selection, otherwise
  // only select the clicke atom.
  var extendSelection = ev.shiftKey;
  var sel;
  if (extendSelection) {
    var sel = picked.node().selection();
  } else {
    var sel = picked.node().structure().createEmptyView();
    delSS();
  }
  // in case atom was not part of the view, we have to add it, because
  // it wasn't selected before. Otherwise removeAtom took care of it
  // and we don't have to do anything.
  del4SS(resnum);

  if (!sel.removeAtom(picked.target(), true)) {
    sel.addAtom(picked.target());
    add2SS(resnum);
  }
  picked.node().setSelection(sel);
  VIEWER.requestRedraw();
});
function addSelectionToStructure_old(arr){
    picked = ACTIVE_STRUCTURE.select({rnum : 0});
	console.log("adding to structute",STRUCTURE.select({rnum : 10}));

    var sel = picked.node().structure().createEmptyView();
	for(var i=0; i<array.length; i++){
		console.log(STRUCTURE.select({rnum : 0}));
	    sel.addAtom(ACTIVE_STRUCTURE.select({rnum : 0}));
	}
  picked.node().setSelection(sel);
  VIEWER.requestRedraw();
}

loadServerPDB(1);
if (PROTEIN_STRUCTURE_FILES[0] !== ""){
    loadServerPDB(0,1);
}
});

