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
//        if (aas.hasOwnProperty(aa)) {
                aad = aas[aa];
//        console.log(aad)
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
//                console.log(n)
//                console.log(vectorize(c,o));
//                console.log(H)
                aad["H"] = H;
//        }
    }
    var bonds = [];
    for(var aa1=0; aa1<aas.length; aa1++){
//        if(aas.hasOwnProperty(aa1)){
            var aad1 = aas[aa1];
            for(var aa2 =0; aa2<aas.length; aa2++){
//                if(aas.hasOwnProperty(aa2)){
                    var aad2 = aas[aa2];
                    if(!aad2.hasOwnProperty("H") || Math.abs(aa1-aa2)<=1){
                        continue;
                    }
//                    console.log(aad1,aad2);
//                    console.log(1/dist(aad1["O"],aad2["N"]),1/dist(aad1["C"],aad2["H"]),1/dist(aad1["O"],aad2["H"]),1/dist(aad1["C"],aad2["N"]));
                    var nawias= 1/dist(aad1["O"],aad2["N"]) + 1/dist(aad1["C"],aad2["H"]) - 1/dist(aad1["O"],aad2["H"]) - 1/dist(aad1["C"],aad2["N"]);
                    E  = nawias * 27.888 // 332 * 0.084
                    if(E < -.5){
//                    console.log(E);
                        if(!bonds[aa1]){
                            bonds[aa1] = [];
                        }
                        if(!bonds[aa2]){
                            bonds[aa2] = [];
                        }
                        bonds[aa1].push(aa2);
                        bonds[aa2].push(aa1);
                    }
//                }
            }
//        }
//    break
    }
//    return
    var assign = new Array(aas.length);
//    for(var i=0;i<Math.max(Object.keys(bonds)); i++){
//        assign.push();
//    }
//    var bkeys = Object.keys(bonds).sort(function(a,b){return a-b});
    for(var i =0; i<bonds.length; i++){
//        i = bkeys[j]*1;
        bonds_i = bonds[i];
        if(!bonds_i){continue;}
        for(var j =0; j<bonds_i.length;j++){
            b=bonds_i[j];
//            console.log("within",i,b,bonds_i);
//            return
//            b *=1;
            if(Math.abs(b-i)>5){
                //parallel
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
//                            console.log("A",i,l,b,p,k);
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
//    console.log("atomy",assign);

}

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
        showSS(STRUCTURE);
    }else{
        x.setOpacity(0.5);
        //console.log("asd")
    }
   // superposition()
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
    document.getElementById('max_distance').innerHTML = ACTIVE_MAX_DMAP_DISTANCE;
    showSS(ACTIVE_STRUCTURE);

}
function hide_background_model(){
    if(ACTIVE_STRUCTURE === ORG_STRUCTURE){
        var na = STRUCTURE_OBJ;
        //var na2 = STRUCTURE_OBJ;
    }else{
        var na = ORG_STRUCTURE_OBJ;
        //if(ORG_STRUCTURE_FULL_OBJ) {
        //    var na2 = ORG_STRUCTURE_FULL_OBJ;
        //}
        //else{
        //    var na2 = ORG_STRUCTURE_OBJ;
        //}


    }
    if(document.getElementById('org_model_hide').checked){
        na.setOpacity(0);
        //na2.setOpacity(0);
    }else{
        //na2.setOpacity(0.3)
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

function clone_structure(struct){
        new_struct = new pv.mol.Mol()
        var chain = new_struct.addChain(struct._chains[0].name());
        var resids = struct._chains[0]._residues;
        for (var i = 0; i < resids.length; ++i) {
              var r = resids[i];
              var residue = chain.addResidue(r.name(), i);
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
    console.log("spsadd",ORG_STRUCTURE._chains[0]._residues.length,SEQUENCE.length,)
    if(ORG_STRUCTURE._chains[0]._residues.length > SEQUENCE.length){
        hadToCut =1;
        //console.log(ORG_STRUCTURE)

        //ORG_STRUCTURE_FULL._chains = ORG_STRUCTURE._chains
    }

        if(hadToCut){
            new_struct = clone_structure(ORG_STRUCTURE);
            //console.log("rendering")
            //console.log(new_struct)
            //ORG_STRUCTURE_FULL_OBJ = VIEWER.cartoon('org_structure_full.protein',new_struct,{ boundingSpheres: false , color: color.uniform('lightblue')});
            //ORG_STRUCTURE_FULL_OBJ.setOpacity(0.1)
            //ORG_STRUCTURE_OBJ.colorBy(color.uniform('yellow'))
            //console.log("rendering")

         //ORG_STRUCTURE_FULL_OBJ = VIEWER.add('org_structure_full.protein', ORG_STRUCTURE_OBJ)
1
            //ORG_STRUCTURE_FULL_OBJ = VIEWER.cartoon('org_structure_full.protein',ORG_STRUCTURE_FULL,{ boundingSpheres: false , color: color.rainbow()});
            //ORG_STRUCTURE_FULL_OBJ.setOpacity(0.5)
            //ORG_STRUCTURE_FULL_OBJ.colorBy(color.uniform("blue"))

         /*io.fetchPdb(url, function(t) {
          console.log("fetching again")
          ORG_STRUCTURE_FULL = t;
          console.log(ORG_STRUCTURE)
          console.log(ORG_STRUCTURE_FULL)
          deleteOtherChains(ORG_STRUCTURE_FULL);
          if (ORG_STRUCTURE_FULL._chains[0]._residues.length !== SEQUENCE.length) {
              console.log('kartoning',ORG_STRUCTURE_FULL == ORG_STRUCTURE)
              ORG_STRUCTURE_FULL_OBJ = VIEWER.spheres('org_structure_full.protein', ORG_STRUCTURE_FULL, {
                  boundingSpheres: false,
                  color: color.uniform("blue")
              });
              VIEWER.requestRedraw()
              ORG_STRUCTURE_FULL_OBJ.setOpacity(1);
          }
      });*/
    }

    var relevantIndices = getAlignedIndices(SEQUENCE,ORG_STRUCTURE);
    //console.log(relevantIndices)
    var sView = STRUCTURE.select({rindices:relevantIndices,aname:"CA"});
    var osView = ORG_STRUCTURE.select({aname:"CA"});
    pv.mol.superpose(sView,osView);
    STRUCTURE_OBJ.hide()
    ORG_STRUCTURE_OBJ.hide()
    //VIEWER.rm(osView.name())
    preset(ORG_STRUCTURE,1)
    preset(STRUCTURE)
    //VIEWER.centerOn(STRUCTURE)
    VIEWER.autoZoom()
    //x = VIEWER.tube("costam",STRUCTURE)
    //STRUCTURE_OBJ = x
    //console.log(STRUCTURE)

    //VIEWER.clear()
    //VIEWER.requestRedraw()

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

            //STRUCTURE_OBJ.setOpacity(1);
            ORG_DISTANCE_MAP = calculate_dmap(ORG_STRUCTURE);
//            ORG_MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP));
            var maxRow = ORG_DISTANCE_MAP.map(function(row){ return Math.max.apply(Math, row.filter(Boolean)); });//.filter(Boolean);
            ORG_MAX_DMAP_DISTANCE = Math.ceil(Math.max( ...maxRow));
            ORG_DMAP_DISTANCE_RAINBOW = new Rainbow();
            if (ORG_MAX_DMAP_DISTANCE<100){
               ORG_DMAP_DISTANCE_RAINBOW.setNumberRange(0,ORG_MAX_DMAP_DISTANCE+1);
            }else{
                                 //   one_color_step = Math.floor(PROTEIN_LEN/100);    
               1;
            }

        }else{
          STRUCTURE = s;
          //console.log(STRUCTURE)
          ACTIVE_STRUCTURE = STRUCTURE;
//          console.log(STRUCTURE)
//          console.log(PROTEIN_LEN, STRUCTURE._chains[0]._residues.length);
          DISTANCE_MAP = calculate_dmap(STRUCTURE);
          ACTIVE_DISTANCE_MAP = DISTANCE_MAP;
//        console.log(STRUCTURE);
//            MAX_DMAP_DISTANCE = Math.ceil(Math.max.apply(null, ACTIVE_DISTANCE_MAP)); 
            var maxRow = ACTIVE_DISTANCE_MAP.map(function(row){ return Math.max.apply(Math, row); }).filter(Boolean);
//            console.log(...maxRow)
            MAX_DMAP_DISTANCE = Math.ceil(Math.max( ...maxRow));
//            console.log("maxrow",MAX_DMAP_DISTANCE)
            DMAP_DISTANCE_RAINBOW = new Rainbow();
            if (MAX_DMAP_DISTANCE<100){
               DMAP_DISTANCE_RAINBOW.setNumberRange(0,MAX_DMAP_DISTANCE+1);
            }else{
                                 //   one_color_step = Math.floor(PROTEIN_LEN/100);    
               1;
            }
            ACTIVE_MAX_DMAP_DISTANCE = MAX_DMAP_DISTANCE;
            document.getElementById('max_distance').innerHTML = ACTIVE_MAX_DMAP_DISTANCE;
            ACTIVE_DMAP_DISTANCE_RAINBOW = DMAP_DISTANCE_RAINBOW;
            calculateSS(STRUCTURE);
        }
//      START_RESIDS[row] = s.chains()[0].residues()[0].num();
      preset(s,original);
      iviewer.autoZoom();
      superposition(url)


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


