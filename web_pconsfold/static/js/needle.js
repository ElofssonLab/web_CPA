var scoredict = {'B,N': 3, 'S,W': -3, 'G,G': 6, 'X,D': -1, 'E,M': -2, 'A,N': -2, 'A,Y': -2, 'W,Q': -2, 'V,N': -3, 'F,K': -3, 'C,Z': -3, 'V,X': -1, 'G,E': -2, 'E,D': 2, 'F,Z': -3, 'W,P': -4, 'H,B': 0, 'I,T': -1, 'F,D': -3, 'X,M': -1, 'K,V': -2, 'C,Y': -2, '*,X': -4, 'G,D': -1, 'T,N': 0, 'W,W': 11, 'Y,X': -1, 'X,Z': -1, 'S,S': 4, 'X,C': -2, 'X,H': -1, 'K,C': -3, 'E,F': -3, 'N,L': -3, 'Z,P': -1, 'A,K': -1, 'A,B': -2, 'Q,P': -1, 'F,G': -3, 'D,S': 0, 'C,V': -1, 'D,X': -1, 'V,T': 0, 'H,P': -2, 'P,V': -2, 'I,Q': -3, 'F,V': -1, 'W,T': -2, 'H,F': -1, 'P,D': -1, 'Q,R': 1, 'D,Q': 0, 'W,E': -3, 'K,Q': 1, 'Z,S': 0, 'D,F': -3, 'X,G': -1, 'X,L': -1, 'G,Z': -2, 'R,*': -4, 'V,W': -3, 'T,C': -1, 'A,F': -2, 'T,H': -2, 'A,Q': -1, 'Q,T': -1, 'V,F': -1, 'F,C': -2, 'C,R': -3, 'V,P': -2, 'H,T': -2, 'E,L': -3, 'F,R': -3, '*,G': -4, 'I,G': -4, 'C,Q': -3, '*,P': -4, 'Y,V': -1, 'T,A': 0, 'T,V': 0, 'Q,V': -2, 'S,K': 0, 'X,K': -1, 'X,P': -2, 'K,K': 5, 'E,N': 0, 'N,T': 0, 'A,H': -2, 'A,C': 0, 'V,S': -2, 'A,Z': -1, 'M,Z': -1, 'Q,H': 0, 'V,B': -3, 'P,X': -2, 'H,S': -1, 'Q,Y': -1, 'H,X': -1, 'P,N': -2, 'I,Y': -1, 'P,G': -2, 'F,N': -3, 'H,N': 1, '*,M': -4, 'K,H': -1, 'N,W': -4, 'S,Y': -2, 'W,N': -4, 'D,Y': -3, 'E,Q': 2, 'K,Y': -2, 'D,N': 1, 'X,T': 0, 'Y,S': -2, 'G,R': -2, 'D,*': -4, 'A,L': -1, 'L,Z': -3, 'A,G': 0, 'Y,B': -3, 'T,K': -1, 'T,P': -1, 'M,V': 1, 'Q,L': -2, 'E,S': 0, 'H,W': -2, 'I,D': -3, 'K,F': -3, 'L,X': -1, '*,H': -4, 'N,A': -2, 'T,I': -1, 'Q,N': 0, 'K,W': -3, 'W,B': -4, 'S,C': -1, 'X,S': 0, 'N,B': 3, 'P,*': -4, 'X,X': -1, 'Z,L': -3, 'W,*': -4, 'Y,Y': 7, 'G,V': -3, 'L,V': 1, 'A,R': -1, 'Z,M': -1, 'M,R': -1, 'Y,L': -1, 'D,C': -3, 'P,P': 7, 'D,H': -1, 'Q,Q': 5, 'I,V': 3, 'P,F': -4, 'I,A': -1, 'F,F': 6, 'K,T': -1, 'L,T': -1, '*,E': -4, 'Q,B': 0, 'S,Q': 0, 'X,A': 0, 'W,F': 1, 'D,A': -2, 'E,Y': -2, 'K,A': -1, 'X,W': -2, 'Q,S': 0, 'A,D': -2, 'L,R': -2, '*,N': -4, 'T,S': 1, 'A,V': 0, 'T,X': 0, 'M,N': -2, 'Q,D': 0, 'X,E': -1, 'S,X': 0, 'E,P': -1, 'V,V': 4, 'S,G': 0, 'I,S': -2, 'P,M': -2, 'H,D': -1, 'Z,B': 1, 'E,*': -4, 'F,B': -3, 'X,R': -1, 'I,L': 2, 'K,N': 0, 'L,P': -3, 'Y,I': -1, 'N,I': -3, 'T,Q': -1, 'Q,F': -3, 'Z,H': 0, 'S,M': -1, 'E,R': 0, 'W,Z': -3, 'B,*': -4, 'Q,W': -2, 'Z,D': 1, 'G,N': 0, 'L,Y': -1, 'A,X': 0, 'L,N': -3, 'A,S': 1, 'Z,E': 4, 'D,T': -1, 'S,T': 1, 'P,Z': -1, 'Z,A': -1, 'P,S': -1, 'V,R': -3, 'X,*': -4, 'D,K': -1, 'P,H': -2, 'H,C': -3, 'Q,I': -3, 'H,H': 8, 'I,I': 4, '*,Y': -4, 'L,W': -2, 'L,L': 4, 'V,*': -4, 'C,*': -4, 'Z,G': -2, 'D,R': -2, 'S,I': -2, 'X,I': -1, 'D,I': -3, 'E,A': -1, 'K,I': -3, 'Q,K': 1, '*,V': -4, 'G,B': -1, 'T,D': -1, 'A,W': -3, 'Y,R': -2, 'M,F': 0, 'S,P': -1, 'Z,I': -3, 'H,Q': 0, 'E,X': -1, 'Y,N': -2, 'I,P': -3, 'E,C': -4, 'H,G': -2, 'P,E': -1, 'Q,M': 0, 'H,L': -3, 'K,*': -4, 'Z,Z': 4, 'T,B': -1, 'L,S': -2, 'L,H': -3, 'N,Q': 0, 'T,Y': -2, 'K,G': -2, 'S,E': 0, 'E,Z': 4, 'Y,E': -2, 'W,R': -3, 'H,*': -4, 'V,M': 1, 'N,R': 0, 'S,D': 0, 'Z,Q': 3, 'G,F': -3, 'F,Y': 3, 'L,Q': -2, 'M,Y': -1, 'A,P': -1, 'S,N': 1, 'C,L': -1, 'L,F': 0, 'D,W': -4, 'M,B': -3, 'S,L': -2, 'P,R': -2, 'P,K': -1, 'Y,G': -3, 'C,K': -3, 'H,K': -1, 'Q,A': -1, 'I,F': 0, '*,Q': -4, 'K,D': -1, 'N,C': -3, 'L,D': -4, 'Y,K': -2, 'D,Z': 1, 'S,A': 1, 'X,Q': -1, 'W,V': -3, 'E,I': -3, 'V,I': 3, 'Q,C': -3, '*,Z': -4, 'T,G': -2, '*,S': -4, 'B,P': -2, 'T,L': -1, 'L,M': 2, 'A,T': 0, 'C,H': -3, 'L,B': -4, 'S,*': -4, 'Y,Z': -2, 'S,Z': 0, 'P,Y': -3, 'S,H': -1, 'B,Q': 0, 'H,Y': 2, 'I,X': -1, 'E,K': 1, 'C,G': -3, 'I,C': -1, 'Q,E': 2, 'K,R': 2, 'Z,R': 0, 'A,*': -4, 'B,R': -1, 'L,K': -2, 'M,W': -1, 'N,Y': -2, 'T,E': -1, 'B,S': 0, 'E,B': 1, 'N,H': 1, 'V,E': -2, 'Q,G': -2, 'Z,T': -1, 'Y,D': -3, 'B,T': -1, 'F,Q': -3, 'G,Y': -3, 'L,I': 2, 'M,Q': 0, 'R,A': -1, 'C,D': -3, '*,*': 1, 'S,V': -2, 'D,D': 6, 'I,*': -4, '*,D': -4, 'P,C': -3, 'G,X': -1, 'R,B': -1, 'C,C': 9, 'W,K': -3, 'I,N': -3, '*,I': -4, 'B,V': -3, 'K,L': -2, 'M,X': -1, 'N,K': 0, 'L,G': -4, 'M,S': -1, 'R,C': -3, 'X,B': -1, 'Z,W': -3, 'D,B': 4, 'Q,*': -4, 'B,W': -4, 'X,Y': -1, 'R,D': -2, 'V,A': 0, 'W,I': -3, '*,R': -4, '*,K': -4, 'B,X': -1, 'T,T': 5, 'F,M': 0, 'L,E': -3, 'M,M': 5, 'R,E': 0, 'W,H': -2, 'S,R': -1, 'E,W': -3, 'P,Q': -1, 'B,Y': -3, 'H,A': -2, 'Y,A': -2, 'E,H': 0, 'R,F': -3, 'I,K': -3, 'K,Z': 1, '*,T': -4, 'N,E': 0, 'F,*': -4, 'T,M': -1, 'B,Z': 1, 'T,R': -1, 'M,T': -1, 'G,S': 0, 'L,C': -1, 'R,G': -2, 'Y,M': -1, 'X,F': -1, 'N,F': -3, 'Y,Q': -1, 'N,P': -2, 'R,H': 0, 'W,M': -1, 'C,N': -3, 'V,L': 1, 'F,I': 0, 'G,Q': -2, 'L,A': -1, 'M,I': 1, 'R,I': -3, 'W,L': -2, 'N,Z': 0, 'D,G': -1, 'D,L': -4, 'F,X': -1, 'I,R': -3, 'P,B': -2, 'C,M': -1, 'H,E': 0, 'Y,W': 2, 'G,P': -2, 'W,C': -2, '*,A': -4, 'Z,K': 1, 'M,P': -2, 'N,S': 1, 'G,W': -2, 'M,K': -1, 'R,K': 2, 'D,E': 2, 'K,E': 1, 'T,*': -4, '*,W': -4, 'R,L': -2, 'A,I': -1, 'V,Y': -1, 'W,A': -3, 'Y,F': 3, 'T,W': -2, '*,C': -4, 'V,H': -3, 'F,E': -3, 'M,E': -2, 'R,M': -1, 'C,X': -2, 'E,T': -1, 'Y,*': -4, 'H,R': 0, 'P,I': -3, 'F,T': -2, '*,F': -4, 'B,A': -2, 'C,I': -1, 'H,I': -3, 'G,T': -2, 'I,H': -3, 'R,N': 0, 'C,W': -2, 'W,G': -2, 'K,B': 0, 'L,*': -4, 'N,M': -2, 'B,B': 4, 'T,Z': -1, 'M,L': 2, 'G,K': -2, 'M,G': -3, 'K,S': 0, 'E,V': -2, 'X,N': -1, 'N,N': 6, 'B,C': -3, 'V,K': -2, 'N,X': -1, 'R,P': -2, 'A,M': -1, 'N,*': -4, 'V,Z': -2, 'F,W': 1, 'B,D': 4, 'C,F': -2, 'V,D': -3, 'F,A': -2, 'G,I': -4, 'M,A': -1, 'R,Q': 1, 'C,T': -1, 'W,D': -4, 'H,V': -3, 'S,F': -2, 'P,T': -1, 'F,P': -4, 'I,Z': -3, 'B,E': 1, 'C,E': -4, 'H,M': -2, 'I,E': -3, 'G,H': -2, 'R,R': 5, 'K,P': -1, 'C,S': -1, 'B,F': -3, 'Z,C': -3, 'D,V': -3, 'M,H': -2, 'M,C': -1, 'R,S': -1, 'D,M': -3, 'E,E': 5, 'K,M': -1, 'Z,*': -4, 'B,G': -1, 'Z,N': 0, 'V,G': -3, 'R,T': -1, 'A,A': 4, 'V,Q': -2, 'W,Y': 2, '*,B': -4, 'F,S': -2, 'B,H': 0, 'C,B': -3, 'G,M': -3, 'C,P': -3, 'W,X': -2, 'H,Z': 0, 'S,B': 0, 'E,G': -2, 'I,W': -3, 'P,A': -1, 'F,L': 0, 'B,I': -3, 'C,A': 0, 'G,L': -4, 'R,V': -3, 'T,F': -2, 'Z,V': -2, 'Y,P': -3, 'M,D': -3, 'G,C': -3, 'R,W': -3, 'N,D': 1, 'X,V': -1, 'N,V': -3, 'B,K': 0, 'Z,X': -1, 'N,G': 0, 'V,C': -1, 'Z,F': -3, 'R,X': -1, 'M,*': -4, 'A,E': -1, 'Q,X': -1, '*,L': -4, 'Y,H': 2, 'B,L': -4, 'Z,Y': -2, 'D,P': -1, 'G,A': 0, 'R,Y': -2, 'P,W': -4, 'Y,C': -2, 'P,L': -3, 'F,H': -1, 'I,B': -3, 'B,M': -3, 'I,M': 1, 'G,*': -4, 'Y,T': -2, 'R,Z': 0, 'K,X': -1, 'Q,Z': 3, 'W,S': -3};

var SHORT_NAMES = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E','GLN':'Q','GLY':'G','HIS':'H',
           'ILE':'I','LEU':'L','LYS':'K','MET':'M','PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W',
                      'TYR':'Y','VAL':'V'};
                      

function nw_align(s1,s2){
    var UL = [-1,-1];
    var L = [0,-1];
    var U = [-1,0];
    var END = 42;

    /* Adapted from github :  knyga */
    console.log(s1);
    console.log(s2);
    var s1 = s1.replace("-","");//.split("-").join("");
    var s2 = s2.replace("-","");//.split("-").join("");


    //score from var scoredict in index_new.js
    var sp = 1;
    var gap_open = -10;
    var gap_extend = -1;
    var gc = "-";
    var gp = -10;
    
    //generate grid array
    var arr = [];
    //generate path array
    var path = [];    

    for(var i=0;i<=s2.length;i++) {
        arr[i] = [];
        path[i] = [];

        for(var j=0;j<=s1.length;j++) {
            arr[i][j] = null;
            path[i][j] = null;
        }
    }
    
    arr[0][0] = 0;
    path[0][0] = END; 
    
    for(var j=1;j<=s1.length;j++) {
        arr[0][j] = gap_open + (gap_extend * (j - 1));
        path[0][j] = L;
    }

    for(var i=1;i<=s2.length;i++) {
        arr[i][0] = gap_open + (gap_extend * (i - 1));
        path[i][0] = U;
    }
    for(var i=1;i<=s2.length;i++) {
        for(var j=1;j<=s1.length;j++) {
            var ul = arr[i-1][j-1] + scoredict[s2[i-1]+","+s1[j-1]];
            var u = arr[i-1][j] + (path[i-1][j] != U ? gap_open : gap_extend ); //open czy extend
            var l = arr[i][j-1] + (path[i][j-1] != L ? gap_open : gap_extend ); //open czy extend
            arr[i][j] = Math.max(
                ul,
                u,
                l
            );
            if (arr[i][j] == ul){
                path[i][j] = UL;
            } else if (arr[i][j] == u){
                path[i][j] = U;
            }else if (arr[i][j] == l){
                path[i][j] = L;
            }
        }
    }
    
    var as1 = "";
    var as2 = "";
    

    var i = s2.length;
    var j = s1.length;
    var sq1 = [];
    var sq2 = [];
    
    while (path[i][j] != END){
        switch(path[i][j]){
            case U:
                i--;
                sq1.push(gc);
                sq2.push(s2[i]);
                break;
            case UL:
                j--;
                i--;
                sq1.push(s1[j]);
                sq2.push(s2[i]);
                break;
            case L:
                j--;
                sq1.push(s1[j]);
                sq2.push(gc);
                break;            
        }
    }

    
//    console.log(sq1.reverse().join(""));
//    console.log(sq2.reverse().join(""));
    as1 = sq1.reverse().join("");
    as2 = sq2.reverse().join("");
    return [as1,as2];
}

function extractIndices(seqs,plen){
    var s1 = seqs[0];
    var s2 = seqs[1];
    console.log(s1);
    var zipped = [];
    for(var i=0; i<s1.length;i++){
        zipped[zipped.length] = [s1[i],s2[i]];
      };
    var startid = null;
    var endid = null;
    var gaps = [];
    for(var i =0; i<zipped.length; i++){
        el = zipped[i];
        if(el[0]!="-"){
            startid = i;
            endid = startid+plen;
            i++;
            break;
        }
    }
    for(;i<zipped.length;i++){
        el = zipped[i];
        if(el[1]=="-"){
            s = i;
            while(i<zipped.length && i<endid && zipped[i][1]=="-"){
                i++;
            }
            e = i;//-1; to fix later adding stubs
            gaps[gaps.length] = [s,e];
//            console.log("last",zipped[e]);
        }
    }
    return [startid,endid,gaps];

}

function fix_structure(structure,params){
    var sid = params[0];
    var eid = params[1];
    var gaps = params[2];

    var tmp_chain = structure.chains()[0];
    if (sid>=0){
        var ress = [];
        var residues = tmp_chain.residues();
        var c = sid;
        var c_num = 1;
//        console.log(c_num)
        for(var g=0; g<gaps.length; g++){
            gs = gaps[g][0];
            tmp = residues.slice(c,gs);
            for(var t=0; t<tmp.length; t++){
                tmp[t]._num=c_num+t;
                tmp[t]._index=c_num+t-1;
                ress.push(tmp[t]);
            }
            c_num+=t+(gaps[g][1]-gs);
//        console.log(c_num)
            c=gs
//            ress+=tmp;
        }
        tmp = residues.slice(c,eid);
        for(var t=0; t<tmp.length; t++){
                tmp[t]._num=c_num+t;
                tmp[t]._index=c_num+t-1;
                ress.push(tmp[t]);
        }
//        ress+=tmp;
        tmp_chain._residues = ress;
    }
//    console.log(structure);
}
function getAlignedIndices(seq,pstruct){
    var sseq = [];
    var ress = pstruct.chains()[0].residues();
    for(var i=0; i<ress.length; i++){
//        console.log(ress[i])//._isAminoAcid)
        if(ress[i]._isAminoacid){
//            console.log(SHORT_NAMES[ress[i]._name])
            sseq[sseq.length] = SHORT_NAMES[ress[i]._name] || "X";
        }
    }
    out = nw_align(seq,sseq.join(""));
    console.log(out);
    out2 = extractIndices(out,seq.length);
//    console.log(out2);
    fix_structure(pstruct,out2)
    return out2[2];
}
