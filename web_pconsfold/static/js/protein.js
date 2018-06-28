//PROTEIN_STRUCTURE_FILE = "http://troll.cent.uw.edu.pl/dzarmola/files_for_pcons/model3_h.pdb" //{} to be filled by Django

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


function recolorRainbow(){
	//VIEWER.clear();
	//VIEWER.cartoon('structure.protein',ACTIVE_STRUCTURE,{ boundingSpheres: false , color: color.rainbow()});
    ACTIVE_STRUCTURE_OBJ.colorBy(color.rainbow());
//      VIEWER.autoZoom();
}
function recolorBFactor(){
	//VIEWER.clear();
	//VIEWER.cartoon('structure.protein',ACTIVE_STRUCTURE,{ boundingSpheres: false , color: color.byResidueProp('tempFactor')});
        ACTIVE_STRUCTURE_OBJ.colorBy(color.byResidueProp('tempFactor'));

//      VIEWER.autoZoom();

}
window.recolorRainbow = recolorRainbow;
window.recolorBFactor = recolorBFactor;

function preset(structure,original=0) {
   col =  color.rainbow()
    //structure = STRUCTURE;
    if(original){
       col=color.uniform("grey");
       //structure = ORG_STRUCTURE;
    }
  //console.log(structure, original, color)
  viewer = VIEWER;

  //viewer.clear();
//  var ligand = structure.select({'rnames' : ['SAH', 'RVP']});
//  viewer.spheres('structure.ligand', ligand, {
//  });
//  viewer.cartoon('structure.protein', structure, { boundingSpheres: false , color: color.byResidueProp('tempFactor')});

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
//  getIndices();

//  var residues = structure.select({rnums : [1,3,8,9,10,13]});
//  viewer.spheres('structure.selected_resids', residues, {});
//  var chainA = structure.select({cname : 'A'});
//  viewer.spheres('structure.selected_chain', chainA, {});
    if(!original) {
        try {
            var _H = Object.keys(STRUCTURE.select({rtype: "H"})._chains[0]._residueMap);
            for (var i = 0; i < _H.length; i++) {
                HELICES[HELICES.length] = parseInt(_H[i]);
            }
        } catch (err) {
            console.log("No Alpha helices");
        }

        try {
            var _E = Object.keys(STRUCTURE.select({rtype: "E"})._chains[0]._residueMap);
            for (var i = 0; i < _E.length; i++) {
                SHEETS[SHEETS.length] = parseInt(_E[i]);
            }
        } catch (err) {
            console.log("No Beta sheets");
        }
    }else{
        x.setOpacity(0.5);
        //console.log("asd")

    }
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
    }else{
        ACTIVE_STRUCTURE = STRUCTURE;
        ACTIVE_STRUCTURE_OBJ = STRUCTURE_OBJ;
        STRUCTURE_OBJ.colorBy(color.rainbow())
            STRUCTURE_OBJ.setOpacity(1);
        ORG_STRUCTURE_OBJ.colorBy(color.uniform("grey"))
            ORG_STRUCTURE_OBJ.setOpacity(0.5);
        ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
    }

}
function hide_background_model(){
    if(ACTIVE_STRUCTURE === ORG_STRUCTURE){
        var na = STRUCTURE_OBJ;
    }else{
        var na = ORG_STRUCTURE_OBJ;

    }
    if(document.getElementById('org_model_hide').checked){
        na.setOpacity(0);
    }else{
        na.setOpacity(0.5);
    }
}

window.hide_background_model = hide_background_model;

window.change_active_model = change_active_model;

var SHORT_NAMES = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H',
           'ILE':'I','LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W',
           'TYR':'Y','VAL':'V'};

//Foundation.global.namespace = '';
//$(document).foundation();

function deleteOtherChains(structure,chain=""){//,start_resid,end_resid){
    chain = chain || PDB_CHAIN;
    if(!chain){return;}
    chain = chain.replace(/^\s+|\s+$/g, '');
    if(!structure.chain(chain)){
        console.log("No such structure/no such chain!");
        return;
    }
    var tmp_chain = structure.chain(chain);
/*    if (start_resid && end_resid){
        var ress = [];
        var residues = tmp_chain.residues();
        for(r=0; r<residues.length; r++){
            if(residues[r].num()>=start_resid && residues[r].num()<=end_resid){
                ress.push(residues[r]);
            }
        }
        tmp_chain._residues = ress;
    }*/
    structure._chains = [tmp_chain];
//    START_RESIDS[row] = STRUCTURES[row].chains()[0].residues()[0].num();
/*    VIEWERS[row].clear();
    for(h=0; h<highlighted.length; h++){
        if(highlighted[h].row == row){
            highlighted.splice(h,1);
        }
    }
    loadPDBSeq(row);
    getIndices();    
    VIEWERS[row].autoZoom();*/
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
        getAlignedIndices(SEQUENCE,ORG_STRUCTURE);
        ORG_DISTANCE_MAP = calculate_dmap(ORG_STRUCTURE);
               ORG_MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP)); 
            ORG_DMAP_DISTANCE_RAINBOW = new Rainbow();
            if (ORG_MAX_DMAP_DISTANCE<100){
               rainbow.setNumberRange(0,ORG_MAX_DMAP_DISTANCE+1);
            }else{
                                 //   one_color_step = Math.floor(PROTEIN_LEN/100);    
               1;
            }
        }else{
          STRUCTURE = s;
          ACTIVE_STRUCTURE = STRUCTURE;
//          console.log(STRUCTURE)
//          console.log(PROTEIN_LEN, STRUCTURE._chains[0]._residues.length);
          DISTANCE_MAP = calculate_dmap(STRUCTURE);
          ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
//        console.log(STRUCTURE);
            MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP)); 
            DMAP_DISTANCE_RAINBOW = new Rainbow();
            if (MAX_DMAP_DISTANCE<100){
               rainbow.setNumberRange(0,MAX_DMAP_DISTANCE+1);
            }else{
                                 //   one_color_step = Math.floor(PROTEIN_LEN/100);    
               1;
            }
            ACTIVE_MAX_DMAP_DISTANCE = MAX_DMAP_DISTANCE;
            ACTIVE_DMAP_DISTANCE_RAINBOW = DMAP_DISTANCE_RAINBOW;
                                      
        }
//      START_RESIDS[row] = s.chains()[0].residues()[0].num();
      preset(s,original);
      iviewer.autoZoom();
  });
};

window.loadServerPDB = loadServerPDB;
window.preset = preset;

/*function change_model_file(file_idx){
        read_in_dmap(DMAP_FILENAMES[file_idx]);
        loadServerPDB(file_idx);
        addBonds();
}*/



VIEWER = pv.Viewer(document.getElementById('viewer1'), { 
	width : '500', height: '500', antialias : true, fog : true,
	outline : true, quality : 'high', style : 'phong',
	selectionColor : '#f088', transparency : 'screendoor', 
	background : '#ddd', animateTime: 500, doubleClick : null
    });

VIEWER.on('click', function(picked, ev) {
 //console.log(Object.keys(STRUCTURE.select({rtype:"H"})._chains[0]._residueMap));
 //console.log(Object.keys(STRUCTURE.select({rtype:"E"})._chains[0]._residueMap));
// console.log(Object.keys(STRUCTURE.select({rtype:"H"})._residueView));
// console.log(STRUCTURE.select({rnum:79}));
//console.log()
    //console.log(STRUCTURE)
  if (picked === null || picked.target() === null || picked.target().structure() !== ACTIVE_STRUCTURE) {
    return;
  }
  // don't to anything if the clicked structure does not have an atom.
  if (picked.node().structure === undefined) {
    return;
  }
//  console.log()
//  console.log(picked);
  var resnum=picked.target()._residue._num;
  // when the shift key is pressed, extend the selection, otherwise
  // only select the clicke atom.
  var extendSelection = ev.shiftKey;
  var sel;
  if (extendSelection) {
    var sel = picked.node().selection();
//    add2SS(resnum);
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

//window.addSelectionToStructure = addSelectionToStructure

loadServerPDB(1);
//document.getElementById('structures_button').click();
if (PROTEIN_STRUCTURE_FILES[0] !== ""){
    loadServerPDB(0,1);
}

});


