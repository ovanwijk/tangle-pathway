

import createGraph, * as Graph from 'ngraph.graph';
import { TransactionsToApprove } from '@iota/transaction-converter/typings/types';


interface PreviousBranch {
    node: Graph.Node;
    prevBranch?:PreviousBranch;
    trunked:Boolean;//Means visted the trunk or not in case of Y

}
//A quick lookup table for ease of use
const letters = ['y','E','b','t'];
export var lookupTable:any ={}
export var reverseLookup:any = {};
const setLookupTable = () => {    
    var counter = 0;
    for(var a1 = 0; a1 < letters.length;a1++){
        for(var a2 = 0; a2 < letters.length;a2++){
            for(var a3 = 0; a3 < letters.length;a3++){
                for(var a4 = 0; a4 < letters.length;a4++){
                    var byteCombo = letters[a1] + letters[a2] + letters[a3] + letters[a4];
                    lookupTable[byteCombo] = counter;
                    reverseLookup[counter] = byteCombo;
                    counter+=1;
                }
            }
        }
    }
    console.debug("Lookup table set");
}
setLookupTable();



/*
    Rather did this recursive but... javascript doesnt accross the board deal with tail recursing
    there we go ifs and loops.

    Also this is by far the most efficient approach, bitshifting etc should make it much faster instead of strings
    and lookup tables.
*/
export const encodeGraph = (graph:Graph.Graph, topNode:Graph.Node):string => {
    var result = "";
    console.debug("Start endcoding")
    var t= Date.now();
    var linksPathsVisited = 0;
    var finished = false;
    var currentNode: PreviousBranch = {node: topNode, trunked:false};
    
    //Keeps track of visited nodes
    var visited:any = {};
    do{
        //Only care about outgoing links
        var outGoingLinks = currentNode.node.links.filter(lnk => lnk.fromId == currentNode.node.id);
        visited[currentNode.node.id.toString()] = true;
        //At the end of a graph.
        if(outGoingLinks.length ===0){
           
            result += "E";
            if(currentNode.prevBranch){
                currentNode = currentNode.prevBranch
            }else{
                finished = true;
            }
           
        }else{
           if(outGoingLinks.length == 2 && currentNode.trunked === false){
                result += "y"
                linksPathsVisited += 2;              
                for(var i = 0; i < outGoingLinks.length; i++){
                    if(outGoingLinks[i].data.d === "t"){
                        currentNode.trunked = true;
                        var n = graph.getNode(outGoingLinks[i].toId);
                        if(n){
                            if(visited[n.id.toString()] !== true){
                                currentNode = {
                                    node:n ,
                                    prevBranch:currentNode, 
                                    trunked:false}
                            }else{
                                //If already visited exit
                                result += "E"
                                if(currentNode.prevBranch){
                                    currentNode = currentNode.prevBranch
                                }
                            }
                        }else{
                            console.debug("No node")
                        }
                        break;
                    }
                }
           }else{
                if(outGoingLinks.length > 2){
                    console.error("To many links");
                }
                for(var i = 0; i < outGoingLinks.length; i++){
                    if(outGoingLinks[i].data.d === "t" && currentNode.trunked === false){                       
                            result += "t";
                            linksPathsVisited += 1;
                            var n = graph.getNode(outGoingLinks[i].toId);
                            if(n){
                                if(visited[n.id.toString()] !== true){
                                    //Just change current node but don't change the previousBranch
                                    currentNode = {
                                        node:n,
                                        prevBranch:currentNode.prevBranch, 
                                        trunked:false}
                                }else{
                                        result += "E"
                                        if(currentNode.prevBranch){
                                            currentNode = currentNode.prevBranch
                                        }else{
                                            console.log("Infinity 2");
                                        }
                                }
                            }
                            break;             
                    }
                    if(outGoingLinks[i].data.d === "b"){
                        if(currentNode.trunked === false){
                            linksPathsVisited += 1;
                            result += "b";
                        }
                        var n = graph.getNode(outGoingLinks[i].toId);
                        if(n){
                            if(visited[n.id.toString()] !== true){
                                //Just change current node but don't change the previousBranch
                                currentNode = {
                                    node:n,
                                    prevBranch:currentNode.prevBranch, 
                                    trunked:false}
                            }else{
                                    result += "E"
                                    if(currentNode.prevBranch){
                                        currentNode = currentNode.prevBranch
                                    }else{
                                        console.log("Infinity 3");
                                    }
                            }
                            
                        }
                        break;
                    }
                }
           }
        }
    }while(!finished);

    console.log("Text encoded result. Nodes: ", graph.getNodesCount(), " Links:", linksPathsVisited );
  
    //Padding to a full byte.
    for(var i = 0; i < result.length % 4; i++){
        result += "E";
    }
    console.log("Encoding result is ", result.length/4, " bytes")
    console.log("Encoding took:", Date.now() - t, "ms");
    var newBuffer = new Uint8Array(result.length/4);
    var bufferString = ""; //Hex data
    for(var i = 0; i < result.length; i += 4){
        var lookupByte = lookupTable[(result[i] +result[i + 1] +result[i + 2] +result[i+3] )]
        newBuffer[Math.floor(i/4)] = lookupByte;
        bufferString += lookupByte.toString(16); //Convert to HEX
    }
    
    return result;
}

//Because it is an encoding, to fully reconstruct the graph it requires
//the tangle to actually do so.

//TODO actually implement it.
export const decodingIterator = (encodedGraph:string, iteratorCallback:(hash:string) => TransactionsToApprove) => {

}


export const plainDecoder = () =>{

}

