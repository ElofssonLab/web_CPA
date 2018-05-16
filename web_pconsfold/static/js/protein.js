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
var STRUCTURE = 0;
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
	VIEWER.clear();
	VIEWER.cartoon('structure.protein',STRUCTURE,{ boundingSpheres: false , color: color.rainbow()});
//      VIEWER.autoZoom();
}
function recolorBFactor(){
	VIEWER.clear();
	VIEWER.cartoon('structure.protein',STRUCTURE,{ boundingSpheres: false , color: color.byResidueProp('tempFactor')});
//      VIEWER.autoZoom();

}

function preset() {
  viewer = VIEWER;
  structure = STRUCTURE;
  viewer.clear();
//  var ligand = structure.select({'rnames' : ['SAH', 'RVP']});
//  viewer.spheres('structure.ligand', ligand, {
//  });
//  viewer.cartoon('structure.protein', structure, { boundingSpheres: false , color: color.byResidueProp('tempFactor')});
  viewer.cartoon('structure.protein', structure, { boundingSpheres: false , color: color.rainbow()});
//  getIndices();

//  var residues = structure.select({rnums : [1,3,8,9,10,13]});
//  viewer.spheres('structure.selected_resids', residues, {});
//  var chainA = structure.select({cname : 'A'});
//  viewer.spheres('structure.selected_chain', chainA, {});
try{
 var _H = Object.keys(STRUCTURE.select({rtype:"H"})._chains[0]._residueMap);
 for(var i=0;i<_H.length; i++){
	HELICES[HELICES.length] = parseInt(_H[i]);
 }}catch(err){
 console.log("No Alpha helices");
}

try{
 var _E = Object.keys(STRUCTURE.select({rtype:"E"})._chains[0]._residueMap);
 for(var i=0;i<_E.length; i++){
	SHEETS[SHEETS.length] = parseInt(_E[i]);
 }
}catch(err){
 console.log("No Beta sheets");
}
}

var SHORT_NAMES = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H',
           'ILE':'I','LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W',
           'TYR':'Y','VAL':'V'};

//Foundation.global.namespace = '';
//$(document).foundation();

function loadServerPDB(idx) {
  var url = PROTEIN_STRUCTURE_FILES[idx];
  console.log(url)
  var iviewer = VIEWER;
  io.fetchPdb(url, function(s) {
      STRUCTURE = s;
//      START_RESIDS[row] = s.chains()[0].residues()[0].num();
      preset();
      iviewer.autoZoom();
  });
};

window.loadServerPDB = loadServerPDB;

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

  if (picked === null || picked.target() === null) {
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
function addSelectionToStructure(arr){
    picked = STRUCTURE.select({rnum : 0});
	console.log(STRUCTURE.select({rnum : 10}));

    var sel = picked.node().structure().createEmptyView();
	for(var i=0; i<array.length; i++){
		console.log(STRUCTURE.select({rnum : 0}));
	    sel.addAtom(STRUCTURE.select({rnum : 0}));
	}
  picked.node().setSelection(sel);
  VIEWER.requestRedraw();
}



    
//document.getElementById('structures_button').click();
loadServerPDB(0);

});


