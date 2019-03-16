


import createGraph, * as Graph from 'ngraph.graph';
import * as fs from 'fs';

import { Transaction} from '@iota/transaction-converter';



export const loadGraph = async ():Promise<Graph.Graph> => {
    
    var graph:Graph.Graph = createGraph();
    var file = JSON.parse((await fs.readFileSync("txData.json")).toString());
    var graphData:any[] = file.data;
    var dt = graphData[0];
    for(var i =0; i < graphData.length;i++){
        addTransactionToGraph(graph, graphData[i]);
    }
    return graph;


}


const addTransactionToGraph = (graph:Graph.Graph, transaction: Transaction) =>{
    var node = graph.getNode(transaction.hash);
    
    if(node === undefined){
        node = graph.addNode(transaction.hash, {x:0,y:0});   
        node.data = {loaded:false}
    }

    if(graph.getNode(transaction.trunkTransaction) === undefined){
        var ttNode = graph.addNode(transaction.trunkTransaction, {x:0,y:0});
        ttNode.data = {loaded:false}
    }
    if(graph.getNode(transaction.branchTransaction) === undefined){
        var btNode = graph.addNode(transaction.branchTransaction, {x:0,y:0});
        btNode.data = {loaded:false}
    }
    if(node.data.loaded === false){ 
        node.data = {loaded: true};
       
        graph.addLink(node.id, transaction.branchTransaction, {d:"b"});
        graph.addLink(node.id, transaction.trunkTransaction, {d:"t"});
    }
  }